# Comparativa de comisión: 15 % vs 17 %

![Logo Sabores de la Culebra](./imagenes/logo.png)

**Escenario prudente — Marketplace Villardeciervos (Sabores de la Culebra)**

Documento de referencia para la **decisión adoptada** del plan de viabilidad. Resume la comparativa cerrada del expediente (sin sensibilidades 16 % / 18 %).

**Referencias:** [`Plan_Viabilidad_Marketplace_Villardeciervos.md`](../Plan_Viabilidad_Marketplace_Villardeciervos.md) §5.G · [`Sensibilidad_Costes_Plan_Viabilidad.md`](./Sensibilidad_Costes_Plan_Viabilidad.md) · [`commissions.md`](./commissions.md) · simulador `/admin/plan`.

---

## Hipótesis comunes

| Concepto | Valor |
|----------|------:|
| Ticket medio | **62 €** |
| Coste medios de pago (Stripe) | **≈ 1,5 %** del GMV |
| Envío | **Siempre al cliente** (tarifa plana ~6,50 €; la S.L. no absorbe portes) |
| Costes fijos mensuales (Mes 7+) | **1.250 €** |
| GMV prudente Año 1 (6 meses) | **14.000 €** |
| GMV prudente Año 2 | **48.000 €** |
| GMV prudente Año 3 | **75.000 €** |

---

## 1. Margen por pedido y por GMV

| Concepto | Comisión **15 %** | Comisión **17 %** | Diferencia |
|----------|------------------:|------------------:|-----------:|
| Comisión bruta por pedido (62 €) | 9,30 € | 10,54 € | **+1,24 €** |
| Coste Stripe aprox. | −1,15 € | −1,15 € | — |
| **Margen neto por pedido** | **8,15 €** | **9,39 €** | **+1,24 €** |
| Margen por cada 100 € de GMV | 13,50 € | 15,50 € | **+2,00 €** |
| % que recibe el productor | 85 % | 83 % | **−2 puntos** |

---

## 2. Punto de equilibrio (break-even)

Costes fijos mensuales de referencia (a partir del Mes 7): **1.250 €**.

| Indicador | Comisión **15 %** | Comisión **17 %** | Mejora |
|-----------|------------------:|------------------:|-------:|
| GMV de equilibrio mensual | 9.260 € | **8.065 €** | **−1.195 €** |
| Pedidos/mes necesarios (ticket 62 €) | 149 | **130** | −19 |
| Pedidos/día aproximados | 5,0 | **4,3** | −0,7 |

Con el **17 %** se necesita aproximadamente un **13 % menos de volumen** para alcanzar el equilibrio.

Fórmula orientativa (margen unitario tras Stripe a 17 %):  
`GMV equilibrio ≈ costes fijos ÷ 0,155` → **≈ 8.065 €/mes** con fijos 1.250 €.

---

## 3. Resultado de los 3 primeros años (escenario prudente)

GMV utilizado:

- **Año 1** (6 meses de venta): 14.000 €  
- **Año 2:** 48.000 €  
- **Año 3:** 75.000 €  

| Concepto | Año 1 | Año 2 | Año 3 | **Acumulado 3 años** |
|----------|------:|------:|------:|---------------------:|
| **Ingresos 15 %** | 2.100 € | 7.200 € | 11.250 € | 20.550 € |
| **Resultado neto orientativo 15 %** | −4.900 € | −9.700 € | −6.900 € | **−21.500 €** |
| **Ingresos 17 %** | 2.380 € | 8.160 € | 12.750 € | 23.290 € |
| **Resultado neto orientativo 17 %** | −4.220 € | −7.940 € | −4.100 € | **−16.260 €** |
| **Mejora con 17 %** | +680 € | +1.760 € | +2.800 € | **+5.240 €** |

---

## 4. Conclusión y recomendación

1. La comisión del **17 %** mejora de forma relevante el margen por pedido (**+1,24 €**) y reduce el punto de equilibrio en casi **1.200 €** de GMV mensual.
2. En el escenario prudente de los tres primeros años, la diferencia acumulada a favor del 17 % es de aproximadamente **5.240 €** (menores pérdidas).
3. El impacto para el productor es **moderado**: recibe **2 puntos porcentuales menos** (83 % frente a 85 %).
4. Se considera defendible comercialmente si se acompaña de:
   - **Sistema de rappels por volumen** (14 % y 12 % en tramos altos — ver [`Clausula_Comision_Rappels_Productor.md`](./Clausula_Comision_Rappels_Productor.md));
   - **Consolidación logística** multiproductor;
   - **Showroom físico** y acompañamiento al productor.

### Recomendación adoptada del plan

> Adoptar una **comisión base del 17 %**, complementada con **rappels por volumen** y un **mínimo por pedido (4 €)**, como equilibrio óptimo entre sostenibilidad de la S.L. y atractivo para los productores locales.

**Decisión cerrada del expediente:** 15 % vs 17 % → **17 %**. Sensibilidades a 16 % / 18 % se omiten a propósito en este documento.

---

## Implementación en plataforma

| Elemento | Valor / ubicación |
|----------|-------------------|
| Comisión por defecto | `DEFAULT_MARKETPLACE_COMMISSION_PERCENT = 17` (`@culebra/domain`) |
| Mínimo por subpedido | `DEFAULT_MIN_COMMISSION_EUR = 4` |
| Simulador admin | `/admin/plan` — función `compareCommissionRates()` en `financial-simulation.ts` |
| Infografía captación | `Guía_de_comisiones_para_productores.png` (raíz repo) |
