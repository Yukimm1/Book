from django.conf import settings
from django.db import models


class Estante(models.Model):
    """Estante personal: Leyendo, Por leer, Terminados, etc."""

    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="estantes"
    )
    nombre = models.CharField(max_length=50)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(fields=["usuario", "nombre"], name="estante_unico_por_usuario")
        ]

    def __str__(self):
        return f"{self.nombre} ({self.usuario})"


class LibroPersonal(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="libros"
    )
    estante = models.ForeignKey(Estante, on_delete=models.CASCADE, related_name="libros")
    google_id = models.CharField(max_length=50, blank=True)
    titulo = models.CharField(max_length=255)
    autor = models.CharField(max_length=255, blank=True)
    portada = models.URLField(max_length=500, blank=True)
    paginas_totales = models.PositiveIntegerField(default=0)
    paginas_leidas = models.PositiveIntegerField(default=0)
    notas = models.TextField(blank=True, max_length=2000)
    creado = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-creado"]

    def __str__(self):
        return self.titulo
