# Cuenta de resultados 5 años — v3 (GMV conservador recalibrado)

Fichero: `Modelo_Cuenta_Resultados_Marketplace_5_anos.xlsx`  
Script: `docs/datos_ine/populate_pyg_excel.py`

## Objetivo financiero (conservador)

| Concepto | Importe |
|----------|--------:|
| Inversión de referencia | 30.000 € |
| Dividendos mínimos (15%) | 4.500 € |
| **Neto acumulado mínimo 5 años** | **34.500 €** |
| Neto acumulado proyectado (conservador) | ≈ **41.400 €** |

## Escenario CONSERVADOR (referencia)

| Año | GMV | Ingresos 15% | Neto | Acumulado |
|----:|----:|-------------:|-----:|----------:|
| 1 | 40.000 | 6.000 | ≈ −4.380 | ≈ −4.380 |
| 2 | 140.000 | 21.000 | ≈ +460 | ≈ −3.920 |
| 3 | 220.000 | 33.000 | ≈ +7.800 | ≈ +3.880 |
| 4 | 280.000 | 42.000 | ≈ +14.700 | ≈ +18.570 |
| 5 | 360.000 | 54.000 | ≈ +23.900 | ≈ +41.440 |

Drivers: 5 → 8 → 11 → 13 → 15 vendedores. Opex contenido alineado al volumen.

## Otros escenarios (alza)

| Escenario | GMV Y1 → Y5 | Neto acum. 5 años (orden) |
|-----------|-------------|---------------------------:|
| Realista | 75k → 680k | ≈ 52.000 € |
| Optimista | 110k → 1,05M | ≈ 75.000 € |

## Dashboard KPI

Hoja **`00_KPI_Dashboard`** alimentada por **`KPI_Datos`**. Tras abrir el Excel, recalcular (F9) si hace falta.
