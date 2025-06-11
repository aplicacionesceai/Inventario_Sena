from django.contrib import admin
from .models import Centro, Sede, Ambiente, RegistroEnergetico
from django.utils.html import format_html
from django.urls import reverse

# ---------------------------
# Configuración para Centro
# ---------------------------
@admin.register(Centro)
class CentroAdmin(admin.ModelAdmin):
    list_display = ('nombre',)
    search_fields = ('nombre',)

# ---------------------------
# Configuración para Sede
# ---------------------------
@admin.register(Sede)
class SedeAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'get_centro')
    search_fields = ('nombre', 'centro__nombre')
    
    def get_centro(self, obj):
        return obj.centro.nombre
    get_centro.short_description = 'Centro'

# ---------------------------
# Configuración para Ambiente
# ---------------------------
@admin.register(Ambiente)
class AmbienteAdmin(admin.ModelAdmin):
    list_display = ('nombre', 'sede_nombre', 'tipo_ambiente', 'bloque', 'piso')
    search_fields = ('nombre', 'sede_nombre', 'tipo_ambiente')
    list_filter = ('tipo_ambiente', 'bloque')

# ---------------------------
# Configuración para RegistroEnergetico
# ---------------------------
@admin.register(RegistroEnergetico)
class RegistroEnergeticoAdmin(admin.ModelAdmin):
    list_display = (
        'fecha_registro',
        'get_ambiente',
        'categoria_base',
        'subcategoria_1',
        'consumo_kwh_mes',
        'acciones'
    )
    list_filter = (
        'categoria_base',
        'subcategoria_1',
        'fecha_registro',
    )
    search_fields = (
        'ambiente__nombre',
        'correo_usuario',
        'observaciones'
    )
    date_hierarchy = 'fecha_registro'
    readonly_fields = ('consumo_kwh_mes', 'fecha_registro')
    
    fieldsets = (
        (None, {
            'fields': (
                'correo_usuario',
                'ambiente',
                'fecha_registro',
                'categoria_base',
                'subcategoria_1',
                'subcategoria_2',
                'subcategoria_3',
                'consumo_kwh_mes',
                'observaciones'
            )
        }),
        ('Información de Aire Acondicionado', {
            'fields': (
                'tipo_aire',
                'refrigerante',
            ),
            'classes': ('collapse',),
            'description': 'Complete solo si la categoría es Aire Acondicionado'
        }),
        ('Datos de Consumo', {
            'fields': (
                'frecuencia_uso',
                'horas_dia',
                'dias_mes',
                'potencia_w',
                'voltaje_v',
                'corriente_a',
            ),
            'classes': ('collapse',)
        }),
    )

    # Métodos personalizados
    def get_ambiente(self, obj):
        if obj.ambiente:
            url = reverse('admin:Inventario_ambiente_change', args=[obj.ambiente.id])
            return format_html('<a href="{}">{}</a>', url, obj.ambiente.nombre)
        return "Sin ambiente"
    get_ambiente.short_description = 'Ambiente'

    def acciones(self, obj):
        return format_html(
            '<a class="button" href="{}">Editar</a> '
            '<a class="button" href="{}" style="background-color:#ba2121;color:white">Borrar</a>',
            reverse('admin:Inventario_registroenergetico_change', args=[obj.id]),
            reverse('admin:Inventario_registroenergetico_delete', args=[obj.id])
        )
    acciones.short_description = 'Acciones'
    acciones.allow_tags = True

    # Sobreescribir para calcular consumo antes de guardar
    def save_model(self, request, obj, form, change):
        obj.consumo_kwh_mes = (obj.potencia_w * obj.horas_dia * obj.dias_mes) / 1000
        super().save_model(request, obj, form, change)