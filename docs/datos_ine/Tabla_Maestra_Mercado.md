# Tabla maestra de mercado (evidencia cuantitativa)

Documento de trabajo para la memoria ICECYL + Diputación de Zamora.  
Criterio: **dato oficial** y **hipótesis comercial** nunca se mezclan en la misma celda.

---

## 0. Lectura del fichero `ea0042823-...75448.csv` (raíz del repo)

Ese fichero **no es la serie tabular**: es el **metadato del catálogo datos.gob.es** de la tabla INE TPX `75448` (*Viajeros entrados por provincias, procedencia de los viajeros y meses. EOTR*).

Enlaces oficiales de descarga contenidos en ese metadato:

| Formato | URL |
|--------|-----|
| CSV (`;`) | https://www.ine.es/jaxi/files/tpx/csv_bdsc/75448.csv |
| CSV (tab) | https://www.ine.es/jaxi/files/tpx/csv_bd/75448.csv |
| XLSX | https://www.ine.es/jaxi/files/tpx/xlsx/75448.xlsx |
| HTML | https://www.ine.es/jaxi/Tabla.htm?tpx=75448 |

**Qué aporta realmente la 75448:** un corte **mensual del último año publicado completo en ese formato TPX**. Tras contrastar con la serie histórica `2073`, el total anual de Zamora en 75448 (**71.910 viajeros**) coincide con **2024** (suma mensual 2073 = **71.909**; diferencia de redondeo).

**Limitación de “procedencia” en 75448:** solo distingue `Total` / `Residentes en España` / `No Residentes`. **No** desglosa por comunidad autónoma de origen.

Para la serie **2019–2025** se usa la operación Tempus3:

| Indicador | Tabla INE | Enlace |
|-----------|-----------|--------|
| Viajeros y pernoctaciones por provincias | **2073** | https://www.ine.es/jaxiT3/Tabla.htm?t=2073 |
| Establecimientos, plazas, ocupación (provincias) | **2070** | https://www.ine.es/jaxiT3/Tabla.htm?t=2070 |
| Estancia media por provincias | **2067** | https://www.ine.es/jaxiT3/Tabla.htm?t=2067 |

CSV descargados en `docs/datos_ine/` (extracción reproducible con `build_tabla_maestra.py`).

---

## NIVEL 1 — Villardeciervos (municipio)

### 1.1 Población (Padrón / INE)

| Año | Habitantes | Fuente | Calidad | Uso en justificación del marketplace |
|----:|-----------:|--------|---------|--------------------------------------|
| 2019 | 413 | Cifras oficiales de población (Padrón/INE) | oficial | Dimensión demográfica del municipio de implantación |
| 2020 | 399 | idem | oficial | Evolución desfavorable = justificación territorial |
| 2021 | 403 | idem | oficial | idem |
| 2022 | 400 | idem | oficial | idem |
| 2023 | 388 | idem | oficial | idem |
| 2024 | 392 | idem | oficial | idem |
| 2025 | 383 | idem | oficial | Base actual |
| 2026 | — | — | no publicado / no usado | No inventar |

**Variación 2019→2025:** 413 → 383 (**−7,3 %** aprox.).

**Formulación institucional (dato → justificación, sin promesa de fijación poblacional):**  
*El proyecto se implanta en un municipio rural de reducida dimensión demográfica y sometido a una evolución poblacional desfavorable. La creación de una actividad empresarial digital orientada a ampliar los canales de comercialización de los productores del territorio pretende contribuir a diversificar la actividad económica local y generar nuevas oportunidades vinculadas a la digitalización y la comercialización.*

### 1.2 Turismo rural municipal (INE)

| Indicador | Valor | Nota |
|-----------|-------|------|
| Villardeciervos como **punto turístico** EOTR | **No figura** | La metodología EOTR contempla puntos/zonas; en Zamora aparecen, entre otros, **Benavente** y **Zamora**, no Villardeciervos |
| Viajeros / pernoctaciones municipales | **No inventar** | Pendiente de fuentes municipales / Diputación si existen |

---

## NIVEL 2 — Sierra de la Culebra / atractivos territoriales

El INE **no** publica serie “Sierra de la Culebra”. Aquí solo datos de atractivos con fuente administrativa.

| Indicador | Año | Dato | Fuente | Calidad | Uso en justificación |
|-----------|-----|------|--------|---------|----------------------|
| Visitantes Centro del Lobo Ibérico (acumulado desde apertura oct. 2015) | ~ago. 2020 | **> 160.000** | Nota Junta / Patrimonio Natural | oficial (comunicado) | Flujo específico del entorno |
| Visitantes Centro del Lobo (anual) | 2019 | **> 42.000** | idem | oficial (comunicado) | **No** = turistas totales de la Sierra |
| Centros REN Zamora | 2019 | **> 96.000** | Junta | oficial (comunicado) | Turismo de naturaleza provincial |
| Berrea | anual | Sep.–principios oct. | Portal Turismo CyL | cualitativo oficial | Campañas estacionales |
| Desafío del Lobo Trail | 14 jun. 2026 | celebrado / apoyado Diputación | ZTS / Diputación | existencia del evento | Turismo deportivo; sin aforo inventado |
| Jornadas del lobo / aforo berrea | — | pendiente | Junta / Diputación / ayuntamientos | — | Solo con cifra oficial |

