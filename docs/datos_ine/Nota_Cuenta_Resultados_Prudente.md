# Cuenta de resultados 5 años — v2 (3 PyG mensuales + Y1 suavizado)

Fichero: `Modelo_Cuenta_Resultados_Marketplace_5_anos.xlsx`  
Script: `docs/datos_ine/populate_pyg_excel.py`

## Hojas

| Hoja | Contenido |
|------|-----------|
| **PyG Conservador** | 60 meses — escenario de referencia |
| **PyG Realista** | 60 meses — hipótesis |
| **PyG Optimista** | 60 meses — hipótesis |
| Resumen anual | 3 bloques agregados |
| Escenarios 3 vías | Comparativa rápida |
| Drivers y equilibrio | Vendedores → GMV → umbral |
| Parámetros / Notas / Partidas | Criterios |

## Escenario PRUDENTE / Conservador (suavizado Y1)

| Año | GMV | Ingresos | RAI | Neto |
|----:|----:|---------:|----:|-----:|
| 1 | 50.000 | 7.500 | ≈−4.860 | ≈−4.860 |
| 2 | 200.000 | 30.000 | ≈+1.860 | ≈+1.580 |
| 3 | 366.667 | 55.000 | ≈+20.360 | ≈+17.310 |
| 4 | 440.000 | 66.000 | ≈+30.260 | ≈+25.720 |
| 5 | 528.000 | 79.200 | ≈+42.140 | ≈+35.820 |

## Dashboard KPI (al abrir el Excel)

Hoja **`00_KPI_Dashboard`** (activa al abrir) con 6 gráficos dinámicos alimentados por **`KPI_Datos`** (fórmulas `SUMIF` sobre `PyG Conservador`):

1. GMV vs Ingresos (5 años)
2. Resultado neto anual
3. GMV por escenario C/R/O
4. Neto por escenario
5. Estacionalidad GMV año 2
6. Estructura de gastos año 3 (tarta)

Si se modifica `PyG Conservador`, recalcular en Excel (datos → calcular ahora / F9) y los gráficos se actualizan.
