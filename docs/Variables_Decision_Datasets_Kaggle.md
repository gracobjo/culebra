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

## 3. Datasets Kaggle recomendados

### Prioridad 1 — tienda física: tráfico, ventas, ticket

| Dataset | Enlace | Variables análogas | Uso para vosotros |
|---------|--------|--------------------|-------------------|
| **Retail Sales Forecast Dataset 2026** | [kaggle.com/datasets/mmumairkhattak/retail-sales-forecast-dataset-2026](https://www.kaggle.com/datasets/mmumairkhattak/retail-sales-forecast-dataset-2026) | `Customer_Footfall`, `Units_Sold`, `Unit_Price`, `Sales_Amount`, `Promotion`, `Holiday`, `Season`, `Online_Orders`, `Inventory_Level`, `Marketing_Spend` | Predecir **sales / units** a partir de footfall, precio, promo, festivo → proxy de **conversión** (`sales_events / footfall`) y **ticket** |
| **Retail Store Sales Transactions (2022–2024)** | [kaggle.com/datasets/mahmoudmansour22/retail-store-sales-transactions-20222024](https://www.kaggle.com/datasets/mahmoudmansour22/retail-store-sales-transactions-20222024) | `total_spent`, `category`, `quantity`, `discount`, `location` (in-store/online), `customer_segment` | Ticket, mix categoría, online vs físico |
| **Retail Store Performance** | [kaggle.com/datasets/hanzla121/retail-store-performance-dataset](https://www.kaggle.com/datasets/hanzla121/retail-store-performance-dataset) | Ventas por tienda trial/control | Impacto de “intervenciones” (como montar isla de cestas / impulso) |

**Cómo bajar el primero (ejemplo):**

```bash
# Requiere cuenta Kaggle + kaggle.json en ~/.kaggle/
pip install kaggle
kaggle datasets download -d mmumairkhattak/retail-sales-forecast-dataset-2026 -p ./data/kaggle/retail-forecast --unzip
```

### Prioridad 2 — cesta / impulso / cross-sell

| Dataset | Enlace | Variables análogas | Uso |
|---------|--------|--------------------|-----|
| **Instacart Market Basket Analysis** | [kaggle.com/competitions/instacart-market-basket-analysis](https://www.kaggle.com/competitions/instacart-market-basket-analysis) | Órdenes, productos, `add_to_cart_order`, `reordered` | Predecir **qué se añade a la cesta** (miel+loncheado, tote+cesta) · market basket |
| **Online Retail II (UCI)** | [kaggle.com/datasets/cgrymn/online-retail-ii-uci-dataset](https://www.kaggle.com/datasets/cgrymn/online-retail-ii-uci-dataset) | Invoice, StockCode, Quantity, Price, CustomerID | Ticket, recurrencia, RFM; proxy marketplace online |
| **Fuzzy Factory (Maven)** | [kaggle.com/datasets/sonalisingh1411/fuzzy-factory-e-commerce-and-marketing-database](https://www.kaggle.com/datasets/sonalisingh1411/fuzzy-factory-e-commerce-and-marketing-database) | Sessions → pageviews → orders, `utm_*`, devices | **Conversión web** y atribución (pedidos online desde showroom / QR) |

### Prioridad 3 — canal alojamientos / turismo

| Dataset | Enlace | Variables análogas | Uso |
|---------|--------|--------------------|-----|
| **Hotel booking demand** | [kaggle.com/datasets/jessemostipak/hotel-booking-demand](https://www.kaggle.com/datasets/jessemostipak/hotel-booking-demand) (versión clásica) | `hotel`, `is_canceled`, `lead_time`, `adr`, `market_segment`, `country`, temporada | Demanda alojamiento, canal, ADR → proxy de **volumen de huéspedes** susceptibles de derivación |
| **Hotel Booking + indicadores económicos** | [kaggle.com/datasets/mlardi/hotel-booking-demand-with-economic-indicators](https://www.kaggle.com/datasets/mlardi/hotel-booking-demand-with-economic-indicators) | Mismo + CPI, fuel, sentiment | Estacionalidad / entorno macro sobre visitas |

### Prioridad 4 — marketing / captación

| Dataset | Enlace | Uso |
|---------|--------|-----|
| **Retail Customer & Transaction** | [kaggle.com/datasets/raghavendragandhi/retail-customer-and-transaction-dataset](https://www.kaggle.com/datasets/raghavendragandhi/retail-customer-and-transaction-dataset) | `conversion_rate`, campaigns, ROI → proxy captación contacto / campañas |

### Alternativa académica (fuera de Kaggle, muy citada)

[Dominick’s Finer Foods – Kilts Center](https://www.chicagobooth.edu/research/kilts/datasets/dominicks): tráfico diario por tienda + movimiento UPC (precio, unidades, margen). Útil si queréis un benchmark “serio” de retail físico; registro institucional.

---

## 4. Mapa variable Culebra → columna típica Kaggle

| Variable Culebra | Columna / feature en datasets | Notas |
|------------------|-------------------------------|-------|
| Visitas / día | `Customer_Footfall`, traffic | Agregar por día/tienda |
| Conversión | purchases / footfall (derivada) | Rara vez viene lista |
| Ticket / AOV | `Sales_Amount/n_tx`, `total_spent`, `adr` | |
| Unidades SKU | `Units_Sold`, Instacart `order_products` | |
| Impulso / attach | Items por ticket > 1, o productos “add-on” | Feature engineering |
| Promo / festivo | `Promotion`, `Holiday`, `Season` | Temporada berrea/Navidad |
| Pedidos online | `Online_Orders`, Fuzzy Factory orders | |
| Inventario tote | `Inventory_Level` | |
| Canal hotel | `market_segment`, `distribution_channel` | No es “partner rural”, pero sirve de proxy de canal |
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

1. **Bajar** Retail Sales Forecast 2026 + Instacart (o Online Retail II) + Hotel booking.  
2. **Derivar** features: `conversion = f(sales_tx, footfall)`, `aov`, `items_per_basket`, flags festivo/promo.  
3. **Modelos baseline:**  
   - Regresión: predecir `Sales_Amount` o `aov` (RandomForest / XGBoost / Ridge).  
   - Clasificación: ¿compra sí/no dada visita+contexto? (si construís etiqueta).  
   - Association rules / lift: miel ↔ loncheado, cesta ↔ tote (Instacart).  
4. **Calibrar** con vuestros datos de `/admin/showroom` (quincenal): mismas columnas (`visits`, `purchases`, `attach`, uds 8 SKU).  
5. **No mezclar** escalas: reentrenar o fine-tune con filas reales del showroom cuando tengáis ≥ 8–12 quincenas.

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
- Hotel booking es de **hoteles** (Portugal / genérico), no casas rurales de La Raya: útil para estacionalidad y canales, no para contraprestaciones L1–L4.  
- Instacart es **grocery delivery** EE.UU.: útil para **co-ocurrencia** de productos, no para PVP en €.  
- La predicción útil de negocio nacerá cuando el CSV quincenal del showroom tenga historial; Kaggle acelera el diseño del modelo.

---

*Documento vivo. Actualizar cuando se añadan variables al panel o se fijen datasets de entrenamiento en el repo (`data/kaggle/…`, gitignored si son grandes).*
