# -*- coding: utf-8 -*-
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator

# -------------------- MODELOS DE UBICACIÓN --------------------

class Centro(models.Model):
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre

class Sede(models.Model):
    centro = models.ForeignKey(Centro, on_delete=models.CASCADE)
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nombre} - {self.centro.nombre}"

class Ambiente(models.Model):
    sede_nombre = models.CharField(max_length=100)  # Mantenemos como campo de texto
    bloque = models.CharField(max_length=100)
    piso = models.CharField(max_length=20)
    tipo_ambiente = models.CharField(max_length=100)
    nombre = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.nombre} ({self.tipo_ambiente}) - {self.sede_nombre}"

# -------------------- MODELO DE REGISTRO ENERGÉTICO --------------------

class RegistroEnergetico(models.Model):
    # Información básica

    imagen_1 = models.ImageField(upload_to='imagenes_registros/', blank=True, null=True)
    imagen_2 = models.ImageField(upload_to='imagenes_registros/', blank=True, null=True)

    fecha_registro = models.DateTimeField(
        auto_now_add=True,
        verbose_name="Fecha de Registro"
    )
    correo_usuario = models.EmailField(
        verbose_name="Correo del Responsable"
    )
    ambiente = models.ForeignKey(
        Ambiente,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        verbose_name="Ambiente Relacionado"
    )

    # Categorización
    categoria_base = models.CharField(
        max_length=100,
        verbose_name="Categoría Principal"
    )
 
    refrigerante = models.CharField(
    max_length=50,
    blank=True,
    null=True,
    verbose_name="Tipo de refrigerante"
    )


    # Subcategorías
    subcategoria_1 = models.CharField(
        max_length=100,
        verbose_name="Subcategoría Nivel 1",
        default="General",
        help_text="Subclasificación principal del equipo/consumo"
    )
    subcategoria_2 = models.CharField(
        max_length=100,
        verbose_name="Subcategoría Nivel 2",
        blank=True,
        null=True
    )
    subcategoria_3 = models.CharField(
        max_length=100,
        verbose_name="Subcategoría Nivel 3",
        blank=True,
        null=True
    )

    # Datos de consumo
    frecuencia_uso = models.CharField(
        max_length=50,
        verbose_name="Frecuencia de Uso"
    )
    horas_dia = models.PositiveIntegerField(
        verbose_name="Horas por Día",
        validators=[MinValueValidator(0), MaxValueValidator(24)]
    )
    dias_mes = models.PositiveIntegerField(
        verbose_name="Días por Mes",
        validators=[MinValueValidator(0), MaxValueValidator(31)]
    )
    potencia_w = models.FloatField(
        verbose_name="Potencia (W)",
        validators=[MinValueValidator(0)]
    )
    voltaje_v = models.FloatField(
        verbose_name="Voltaje (V)",
        blank=True,
        null=True
    )
    corriente_a = models.FloatField(
        verbose_name="Corriente (A)",
        blank=True,
        null=True
    )

    # Resultados calculados
    consumo_kwh_mes = models.FloatField(
        verbose_name="Consumo kWh/mes",
        editable=False
    )

    # Información adicional
    observaciones = models.TextField(
        blank=True,
        null=True
    )

    def clean(self):
        """Validación personalizada solo si aplica"""
        super().clean()
        if self.categoria_base and 'aire acondicionado' in self.categoria_base.lower():
            if not self.refrigerante:
                raise ValidationError({'refrigerante': 'Debe especificar el tipo de refrigerante'})
        else:
            self.refrigerante = None


    def save(self, *args, **kwargs):
        """Valida y calcula consumo antes de guardar"""
        self.full_clean()
        self.consumo_kwh_mes = (self.potencia_w * self.horas_dia * self.dias_mes) / 1000
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.categoria_base} - {self.subcategoria_1} - {self.fecha_registro.strftime('%Y-%m-%d')}"

    class Meta:
        verbose_name = "Registro Energético"
        verbose_name_plural = "Registros Energéticos"
        ordering = ['-fecha_registro']
