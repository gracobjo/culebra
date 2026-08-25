# Variables de decisión y datasets Kaggle (predicción)

![Logo Sabores de la Culebra](./imagenes/logo.png)

**Sabores de la Culebra · análisis para ML**

Inventario de las variables que hoy intervienen en los simuladores y playbooks del panel, mapeadas a **datasets públicos de Kaggle** (o competiciones) con variables análogas para entrenar modelos de predicción.

**Panel:** `/admin/showroom` · `/admin/turismo`  
**Canvas:** variables + enlaces Kaggle (abrir junto al chat en Cursor).

---

## 0. Entorno Python (obligatorio)

Antes de descargar datasets o entrenar modelos:

```powershell
# Desde la raíz del repo
py -3.11 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r ml/requirements.txt
```

Guía: [`ml/README.md`](../ml/README.md). El directorio `.venv/` está en `.gitignore`.

---

## 1. Qué queremos predecir (targets)

| Target de negocio | Cómo se define hoy en el panel | Tipo ML típico |
|-------------------|--------------------------------|----------------|
| GMV / margen showroom | `purchases × ticket`, comisión 17 %, packaging | Regresión |
| Conversión visita → compra | `purchases / visits` | Regresión / clasificación |
| Ticket medio (+ impulso) | Base + attach × € impulso | Regresión |
| Cestas vendidas (90 días) | Proxy ~55 % compras o contador real | Regresión / conteo |
| Contactos captados | % captación × compras | Regresión |
| Pedidos online desde showroom | Contador atribuido | Regresión / conteo |
| Impulso en caja (+4–12 €) | Attach % × avgImpulseAdd | Regresión |
| Compra rápida 12–20 € | % sin cesta × ticket | Clasificación (cesta vs rápida) + regresión |
| Unidades / margen lista de 8 | SKU units × PVP / comisión o margen propio | Multi-output / series |
| Sell-through tote | Vendidas / stock | Regresión |
| Visitas referidas (alojamientos) | Contador CRM | Regresión |
| Cestas vía partners | Contador L2–L4 | Regresión |
| Pedidos online de huéspedes | Contador | Regresión |

Ningún dataset público es «showroom rural Zamora». El enfoque es: **aprender relaciones** (tráfico → conversión → ticket → margen; cesta vs impulso; canal hotel → visita) y transferir la estructura a vuestros datos reales.

---

## 2. Inventario de variables (toma de decisiones)

### A. Showroom — motor 90 días (`showroom-optimization`)

| Variable | Rol | Valor defecto / meta |
|----------|-----|----------------------|
| `openDays` | Días apertura / año | 115 · meta Y1 110–120 |
| `visitsPerDay` | Tráfico | 15 |
| `conversionPct` | Visita → compra | 35 % · meta ≥ 30–35 |
| `avgTicket` | Ticket medio | 40 € · meta ≥ 38 |
| `packagingPerSale` | Coste packaging | 2,2 € |
| `catasAnnual` | Ingreso catas/talleres (€/año) | 1.200 |
| `contactCapturePct` | % compradores con contacto | 40 % |
| `onlineOrdersFromShowroom` | Pedidos web atribuidos / año | 80 |
| `onlineOrderTicket` | Ticket de esos pedidos | 42 € |
| `openDaysInSprint` / `horizonDays` | Ventana 90 días | 32 / 90 |
| Comisión | Constante modelo | 17 % |
| Fijos Y1 / Y2 | Equilibrio | 15.000 / 17.000 € |

**Derivadas:** visitas, compras, GMV, margen neto, contactos, GMV/margen 90 días, % margen showroom vs online.

### B. Impulso + lista de 8 (`showroom-impulse-metrics`)

