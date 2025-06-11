import os
import pandas as pd
from django.core.management.base import BaseCommand
from Inventario.models import Ambiente, RegistroEnergetico

class Command(BaseCommand):
    help = 'Importa registros desde un archivo Excel'

    def add_arguments(self, parser):
        parser.add_argument('ruta_excel', type=str, help='Ruta al archivo Excel')

    def handle(self, *args, **kwargs):
        ruta_excel = kwargs['ruta_excel']

        print("📦 Iniciando importación de Excel en producción...")

        if not os.path.exists(ruta_excel):
            self.stdout.write(self.style.ERROR(f'❌ El archivo {ruta_excel} no existe'))
            return

        try:
            df = pd.read_excel(ruta_excel, sheet_name='Inventario', engine='openpyxl')
            df.columns = [col.strip().replace("  ", " ").replace("del", "de").replace("Del", "de") for col in df.columns]
            df = df.head(20)  # 🧪 solo cargar primeras 20 filas para no romper la RAM
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'❌ Error leyendo el archivo: {e}'))
            return

        df = df[df['Sede'].notna()]
        total = len(df)
        exitosos = 0
        fallidos = 0

        for i, row in df.iterrows():
            try:
                print(f"🟡 Fila {i+1}/{total}: procesando...")

                campos_obligatorios = [
                    'Sede', 'bloque_area_edificio_zona', 'Piso',
                    'Tipo de Ambiente', 'Nombre de Ambiente',
                    'Correo', 'Categoria Base', 'Subcategoria',
                    'Frecuencia de uso', '# Horas al dia', '# Dias al mes', 'Potencia W'
                ]

                for campo in campos_obligatorios:
                    if pd.isna(row.get(campo)) or str(row[campo]).strip() == "":
                        raise ValueError(f"Campo obligatorio vacío: {campo}")

                ambiente, _ = Ambiente.objects.get_or_create(
                    sede_nombre=row['Sede'].strip(),
                    bloque=row['bloque_area_edificio_zona'].strip(),
                    piso=str(row['Piso']).strip(),
                    tipo_ambiente=row['Tipo de Ambiente'].strip(),
                    nombre=row['Nombre de Ambiente'].strip()
                )

                RegistroEnergetico.objects.create(
                    correo_usuario=row['Correo'].strip(),
                    ambiente=ambiente,
                    categoria_base=row['Categoria Base'].strip(),
                    subcategoria_1=row['Subcategoria'].strip(),
                    subcategoria_2=None,
                    subcategoria_3=None,
                    tipo_aire=None,
                    refrigerante=row['Refrigerante'].strip() if not pd.isna(row.get('Refrigerante')) else None,
                    frecuencia_uso=row['Frecuencia de uso'].strip(),
                    horas_dia=int(row['# Horas al dia']),
                    dias_mes=int(row['# Dias al mes']),
                    potencia_w=float(row['Potencia W']),
                    voltaje_v=float(row['Voltaje (V)']) if not pd.isna(row.get('Voltaje (V)')) else None,
                    corriente_a=float(str(row['Corriente (A)']).replace(',', '.')) if not pd.isna(row.get('Corriente (A)')) else None,
                    observaciones=row.get('observaciones', '')
                )

                print(self.style.SUCCESS(f"✅ Fila {i+1} importada"))
                exitosos += 1

            except Exception as e:
                print(self.style.ERROR(f"❌ Fila {i+1} falló: {e}"))
                fallidos += 1

        print("\n🔚 Proceso completado.")
        print(f"✔ Éxitos: {exitosos} / ❌ Fallidos: {fallidos} / Total: {total}")
