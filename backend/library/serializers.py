from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

from .models import Estante, LibroPersonal

User = get_user_model()
ESTANTES_POR_DEFECTO = ["Por leer", "Leyendo", "Terminados", "Favoritos"]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password")

    def validate_email(self, value):
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError("Este correo ya está registrado.")
        return value

    def validate(self, attrs):
        user_tmp = User(username=attrs["username"], email=attrs["email"])
        validate_password(attrs["password"], user_tmp)
        return attrs

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        Estante.objects.bulk_create(
            [Estante(usuario=user, nombre=n) for n in ESTANTES_POR_DEFECTO]
        )
        return user


class EstanteSerializer(serializers.ModelSerializer):
    total_libros = serializers.IntegerField(source="libros.count", read_only=True)

    class Meta:
        model = Estante
        fields = ("id", "nombre", "total_libros", "creado")
        read_only_fields = ("creado",)

    def validate_nombre(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError("El nombre es demasiado corto.")
        qs = Estante.objects.filter(
            usuario=self.context["request"].user, nombre__iexact=value
        )
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError("Ya tienes un estante con ese nombre.")
        return value


class LibroPersonalSerializer(serializers.ModelSerializer):
    estante_nombre = serializers.CharField(source="estante.nombre", read_only=True)

    class Meta:
        model = LibroPersonal
        fields = (
            "id", "estante", "estante_nombre", "google_id", "titulo", "autor",
            "portada", "paginas_totales", "paginas_leidas", "notas", "creado",
        )
        read_only_fields = ("creado",)

    def validate_estante(self, estante):
        if estante.usuario != self.context["request"].user:
            raise serializers.ValidationError("Estante inválido.")
        return estante

    def validate_titulo(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("El título es obligatorio.")
        return value

    def validate(self, attrs):
        total = attrs.get("paginas_totales", getattr(self.instance, "paginas_totales", 0))
        leidas = attrs.get("paginas_leidas", getattr(self.instance, "paginas_leidas", 0))
        if total and leidas > total:
            raise serializers.ValidationError(
                {"paginas_leidas": "No puede superar las páginas totales."}
            )
        return attrs
