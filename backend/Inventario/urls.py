from django.urls import path, include
from . import views
from .views import LoginView, estadisticas_home
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'centros', views.CentroView)
router.register(r'sedes', views.SedeView)
router.register(r'ambientes', views.AmbienteView)
router.register(r'registros', views.RegistroEnergeticoView)

urlpatterns = [
    path('', include(router.urls)),
    path('auth/login/', LoginView.as_view(), name='login'),
    path('estadisticas/home/', estadisticas_home, name='estadisticas-home'),
   
]