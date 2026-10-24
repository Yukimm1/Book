# 📚 BookVerse — Gestor de Lecturas y Biblioteca Personal

Aplicación web full-stack para organizar tus lecturas en estantes (Por leer, Leyendo, Terminados…), buscando libros en **Google Books** y guardándolos en tu biblioteca personal.

**Stack:** React (Vite) · Django + Django REST Framework · JWT (SimpleJWT) · Google Books API

## Funcionalidades
- Registro e inicio de sesión con JWT (access + refresh con renovación automática).
- Biblioteca personal con CRUD completo de estantes y libros (progreso de lectura y notas).
- Buscador conectado a Google Books (portada, sinopsis, páginas) con botón para agregar al estante elegido.
- Home con libros destacados traídos de la API externa.

## Estructura
```
bookverse/
├── backend/    # Django + DRF
│   ├── bookverse/   (settings, urls)
│   └── library/     (models, serializers, views, urls)
└── frontend/   # React + Vite
    └── src/ (pages, components, api.js, AuthContext.jsx)
```

## Requisitos
Python 3.10+ · Node.js 18+ · Git

## Instalación

### 1. Clonar
```bash
git clone https://github.com/TU_USUARIO/bookverse.git
cd bookverse
```

### 2. Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env              # Windows: copy .env.example .env
```
Edita `.env` y genera una SECRET_KEY real:
```bash
python -c "from django.core.management.utils import get_random_secret_key as g; print(g()+g())"
```
Luego:
```bash
python manage.py migrate
python manage.py createsuperuser   # opcional (panel /admin)
python manage.py runserver         # http://localhost:8000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                        # http://localhost:5173
```

## Variables de entorno (`backend/.env`)
| Variable | Descripción |
|---|---|
| `SECRET_KEY` | Clave secreta de Django (larga y aleatoria) |
| `DEBUG` | `True` en desarrollo, `False` en producción |
| `ALLOWED_HOSTS` | Hosts permitidos, separados por coma |
| `CORS_ALLOWED_ORIGINS` | Orígenes del frontend permitidos |
| `GOOGLE_BOOKS_API_KEY` | Opcional; aumenta la cuota de Google Books |

## Endpoints de la API
| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register/` | No | Crear cuenta |
| POST | `/api/auth/login/` | No | Obtener tokens JWT |
| POST | `/api/auth/refresh/` | No | Renovar access token |
| GET/POST | `/api/estantes/` | Sí | Listar / crear estantes |
| GET/PUT/PATCH/DELETE | `/api/estantes/{id}/` | Sí | Detalle / editar / borrar |
| GET/POST | `/api/libros/` (`?estante=ID`) | Sí | Listar / crear libros |
| GET/PUT/PATCH/DELETE | `/api/libros/{id}/` | Sí | Detalle / editar / borrar |
| GET | `/api/books/search/?q=` | Sí | Buscar en Google Books |
| GET | `/api/books/featured/` | No | Libros destacados |

Cada usuario solo puede ver y modificar **sus propios** estantes y libros.

## Seguridad
- Secretos y configuración sensible en `.env` (ignorado por Git; se incluye `.env.example`).
- Validación de datos en serializers: contraseña con validadores de Django, correo único, páginas leídas ≤ totales, estante pertenece al usuario, longitud de búsqueda.
- Throttling en registro y login contra abuso.
- CORS restringido a orígenes definidos en `.env`.
- La API key de Google Books vive solo en el backend (el navegador consulta a través de un proxy).

### Verificación `check --deploy`
Con `DEBUG=True` en desarrollo es normal ver avisos. Para validar producción:
```bash
# Linux / Mac
DEBUG=False python manage.py check --deploy
# Windows PowerShell
$env:DEBUG="False"; python manage.py check --deploy
```
Resultado esperado: `System check identified no issues (0 silenced).`
(Requiere una `SECRET_KEY` de 50+ caracteres, sin el prefijo `django-insecure-`.)

## Autor
Tu Nombre — Proyecto académico
