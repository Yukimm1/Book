import requests
from django.conf import settings
from django.core.cache import cache
from rest_framework import generics, permissions, status, viewsets
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Estante, LibroPersonal
from .serializers import EstanteSerializer, LibroPersonalSerializer, RegisterSerializer

GOOGLE_BOOKS_URL = "https://www.googleapis.com/books/v1/volumes"


class RegisterView(generics.CreateAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = "register"


class EstanteViewSet(viewsets.ModelViewSet):
    serializer_class = EstanteSerializer

    def get_queryset(self):
        return Estante.objects.filter(usuario=self.request.user)

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


class LibroPersonalViewSet(viewsets.ModelViewSet):
    serializer_class = LibroPersonalSerializer

    def get_queryset(self):
        qs = LibroPersonal.objects.filter(usuario=self.request.user).select_related("estante")
        estante = self.request.query_params.get("estante")
        if estante and estante.isdigit():
            qs = qs.filter(estante_id=estante)
        return qs

    def perform_create(self, serializer):
        serializer.save(usuario=self.request.user)


def _normalizar(item):
    info = item.get("volumeInfo", {})
    portada = info.get("imageLinks", {}).get("thumbnail", "").replace("http://", "https://")
    return {
        "google_id": item.get("id", ""),
        "titulo": info.get("title", "Sin título"),
        "autor": ", ".join(info.get("authors", [])) or "Autor desconocido",
        "sinopsis": info.get("description", ""),
        "portada": portada,
        "paginas_totales": info.get("pageCount", 0),
    }


def _consultar_google(q, max_results=12, order_by="relevance"):
    params = {"q": q, "maxResults": max_results, "printType": "books", "orderBy": order_by}
    if settings.GOOGLE_BOOKS_API_KEY:
        params["key"] = settings.GOOGLE_BOOKS_API_KEY
    resp = requests.get(GOOGLE_BOOKS_URL, params=params, timeout=8)
    resp.raise_for_status()
    return [_normalizar(i) for i in resp.json().get("items", [])]


class BuscarLibrosView(APIView):

    def get(self, request):
        q = request.query_params.get("q", "").strip()
        if len(q) < 2 or len(q) > 100:
            return Response(
                {"detail": "El término debe tener entre 2 y 100 caracteres."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        try:
            return Response(_consultar_google(q))
        except requests.RequestException:
            return Response(
                {"detail": "No se pudo consultar Google Books."},
                status=status.HTTP_502_BAD_GATEWAY,
            )


class LibrosDestacadosView(APIView):
    permission_classes = [permissions.AllowAny]
    CONSULTAS = ["novelas bestseller", "harry potter", "el principito", "best seller novel"]

    def get(self, request):
        data = cache.get("destacados")
        if not data:
            data = []
            for q in self.CONSULTAS:
                try:
                    libros = _consultar_google(q, 12)
                except requests.RequestException:
                    continue
                data = [l for l in libros if l["portada"]][:8]  
                if data:
                    break
            if data:
                cache.set("destacados", data, 3600)
        return Response(data)
