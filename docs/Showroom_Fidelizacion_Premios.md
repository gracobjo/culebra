# Fidelización showroom — premios instantáneos y club

![Logo Sabores de la Culebra](./imagenes/logo.png)

Sistema **sencillo, barato y gestionable por una sola persona**: rasca y gana, tarjeta de sellos, Club WhatsApp, trae a un amigo e integración con procedencia.

**Panel:** `/admin/showroom/fidelizacion`

---

## 1. Rasca y gana

### En el local

- Tarjeta kraft impresa (ver texto modelo abajo).
- Se entrega al entrar o al pagar.
- El cliente rasca; tú registras el resultado en el panel (**Visita** o **Compra** → **Registrar rasca**).

### Mecánica (software)

| Elemento | Valor por defecto |
|----------|-------------------|
| Frecuencia | 1 premio cada **5** rascas (~20 %) |
| Tope mensual | **40** premios (configurable) |
| Premios | Solo producto o descuento (nunca efectivo) |

### Catálogo de premios

| Premio | Coste orientativo | Límite/mes |
|--------|-------------------|------------|
| Mini-cata gratis | Muy bajo | sin tope práctico |
| 10 % dto compra del día | Bajo | sin tope práctico |
| Miel pequeña o loncheado | Medio | 30 |
| Upgrade cesta Escapada→Comarca | Medio | 12 |
| Tote bag | Medio | 10 |
| Cesta Escapada gratis | Alto | **2** |

### Texto tarjeta (impresión)

```text
¡Rasca y gana!
Premios: degustación, descuentos y productos de la sierra.

SABORES DE LA CULEBRA
Esencia artesana de la tierra salvaje
```

---

## 2. Tarjeta de sellos

- Kraft con **6 círculos** (configurable al crear).
- Cada compra = **+ sello** en el panel (buscar tarjeta por código `ST-0001`).
- Al completar: tote, mini-cesta o **15 %** siguiente compra (elige según stock).
- Botón **Canjear** cuando entregues el premio.

---

## 3. Club de la Sierra (WhatsApp)

Al pedir contacto:

- Alta en panel con nombre + WhatsApp/email.
- Se genera código promocional según procedencia:
  - **Madrid / lejos:** `ENVIO-SIERRA-XXXX` → mensaje «te lo enviamos a casa».
  - **Local / Zamora:** `VUELVE-SIERRA-XXXX` → «completa tu tarjeta de sellos».
- Beneficios: lotes nuevos, ediciones limitadas, código 1–2 veces al año.
- Cumpleaños opcional (campo fecha).

---

## 4. Trae a un amigo

- Frase: «Me ha traído [nombre]».
- Si el amigo **compra**, marcar y entregar detalle a **ambos** (degustación o 10 % dto).
- Panel: pendientes de premio vs ya entregados.

---

## 5. Combinación recomendada (6 primeros meses)

| Herramienta | Prioridad | Objetivo |
|-------------|-----------|----------|
| Rasca y gana | Alta | Experiencia + ticket |
| Tarjeta sellos | Alta | Segunda visita |
| Club WhatsApp | Alta | Contacto → online |
| Trae amigo | Media | Crecimiento orgánico |
| Premios por procedencia | Media | Mensaje personalizado (club + stats) |

---

## 6. Ritual mensual / quincenal

1. Revisar KPIs en `/admin/showroom/fidelizacion` (% rascas premiadas, sellos completados, altas club).
2. Revisar procedencia en `/admin/showroom/estadisticas`.
3. Ajustar reglas del mes si hace falta (cada N rascas, máximo premios).
4. Imprimir nueva tirada de tarjetas (100–200 uds).

---

## 7. Mensaje de marca

> «En la sierra se agradece la visita y se recompensa al que vuelve.»

Tono cercano, territorial, generoso en la medida justa. Sin agresividad comercial.

---

## 8. Técnico

| Pieza | Ruta |
|-------|------|
| UI | `apps/web/src/app/admin/showroom/fidelizacion/` |
| Servicio | `packages/auth/src/showroom-loyalty.service.ts` |
| Migración | `20260826130000_showroom_loyalty` |

Tras desplegar: `npm run db:migrate`.

---

*Complementa [`Showroom_Procedencia_Visitantes.md`](./Showroom_Procedencia_Visitantes.md) y el playbook [`Showroom_Optimizacion_90_Dias.md`](./Showroom_Optimizacion_90_Dias.md).*
