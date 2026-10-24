# En backend/library/views.py REEMPLAZA la clase LibrosDestacadosView por este bloque
# (puedes dejar CATEGORIAS justo encima de la clase).

CATEGORIAS = {
    "Todos": ["novelas bestseller", "harry potter", "el principito"],
    "Ficción": ["novelas de ficción", "fiction novels"],
    "Desarrollo Personal": ["desarrollo personal", "hábitos atómicos"],
    "Ciencia Ficción": ["ciencia ficción novelas", "science fiction novels"],
    "Historia": ["historia libros", "world history"],
    "Negocios": ["negocios emprendimiento", "business books"],
}


class LibrosDestacadosView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        cat = request.query_params.get("cat", "Todos")
        if cat not in CATEGORIAS:  # valida contra la lista permitida
            cat = "Todos"
        clave = "destacados_" + cat.replace(" ", "_")
        data = cache.get(clave)
        if not data:
            data = []
            for q in CATEGORIAS[cat]:
                try:
                    libros = _consultar_google(q, 12)
                except requests.RequestException:
                    continue
                data = [l for l in libros if l["portada"]][:8]
                if data:
                    break
            if data:
                cache.set(clave, data, 3600)
        return Response(data)