| Variable | Rol | Meta |
|----------|-----|------|
| `visits`, `purchases`, `openDays` | Periodo medido | — |
| `baseTicket` | Sin impulso | — |
| `impulseAttachPct` | % ventas con añadido | ≥ 40 % |
| `avgImpulseAdd` | € medios de impulso | 4–12 € |
| `quickBuyPct` / `avgQuickBuyTicket` | Compra sin cesta | ≥ 20 % · 12–20 € |
| Unidades SKU (8) | Miel, loncheado, mermelada, queso, tote, picos, vino, mini-cata | ≥ 60 uds periodo |
| `toteStock`, `toteUnitCost`, `totePvp` | Margen propio + rotación | Sell-through ≥ 35 % · margen ≥ 30 € |
| Mini-cata / visitas | Conversión experiencia | ≥ 5 % visitas |

### C. Cestas y packaging (`showroom-cestas`, `showroom-packaging`)

| Variable | Rol |
|----------|-----|
| PVP cesta (29 / 45 / 65 / 89 €) | Ticket y posicionamiento |
| Comisión 17 %, packaging por cesta | Margen neto S.L. |
| Nº productores por cesta, lanzamiento | Operativa |
| Costes unitarios packaging | Margen |

### D. Alojamientos / canal (`alojamientos-estrategia`, contraprestaciones, CRM)

| Variable | Rol | Meta 90 d |
|----------|-----|-----------|
| `listed`, `withMaterial`, `activeRecommend`, `welcomePartners`, `commissionPartners` | Embudo L1–L4 | 15–20 listados · 6–8 material · 5–7 activos |
| `basketsVia`, `basketsOnLodgingCommission` | Cestas atribuidas | 12–30 |
| `referredVisits`, `referredConversionPct` | Tráfico referido | 35–80 visitas |
| `onlineFromGuests`, `onlineOrderTicket` | Online huéspedes | 12–25 pedidos |
| `avgBasketPvp`, `welcomeSpecialPrice`, `welcomeSharePct` | Precio bienvenida | Escapada 29 / especial 23 |
| `lodgingCommissionPct` | L4 | Idealmente 0 al inicio · ej. 10 % |

### E. Contexto (cualitativo → features si se miden)

Temporada / festivo, evento local, nº alojamientos activos, horas de apertura, presencia de degustación, stock isle cestas (8–12), redes/señalética, fase sprint (1–3).

---

## 3. Datasets alineados (recomendados)

Ninguno es “showroom rural Zamora”. Sirven para **aprender relaciones** transferibles a Culebra.

### 3.0 Copias locales en el repo (`data/kaggle/`, gitignored)

