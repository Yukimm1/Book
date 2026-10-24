from django.urls import include, path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (BuscarLibrosView, EstanteViewSet, LibroPersonalViewSet,
                    LibrosDestacadosView, RegisterView)

router = DefaultRouter()
router.register("estantes", EstanteViewSet, basename="estante")
router.register("libros", LibroPersonalViewSet, basename="libro")


class LoginView(TokenObtainPairView):
    throttle_scope = "login"


urlpatterns = [
    path("auth/register/", RegisterView.as_view()),
    path("auth/login/", LoginView.as_view()),
    path("auth/refresh/", TokenRefreshView.as_view()),
    path("books/search/", BuscarLibrosView.as_view()),
    path("books/featured/", LibrosDestacadosView.as_view()),
    path("", include(router.urls)),
]