**Regla de rigor:** no afirmar “la Sierra recibe 42.000 turistas/año”.

---

## NIVEL 3 — Provincia de Zamora | Turismo rural (EOTR)

### 3.1 Viajeros y pernoctaciones (INE 2073)

Suma de meses con dato publicado. Residencia: España + extranjero.

| Año | Viajeros | Residentes ES | Extranjero | Pernoctaciones | Estancia (pernoct/viajeros) | Meses con dato | Calidad |
|----:|---------:|--------------:|-----------:|---------------:|----------------------------:|:---------------|---------|
| 2019 | 73.640 | 69.811 | 3.829 | 164.480 | 2,23 | 12 | serie completa |
| 2020 | 27.823 | 26.401 | 1.422 | 72.809 | 2,62 | 9 (faltan 4, 5, 11) | **COVID / serie parcial** |
| 2021 | 48.024 | 46.258 | 1.766 | 121.874 | 2,54 | 12 | serie completa |
| 2022 | 67.224 | 62.280 | 4.944 | 149.204 | 2,22 | 12 | serie completa |
| 2023 | 60.455 | 56.645 | 3.810 | 137.378 | 2,27 | 12 | serie completa |
| 2024 | 71.909 | 64.820 | 7.089 | 139.587 | 1,94 | 12 | serie completa; **coincide con TPX 75448** |
| 2025 | 52.353 | 48.714 | 3.639 | 114.653 | 2,19 | 12 | serie completa |

**Lectura para la memoria (solo hechos):**
- Tras el mínimo de 2020, hay recuperación: 2022 (67.224) y 2024 (71.909) se acercan al nivel 2019 (73.640).
- 2025 queda por debajo de 2024 (52.353 viajeros; 114.653 pernoctaciones).
- El peso extranjero es minoritario pero creciente en 2024 (7.089 viajeros; 16.946 pernoctaciones).

### 3.2 Oferta (INE 2070) — media de los meses con dato

| Año | Establecimientos abiertos (media) | Plazas (media) | Ocupación por plazas (media %) |
|----:|----------------------------------:|---------------:|-------------------------------:|
| 2019 | 253,1 | 2.578,8 | 17,05 |
| 2020 | 186,4 | 1.742,0 | 10,89 |
| 2021 | 209,0 | 2.122,2 | 14,06 |
| 2022 | 217,9 | 2.275,5 | 17,27 |
| 2023 | 222,6 | 2.284,5 | 16,15 |
| 2024 | 222,8 | 2.379,2 | 15,78 |
| 2025 | 204,6 | 2.238,5 | 13,57 |

### 3.3 Estancia media oficial (INE 2067) — media de meses

| Año | Estancia media (media de meses) | Agosto |
|----:|--------------------------------:|-------:|
| 2019 | 2,18 | 2,66 |
| 2020 | 3,92 | 3,19 |
| 2021 | 2,38 | 3,11 |
| 2022 | 2,11 | 2,89 |
| 2023 | 2,16 | 3,37 |
| 2024 | 1,92 | 2,29 |
| 2025 | 2,22 | 2,81 |

### 3.4 Estacionalidad 2024 (viajeros; no extrapolar)

| Mes | Viajeros | Lectura |
|----:|---------:|---------|
| Ene | 2.752 | valle |
| Feb | 3.851 | |
| Mar | 5.713 | actividad apreciable |
| Abr | 3.900 | |
| May | 5.539 | |
| Jun | 5.940 | |
| Jul | 8.380 | fuerte |
| Ago | **12.151** | pico |
| Sep | 5.981 | otoño activo |
| Oct | 6.633 | otoño activo |
| Nov | 5.731 | |
| Dic | 5.338 | |

**Uso en justificación:** demanda estacional provincial; hipótesis del marketplace = convertir visita en relación comercial anual.

### 3.5 Agosto (punto de contraste histórico)

| Indicador | Ago. 2020 | Ago. 2022 | Ago. 2024 |
|-----------|----------:|----------:|----------:|
| Viajeros | 9.220 | 11.423 | 12.151 |
| Pernoctaciones | 29.417 | 33.026 | 27.844 |
| Estancia media (2067) | 3,19 | 2,89 | 2,29 |

### 3.6 Procedencia por CCAA hacia Zamora

| Estado | Detalle |
|--------|---------|
| **75448 / 2073** | Solo Residentes ES vs Extranjero |
| **CCAA → Zamora** | **Pendiente** — pieza prioritaria siguiente |
| **Regla del proyecto** | Los datos decidirán el mercado; no anticipar Madrid |

---

## NIVEL 4 — Castilla y León / España

