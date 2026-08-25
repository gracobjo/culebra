# Programa de afiliados — Sabores de la Culebra

Documento operativo para el piloto del programa de afiliados. Objetivo: **traer visitas al showroom y pedidos online**, pagando **solo por venta confirmada**, sin complicar la gestión administrativa.

## Resumen de decisión

| Aspecto | Decisión |
|---------|----------|
| Comisión | 8–10 % sobre PVP productos (sin portes) |
| Tope máximo | 10 % |
| Pago | Solo por venta confirmada |
| Arranque | Alojamientos rurales + productores colaboradores |
| Gestión inicial | Códigos únicos + panel admin + export CSV |
| Cookie / atribución | 15–30 días (`?ref=CODIGO`) |

## Tipos de afiliados

| Tipo | Prioridad | Comisión recomendada |
|------|-----------|----------------------|
| Alojamiento rural | Alta | 10 % |
| Productor colaborador | Alta | 8–10 % (no sobre sus propias ventas) |
| Creador / blog turismo rural | Media-alta | 8–10 % |
| Guía / experiencia | Media | 8 % |
| Embajador particular | Media | 8 % o detalle en producto |
| Tienda / espacio afín | Baja al inicio | 8 % |

## Modelo de comisión

| Acción | Comisión | Condiciones |
|--------|----------|-------------|
| Venta online (código/enlace) | 8–10 % PVP productos | Sin portes |
| Cesta a través del afiliado | 10 % | Sobre PVP de la cesta |
| Visita showroom que compra | 5–8 % | Registro manual si hay identificación |
| Lead cualificado | No recomendado al inicio | Mejor pagar por venta |

**Reglas generales**

- No se paga comisión sobre pedidos cancelados o devueltos (cancelar la línea en el ledger).
- El afiliado no puede pujar por la marca en Google ni hacer spam.
- La S.L. puede suspender un afiliado si perjudica la imagen de marca.
- Pago mensual o trimestral cuando supere el mínimo (30–40 € configurable por afiliado).

## Implementación en el sistema

### Panel admin

Ruta: **`/admin/afiliados`**

Funciones:

1. **Alta de afiliados** con tipo, comisión, contacto, mínimo de pago y vínculo opcional a alojamiento o productor.
2. **Enlace de atribución**: `{APP_URL}/productos?ref=CODIGO` (cookie `culebra_ref`, 30 días por defecto).
3. **Comisión automática** al confirmar el pago de un pedido online con `affiliateCode`.
4. **Registro manual** de ventas showroom atribuidas.
5. **Ledger** de comisiones pendientes / pagadas y **export CSV**.
6. **Exclusión productor**: si el afiliado es productor (`vendorId`), no se comisionan líneas de su propio catálogo.

### Flujo técnico

```
Visitante → ?ref=ALOJ-MONTAÑA → cookie culebra_ref
Checkout → pedido con affiliateCode → incremento orderCount
Pago confirmado (Stripe/webhook) → recordAffiliateCommissionForOrder
Admin → revisar ledger → marcar pago → CSV para contabilidad
```

### Fase piloto (5–8 afiliados)

1. Crear códigos en `/admin/afiliados` (ej. `ALOJ-MONTAÑA`, `PROD-LONCHEADO`, `BLOG-SIERRA`).
2. Enviar enlace + condiciones de 1 página + pack imágenes.
3. Revisar ledger mensualmente; exportar CSV.
4. Si supera 15–20 afiliados activos, valorar Rewardful / FirstPromoter.

## Materiales para el afiliado

- Código o enlace personalizado
- Imágenes de cestas y productos (pack básico)
- Textos cortos para redes y WhatsApp
- Condiciones resumidas (este documento, sección «Resumen»)
- Contacto directo de soporte

### Mensaje de captación (WhatsApp)

> Hola, estamos lanzando un programa de afiliados de Sabores de la Culebra. Si recomiendas nuestros productos o cestas y se produce una venta con tu código, te llevas un 10 % de comisión. Es sencillo, sin permanencia y compatible con tu actividad. ¿Te envío las condiciones?

## Riesgos y mitigación

| Riesgo | Mitigación |
|--------|------------|
| Comisiones demasiado altas | Tope 10 % en validación |
| Afiliados de baja calidad | Selección manual al inicio |
| Conflicto con productores | No comisionar ventas propias del productor afiliado |
| Complejidad administrativa | Códigos + ledger + CSV; sin software externo al inicio |
| Deterioro de marca | Condiciones de uso de imagen y mensajes; suspensión |

## Plan en 3 fases

1. **Piloto**: 5–8 afiliados (alojamientos + 1–2 productores + 1 creador).
2. **Extensión**: más alojamientos y blogs de turismo rural.
3. **Sistema**: si >15–20 afiliados activos, integrar herramienta automática externa.

## Relación con otras áreas

- **Modelo consolidado** ([`Modelos_Comisiones_Consolidado.md`](./Modelos_Comisiones_Consolidado.md)): cómo se combinan comisión productor + canal externo + margen neto.
- **Turismo / alojamientos** (`/admin/turismo`): CRM de hosteleros; los códigos de alojamiento pueden crearse también desde afiliados.
- **Showroom procedencia** (`/admin/showroom/estadisticas`): complementa la atribución física; ventas showroom con código se registran manualmente en afiliados.
- **Fidelización** (`/admin/showroom/fidelizacion`): programas distintos (premios vs comisión B2B).