| Carpeta local | Dataset Kaggle | Uso Culebra |
|---------------|----------------|-------------|
| `data/kaggle/retail-forecast/` | [Retail Sales Forecast 2026](https://www.kaggle.com/datasets/mmumairkhattak/retail-sales-forecast-dataset-2026) | Tráfico → ventas → ticket · festivo/promo · online |
| `data/kaggle/groceries-mba/` | [Groceries dataset](https://www.kaggle.com/datasets/heeraldedhia/groceries-dataset) | Market basket / co-compra (lista de 8, impulso) |
| `data/kaggle/bread-basket/` | [The Bread Basket](https://www.kaggle.com/datasets/mittalvasu95/the-bread-basket) | Compra rápida / impulso por hora del día |
| `data/kaggle/hotel-booking/` | [Hotel booking demand](https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand) | Estacionalidad y canales → proxy huéspedes |

```powershell
.\.venv\Scripts\Activate.ps1
New-Item -ItemType Directory -Force -Path data\kaggle | Out-Null

kaggle datasets download -d mmumairkhattak/retail-sales-forecast-dataset-2026 -p data/kaggle/retail-forecast --unzip
kaggle datasets download -d heeraldedhia/groceries-dataset -p data/kaggle/groceries-mba --unzip
kaggle datasets download -d mittalvasu95/the-bread-basket -p data/kaggle/bread-basket --unzip
kaggle datasets download -d jessemostipak/hotel-booking-demand -p data/kaggle/hotel-booking --unzip
```

Credenciales: ver [`ml/README.md`](../ml/README.md).

### Prioridad 1 — tienda física: tráfico, ventas, ticket

| Dataset | Enlace | Variables análogas | Uso para vosotros |
|---------|--------|--------------------|-------------------|
| **Retail Sales Forecast Dataset 2026** ★ local | [mmumairkhattak/…](https://www.kaggle.com/datasets/mmumairkhattak/retail-sales-forecast-dataset-2026) | `Customer_Footfall`, `Units_Sold`, `Unit_Price`, `Sales_Amount`, `Promotion`, `Holiday`, `Season`, `Online_Orders`, `Inventory_Level` | Proxy **conversión** y **ticket** |
| **Store Sales – Favorita** | [competición](https://www.kaggle.com/competitions/store-sales-time-series-forecasting) | `sales`, `family`, `onpromotion`, `holidays_events`, `oil` | Series diarias por familia alimentaria + festivos |
| **Walmart Sales Forecast** | [aslanahmedov/…](https://www.kaggle.com/datasets/aslanahmedov/walmart-sales-forecast) | Ventas semanales + holidays | Estacionalidad retail |
| **Supermart Grocery Sales** | [mohamedharris/…](https://www.kaggle.com/datasets/mohamedharris/supermart-grocery-sales-retail-analytics-dataset) | Categoría, ticket grocery | Mix alimentario |
| **Retail Store Sales Transactions** | [mahmoudmansour22/…](https://www.kaggle.com/datasets/mahmoudmansour22/retail-store-sales-transactions-20222024) | `total_spent`, in-store/online | Ticket, canal físico vs web |
| **Retail Store Performance** | [hanzla121/…](https://www.kaggle.com/datasets/hanzla121/retail-store-performance-dataset) | Trial/control por tienda | Impacto de intervenciones (isla cestas / impulso) |

### Prioridad 2 — cesta / impulso / cross-sell

| Dataset | Enlace | Variables análogas | Uso |
|---------|--------|--------------------|-----|
| **Groceries dataset** ★ local | [heeraldedhia/…](https://www.kaggle.com/datasets/heeraldedhia/groceries-dataset) | Transacciones → ítems | Association rules ligeras (miel↔loncheado) |
| **The Bread Basket** ★ local | [mittalvasu95/…](https://www.kaggle.com/datasets/mittalvasu95/the-bread-basket) | Ticket corto, hora, weekday | **Compra rápida** 12–20 € / impulso |
| **Bakery Sales** | [akashdeepkuila/…](https://www.kaggle.com/datasets/akashdeepkuila/bakery) | Ventas panadería/café | Ticket corto |
| **Instacart Market Basket** | [competición](https://www.kaggle.com/competitions/instacart-market-basket-analysis) | `add_to_cart_order`, `reordered` | Co-compra a escala (pesado ~200 MB) |
| **Online Retail (UCI / Carrie)** | [carrie1/…](https://www.kaggle.com/datasets/carrie1/ecommerce-data) | Invoice, Quantity, Price | Proxy **cestas regalo** / RFM |
| **Online Retail II (UCI)** | [cgrymn/…](https://www.kaggle.com/datasets/cgrymn/online-retail-ii-uci-dataset) | Idem ampliado | Ticket, recurrencia |
| **Fuzzy Factory (Maven)** | [sonalisingh1411/…](https://www.kaggle.com/datasets/sonalisingh1411/fuzzy-factory-e-commerce-and-marketing-database) | Sessions → orders, `utm_*` | Conversión web / QR showroom |

### Prioridad 3 — marketplace multi-productor (análogo Culebra)

| Dataset | Enlace | Uso |
|---------|--------|-----|
| **Olist Brazilian E-Commerce** | [olistbr/brazilian-ecommerce](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) | Multi-vendedor, pedidos, reviews, freight, categorías food/drink → proxy productores |
| **Online Sales – Marketplace** | [shreyanshverma27/…](https://www.kaggle.com/datasets/shreyanshverma27/online-sales-dataset-popular-marketplace-data) | Pedidos marketplace genéricos |
| **Marketing Insights E-Commerce** | [rishikumarrajvansh/…](https://www.kaggle.com/datasets/rishikumarrajvansh/marketing-insights-for-e-commerce-company) | Campañas → conversión / captación |

### Prioridad 4 — canal alojamientos / turismo

| Dataset | Enlace | Variables análogas | Uso |
|---------|--------|--------------------|-----|
| **Hotel booking demand** ★ local | [jessemostipak/…](https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand) | `adr`, `market_segment`, `lead_time`, temporada | Volumen huéspedes susceptibles de derivación |
| **Hotel + indicadores económicos** | [mlardi/…](https://www.kaggle.com/datasets/mlardi/hotel-booking-demand-with-economic-indicators) | + CPI, fuel, sentiment | Macro sobre visitas |
| **INE EOAT (turismo rural)** | [INE](https://www.ine.es/dyngs/INEbase/es/operacion.htm?c=Estadistica_C&cid=1254736176963&menu=ultiDatos&idp=1254735576863) · [datos.gob.es](https://datos.gob.es/en/noticias/main-tourism-datasets-datosgobes) | Viajeros, pernoctaciones, ocupación CyL | Estacionalidad **oficial España** (mejor proxy rural) |
| **Inside Airbnb (España)** | [insideairbnb.com](https://insideairbnb.com/get-the-data/) | Listings, occupancy proxy | Oferta alojamiento / partners |
| **Airbnb Barcelona** | [thedevastator/…](https://www.kaggle.com/datasets/thedevastator/analysis-of-barcelona-airbnb-listings) | Listados + reviews | Proxy partners (no rural) |

### Prioridad 5 — producto / marca / afiliados

| Dataset | Enlace | Uso |
|---------|--------|-----|
| **Spanish Wine Quality** | [fedesoriano/…](https://www.kaggle.com/datasets/fedesoriano/spanish-wine-quality-dataset) | Features vino ES → lista de 8 / cestas |
| **Avocado Prices** | [neuromusic/…](https://www.kaggle.com/datasets/neuromusic/avocado-prices) | Precio agro + estacionalidad (analogía miel/queso) |
| **Retail Customer & Transaction** | [raghavendragandhi/…](https://www.kaggle.com/datasets/raghavendragandhi/retail-customer-and-transaction-dataset) | Campañas, ROI → captación contacto |
| **Amazon Affiliate Performance** | [affiliatematic/…](https://www.kaggle.com/datasets/affiliatematic/amazon-affiliate-marketing-performance-dataset) | Proxy atribución partner L3–L4 |
| **Product Advertising Data** | [singhnavjot2062001/…](https://www.kaggle.com/datasets/singhnavjot2062001/product-advertising-data) | Spend → conversión |

### Alternativas académicas / oficiales (fuera de Kaggle)

- [Dominick’s Finer Foods – Kilts Center](https://www.chicagobooth.edu/research/kilts/datasets/dominicks): tráfico diario + UPC (precio, unidades, margen); registro institucional.
- **INE** ocupación turismo rural (arriba): preferible a Airbnb urbano para La Raya.

---

## 4. Mapa variable Culebra → columna típica Kaggle

| Variable Culebra | Columna / feature en datasets | Notas |
|------------------|-------------------------------|-------|
| Visitas / día | `Customer_Footfall`, traffic | Agregar por día/tienda |
| Conversión | purchases / footfall (derivada) | Rara vez viene lista |
| Ticket / AOV | `Sales_Amount/n_tx`, `total_spent`, `adr` | |
| Unidades SKU | `Units_Sold`, Instacart `order_products`, Groceries `itemDescription` | |
| Impulso / attach | Items por ticket > 1; Bread Basket por `Transaction` | Feature engineering |
| Compra rápida | Bread Basket: tickets cortos + `Time` / weekday | Proxy 12–20 € |
| Promo / festivo | `Promotion`, `Holiday`, `Season`, Favorita `holidays_events` | Temporada berrea/Navidad |
| Pedidos online | `Online_Orders`, Fuzzy Factory orders, Olist `orders` | |
| Inventario tote | `Inventory_Level` | |
| Canal hotel | `market_segment`, `distribution_channel`; INE pernoctaciones | Hotel ≠ rural; INE mejor proxy CyL |
| Marketplace multi-vendor | Olist sellers + order_items | Análogo productores |
| Captación | campaigns `conversions`, emails | |

### Dataset sintético Culebra (local)

Generado con `python ml/generate_culebra_synthetic.py` (venv activo):

| Archivo | Contenido |
|---------|-----------|
| [`data/synthetic/culebra_showroom_daily.csv`](../data/synthetic/culebra_showroom_daily.csv) | ~730 días; columnas Culebra + alias Kaggle del mapa §4 |
| [`data/synthetic/culebra_showroom_data_dictionary.csv`](../data/synthetic/culebra_showroom_data_dictionary.csv) | Diccionario de columnas |

Cifras orientadas al showroom rural (fines de semana, temporada, berrea/Navidad, lista de 8, tote, referidos alojamientos). Semilla por defecto `42`.

---

## 5. Pipeline sugerido (predicción)

1. **Usar locales** (§3.0): Retail Forecast + Groceries/Bread Basket + Hotel booking. Opcional: Favorita (series), Olist (marketplace), INE EOAT (rural ES).  
2. **Derivar** features: `conversion = f(sales_tx, footfall)`, `aov`, `items_per_basket`, flags festivo/promo, hora (Bread Basket).  
3. **Modelos baseline:**  
   - Regresión: predecir `Sales_Amount` o `aov` (RandomForest / XGBoost / Ridge).  
   - Clasificación: ¿compra sí/no dada visita+contexto? (si construís etiqueta).  
   - Association rules / lift: Groceries o Instacart → miel ↔ loncheado, cesta ↔ tote.  
4. **Calibrar** con `/admin/showroom` (quincenal) y/o `data/synthetic/culebra_showroom_daily.csv`.  
5. **No mezclar** escalas: reentrenar con filas reales cuando tengáis ≥ 8–12 quincenas.

### Esquema mínimo a registrar (para alinear con Kaggle)

```text
date, open (0/1), visits, purchases, gmv, avg_ticket_base, impulse_attach_pct,
impulse_avg_eur, quick_buy_pct, quick_buy_ticket,
miel_u, loncheado_u, mermelada_u, queso_u, tote_u, picos_u, vino_u, minicata_u,
tote_stock, contacts, online_orders_attr, referred_visits, baskets_via_lodging,
holiday_or_event (0/1), season
```

---

## 6. Limitaciones

- Muchos datasets de “footfall” en Kaggle son **sintéticos** o de gran retail; sirven para **practicar el modelo**, no para cifras absolutas de Villardeciervos.  
- Hotel booking es de **hoteles** (Portugal / genérico), no casas rurales de La Raya: útil para estacionalidad y canales; para rural ES preferid **INE EOAT**.  
- Groceries / Bread Basket / Instacart sirven para **co-ocurrencia**, no para PVP en € del showroom.  
- Olist es marketplace BR: útil para multi-vendedor y logística, no para comisión 17 % ni packs turismo.  
- La predicción útil de negocio nacerá cuando el CSV quincenal del showroom tenga historial; Kaggle acelera el diseño del modelo.  
- `data/kaggle/` está en `.gitignore` (no se sube al remoto).

---

*Documento vivo. Actualizar cuando se añadan variables al panel o se fijen datasets de entrenamiento en el repo.*
