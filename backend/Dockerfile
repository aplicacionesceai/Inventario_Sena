FROM python:3.11-slim

WORKDIR /app

COPY . /app/

RUN apt-get update && apt-get install -y \
    libpq-dev gcc && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip && pip install -r requirements.txt

EXPOSE 8000

CMD ["sh", "-c", "\
    python manage.py migrate && \
    python manage.py collectstatic --noinput && \
    python manage.py importar_excel imports/4_Inventario_Detallado_Escuela_Gastronomica.xlsx || true && \
    echo \"from django.contrib.auth import get_user_model;\
    User = get_user_model();\
    username = 'sena';\
    password = 'sena2025';\
    email = 'sena@example.com';\
    exists = User.objects.filter(username=username).exists();\
    print('✅ Usuario ya existe' if exists else User.objects.create_superuser(username=username, password=password, email=email))\" \
    | python manage.py shell && \
    gunicorn Inventario_Energetico.wsgi:application --bind 0.0.0.0:8000"]