| Indicador | Año | Dato | Fuente | Uso |
|-----------|-----|------|--------|-----|
| Viajes residentes (destino CyL) | 2025 | 14.444.563 viajes; 61.560.784 pernoct.; 3.004,1 M€; 208 €/persona; 49 €/día | ETR/FAMILITUR | Contexto regional (no atribuir a Villardeciervos) |
| Pernoctaciones extrahoteleras España | 2025 | 146,3 M; turismo rural 8,8 % | EOAT | Contexto nacional |
| Gasto alimentario hogares | 2024 | 5.391 €/hogar; 15,8 % | EPF | Demanda estructural categorías |

### 2026 (provisional; no mezclar con años completos)

Contexto CyL / nacional según notas de prensa INE (turismo rural): crecimiento interanual en primeros meses de 2026 a escala autonómica/nacional. En la memoria: **“2026 — datos provisionales disponibles hasta el mes publicado”**, nunca como año cerrado.

---

## Tabla resumen para expediente / memoria

| Fuente | Territorio | Indicador | Periodo | Dato | Utilidad marketplace |
|--------|------------|-----------|---------|------|----------------------|
| INE | Villardeciervos | Población | 2019 | 413 | Dimensión demográfica |
| INE | Villardeciervos | Población | 2025 | 383 | Justificación territorial (−7,3 %) |
| INE EOTR 2073 | Zamora | Viajeros turismo rural | 2019 | 73.640 | Tamaño histórico |
| INE EOTR 2073 | Zamora | Viajeros | 2021 | 48.024 | Recuperación post-COVID |
| INE EOTR 2073 | Zamora | Viajeros | 2022 | 67.224 | Recuperación |
| INE EOTR 2073 | Zamora | Viajeros | 2024 | 71.909 | Mercado actual |
| INE EOTR 2073 | Zamora | Pernoctaciones | 2024 | 139.587 | Intensidad (~1,94 noches) |
| INE EOTR 2073 | Zamora | Viajeros | 2025 | 52.353 | Año completo reciente |
| INE ETR | Castilla y León | Viajes residentes | 2025 | 14.444.563 | Mercado regional |
| INE ETR | Castilla y León | Pernoctaciones | 2025 | 61.560.784 | Intensidad |
| INE ETR | Castilla y León | Gasto turístico | 2025 | 3.004,1 M€ | Potencial económico regional |
| Junta CyL | Centro del Lobo | Visitantes | 2019 | >42.000 | Afluencia específica |
| Junta CyL | Zamora REN | Visitantes centros | 2019 | >96.000 | Turismo de naturaleza |
| Junta CyL | Centro del Lobo | Acumulado | 2015–~2020 | >160.000 | Relevancia del recurso |
| Junta CyL | Sierra Culebra | Berrea | anual | Sep.–oct. | Estacionalidad / campañas |
| Portal Turismo CyL | Villardeciervos | Oferta alojamiento | vigente | existencia (p. ej. casa rural registrada) | Oferta sin aforo inventado |
| Diputación | Zamora | Promoción 2026 | 2026 | “Zamora. Escúchate” (naturaleza, lobo, berrea, gastronomía) | Coherencia estratégica |
| Diputación / ZTS | Sierra Culebra | Desafío del Lobo Trail | 14 jun. 2026 | celebrado / apoyado | Turismo deportivo no solo estival |

---

## Tesis (no es dato; es marco del proyecto)

```text
TERRITORIO → PRODUCTOS + NATURALEZA + TURISMO
        → MARKETPLACE
        → RESIDENTE / TURISTA / CONSUMIDOR NACIONAL
        → COMPRA ONLINE → RECOMPRA
```

El marketplace convierte recursos productivos, gastronómicos y turísticos en **relación comercial digital permanente**. No es “Villardeciervos → Madrid”.

---

## Embudo

```text
España (EPF + EOAT + ETR)
    → Castilla y León (ETR destino)
        → Zamora turismo rural (EOTR 2019-2025)
            → atractivos Sierra (Lobo, berrea, trail…)
                → Villardeciervos (población + oferta; sin viajeros INE)
                    → compra / recompra online   ← HIPÓTESIS
```

---

## Pendiente (NO poner en memoria como hecho)

1. **Procedencia CCAA de los ~71.910 viajeros 2024** (y serie 2019–2025) — prioridad.
2. Visitantes exactos de Villardeciervos / totales Sierra.
3. Asistentes jornadas del lobo / berrea.
4. Gasto turístico específico Sierra o municipio.
5. Compradores potenciales, % conversión, mercado € del marketplace.
6. Inventario completo alojamientos Villardeciervos + DIRCE municipal.
7. 2026 solo como meses provisionales.

---

## Fuentes a conservar en el expediente

- INE — EOTR (tablas 2073, 2070, 2067; TPX 75448/75449)
- INE — ETR/FAMILITUR 2025
- INE — EPF 2024; EOAT 2025
- Junta CyL — Centro del Lobo Ibérico / Patrimonio Natural
- Portal de Turismo CyL — Villardeciervos; Sierra de la Culebra; berrea
- Diputación de Zamora — campaña turística 2026; apoyo a Desafío del Lobo Trail

---

*Extracción CSV: `docs/datos_ine/`. Script: `build_tabla_maestra.py`. Cifras de viajeros anuales: suma mensual tabla 2073 (pueden diferir levemente de redondeos/revisiones puntuales citadas en otras fuentes).*
