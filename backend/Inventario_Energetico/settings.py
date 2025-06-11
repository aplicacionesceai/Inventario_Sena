from pathlib import Path
import os
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'clave_insegura_default')
DEBUG = os.getenv('DEBUG', 'False') == 'True'
ALLOWED_HOSTS = ['*','.railway.app'] 
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
CSRF_TRUSTED_ORIGINS = ['https://*.railway.app'] # Puedes especificar dominios
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'corsheaders',  # debe ir antes que rest_framework
    'rest_framework',
    'Inventario',
    'drf_spectacular',
    'rest_framework.authtoken',
]

REST_FRAMEWORK = {
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework.authentication.TokenAuthentication',
    ],
}

# CORS: permite solo estos orígenes, ajusta según dominios frontend/backend
CORS_ALLOWED_ORIGINS = [
    "https://skillful-passion-production.up.railway.app",
    "https://sena-inventario.up.railway.app",
]

CORS_ALLOW_CREDENTIALS = True

# Confía en estos orígenes para CSRF (importante para POST en admin o sesiones)
CSRF_TRUSTED_ORIGINS = [
    "https://skillful-passion-production.up.railway.app",
    "https://sena-inventario.up.railway.app",
] 
SPECTACULAR_SETTINGS = {
    'TITLE': 'API de Energía',
    'DESCRIPTION': 'Documentación de la API del sistema de gestión energética.',
    'VERSION': '1.0.0',
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # DEBE ser el primero
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'Inventario_Energetico.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'Inventario_Energetico.wsgi.application'

DATABASES = {
    'default': dj_database_url.config(
        default=os.getenv("DATABASE_URL", "postgres://user:pass@localhost:5432/db"),
        conn_max_age=600,
        ssl_require=os.getenv("RAILWAY_ENVIRONMENT") is not None
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

AUTHENTICATION_BACKENDS = ['django.contrib.auth.backends.ModelBackend']

STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'static'

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True
DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
