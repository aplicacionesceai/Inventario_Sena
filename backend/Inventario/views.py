from django.db.models import Sum, Count
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import viewsets, status
from rest_framework.views import APIView
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from .models import Centro, Sede, Ambiente, RegistroEnergetico
from .serializer import (
    CentroSerializer, 
    SedeSerializer, 
    AmbienteSerializer, 
    RegistroEnergeticoSerializer
)
import logging

logger = logging.getLogger(__name__)

class CentroView(viewsets.ModelViewSet):
    queryset = Centro.objects.all()
    serializer_class = CentroSerializer

class SedeView(viewsets.ModelViewSet):
    queryset = Sede.objects.all()
    serializer_class = SedeSerializer

class AmbienteView(viewsets.ModelViewSet):
    queryset = Ambiente.objects.all()
    serializer_class = AmbienteSerializer

class RegistroEnergeticoView(viewsets.ModelViewSet):
    queryset = RegistroEnergetico.objects.all()
    serializer_class = RegistroEnergeticoSerializer

class LoginView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Debe proporcionar usuario y contraseña"}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(username=username, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                "token": token.key,
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email
                }
            })
        return Response({"error": "Credenciales inválidas"}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['GET'])
def estadisticas_home(request):
    hoy = timezone.now().date()
    
    try:
        # Consumo total
        consumo_total = RegistroEnergetico.objects.aggregate(
            total=Sum('consumo_kwh_mes')
        )['total'] or 0
        
        # Registros hoy
        registros_hoy = RegistroEnergetico.objects.filter(
            fecha_registro__date=hoy
        ).count()
        
        # Centros activos (solución alternativa para CharField)
        # 1. Obtenemos sedes únicas con registros
        sedes_activas = RegistroEnergetico.objects.exclude(
            ambiente__isnull=True
        ).values_list(
            'ambiente__sede_nombre', flat=True
        ).distinct()
        
        # 2. Buscamos los centros relacionados a esas sedes
        centros_activos = Centro.objects.filter(
            sede__nombre__in=sedes_activas
        ).distinct().count()
        
        # Usuarios activos
        usuarios_activos = RegistroEnergetico.objects.values(
            'correo_usuario'
        ).distinct().count()
        
        return Response({
            'consumo_total': round(consumo_total, 2),
            'registros_hoy': registros_hoy,
            'centros_activos': centros_activos,
            'usuarios_activos': usuarios_activos,
            'ultima_actualizacion': timezone.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error en estadísticas: {str(e)}")
        return Response({
            'error': 'Error al calcular estadísticas',
            'detalle': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)