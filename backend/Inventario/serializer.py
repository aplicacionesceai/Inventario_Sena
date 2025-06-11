from rest_framework import serializers
from .models import Centro, Sede, Ambiente, RegistroEnergetico

class CentroSerializer(serializers.ModelSerializer):
    class Meta:
        model = Centro
        fields = '__all__'
        extra_kwargs = {
            'nombre': {
                'help_text': 'Nombre completo del centro formativo'
            }
        }

class SedeSerializer(serializers.ModelSerializer):
    centro_nombre = serializers.CharField(
        source='centro.nombre', 
        read_only=True,
        help_text='Nombre del centro al que pertenece'
    )

    class Meta:
        model = Sede
        fields = ['id', 'nombre', 'centro', 'centro_nombre']
        extra_kwargs = {
            'nombre': {
                'help_text': 'Nombre de la sede o ubicación física'
            },
            'centro': {
                'help_text': 'ID del centro asociado'
            }
        }

class AmbienteSerializer(serializers.ModelSerializer):
    sede = serializers.CharField(
        source='sede_nombre',
        required=True,
        help_text="Nombre de la sede (ej: CEAI, Norte)"
    )
    
    sede_nombre = serializers.CharField(
        read_only=True,
        help_text="Nombre de la sede (solo lectura)"
    )
    
    centro_nombre = serializers.SerializerMethodField(
        help_text="Nombre del centro relacionado (solo lectura)"
    )

    class Meta:
        model = Ambiente
        fields = [
            'id', 'sede', 'sede_nombre', 'centro_nombre',
            'bloque', 'piso', 'tipo_ambiente', 'nombre'
        ]
        extra_kwargs = {
            'bloque': {
                'required': True,
                'help_text': 'Bloque o edificio donde se encuentra'
            },
            'piso': {
                'required': True,
                'help_text': 'Piso donde está ubicado el ambiente'
            },
            'tipo_ambiente': {
                'required': True,
                'help_text': 'Tipo de ambiente (Aula, Laboratorio, Oficina, etc.)'
            },
            'nombre': {
                'required': True,
                'help_text': 'Nombre o número identificador del ambiente'
            }
        }

    def get_centro_nombre(self, obj):
        return "Centro Principal"  # Reemplaza con tu lógica real

    def validate_sede(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("El nombre de la sede no puede estar vacío")
        if len(value) < 3:
            raise serializers.ValidationError("El nombre debe tener al menos 3 caracteres")
        return value

    def create(self, validated_data):
        return Ambiente.objects.create(**validated_data)

    def update(self, instance, validated_data):
        instance.sede_nombre = validated_data.get('sede_nombre', instance.sede_nombre)
        instance.bloque = validated_data.get('bloque', instance.bloque)
        instance.piso = validated_data.get('piso', instance.piso)
        instance.tipo_ambiente = validated_data.get('tipo_ambiente', instance.tipo_ambiente)
        instance.nombre = validated_data.get('nombre', instance.nombre)
        instance.save()
        return instance

class RegistroEnergeticoSerializer(serializers.ModelSerializer):

    imagen_1 = serializers.ImageField(required=False, allow_null=True)
    imagen_2 = serializers.ImageField(required=False, allow_null=True)

    ambiente_nombre = serializers.CharField(
        source='ambiente.nombre', 
        read_only=True,
        help_text='Nombre del ambiente relacionado'
    )
    sede_nombre = serializers.CharField(
        source='ambiente.sede.nombre', 
        read_only=True,
        help_text='Nombre de la sede del ambiente'
    )
    centro_nombre = serializers.CharField(
        source='ambiente.sede.centro.nombre', 
        read_only=True,
        help_text='Nombre del centro del ambiente'
    )

    class Meta:
        model = RegistroEnergetico
        fields = [
            'id', 'fecha_registro', 'correo_usuario', 'ambiente', 'ambiente_nombre',
            'sede_nombre', 'centro_nombre', 'categoria_base', 'subcategoria_1',
            'subcategoria_2', 'subcategoria_3', 'refrigerante',
            'frecuencia_uso', 'horas_dia', 'dias_mes', 'potencia_w', 'voltaje_v',
            'corriente_a', 'consumo_kwh_mes', 'observaciones', 'imagen_1','imagen_2',
        ]
        read_only_fields = ['consumo_kwh_mes']
        extra_kwargs = {
            'fecha_registro': {
                'help_text': 'Fecha de registro (se autocompleta)'
            },
            'correo_usuario': {
                'help_text': 'Correo del responsable del registro'
            },
            'categoria_base': {
                'help_text': 'Categoría principal del equipo/consumo'
            },
            'subcategoria_1': {
                'help_text': 'Subclasificación principal (requerida)'
            },
            'subcategoria_2': {
                'help_text': 'Subclasificación secundaria (opcional)'
            },
            'subcategoria_3': {
                'help_text': 'Subclasificación terciaria (opcional)'
            },
            'refrigerante': {
                'help_text': 'Tipo de refrigerante (solo si categoría es aire acondicionado)'
            },
            'frecuencia_uso': {
                'help_text': 'Frecuencia de uso del equipo'
            },
            'horas_dia': {
                'help_text': 'Horas de uso diario (0-24)'
            },
            'dias_mes': {
                'help_text': 'Días de uso mensual (0-31)'
            },
            'potencia_w': {
                'help_text': 'Potencia en vatios (valor positivo)'
            },
            'voltaje_v': {
                'help_text': 'Voltaje en voltios (opcional)'
            },
            'corriente_a': {
                'help_text': 'Corriente en amperios (opcional)'
            },
            'observaciones': {
                'help_text': 'Notas adicionales sobre el registro'
            }
        }

    def validate(self, data):
        categoria = data.get('categoria_base', '').lower()

        if 'aire acondicionado' in categoria:
            if not data.get('refrigerante'):
                raise serializers.ValidationError({
                    'refrigerante': 'Este campo es requerido para aire acondicionado'
                })

        if not data.get('subcategoria_1'):
            raise serializers.ValidationError({
                'subcategoria_1': 'La subcategoría nivel 1 es obligatoria'
            })

        if data.get('subcategoria_3') and not data.get('subcategoria_2'):
            raise serializers.ValidationError({
                'subcategoria_2': 'Debe existir subcategoría nivel 2 si se especifica nivel 3'
            })

        # Calcular potencia si no viene y sí vienen voltaje y corriente
        if not data.get('potencia_w'):
            try:
                voltaje = float(data.get('voltaje_v') or 0)
                corriente = float(data.get('corriente_a') or 0)
                if voltaje > 0 and corriente > 0:
                    data['potencia_w'] = round(voltaje * corriente, 2)
            except Exception:
                pass

        return data
