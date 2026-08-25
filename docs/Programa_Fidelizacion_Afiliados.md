# Estrategias de fidelización de afiliados — Sabores de la Culebra

**Objetivo:** que los afiliados no solo se apunten, sino que **recomienden de forma recurrente** y no abandonen el programa.

Documentos relacionados:

- [`Programa_Afiliados_Sabores_Culebra.md`](./Programa_Afiliados_Sabores_Culebra.md) — alta, comisiones y ledger
- [`Modelos_Comisiones_Consolidado.md`](./Modelos_Comisiones_Consolidado.md) — reparto productor + canal

Panel operativo: **`/admin/afiliados`** → sección **Fidelización**.

---

## 1. Principios de fidelización

1. **Pagar bien y a tiempo.**
2. **Darles material y facilidad.**
3. **Hacerles sentir parte del proyecto** (territorio + producto).
4. **Reconocer el volumen y la constancia.**
5. **Comunicar de forma breve y útil** (no saturar).

---

## 2. Estrategias prioritarias

### A. Pago claro, rápido y predecible

| Acción | Detalle |
|--------|---------|
| Periodicidad | Mensual o trimestral (fija) |
| Mínimo de pago | 30–40 € |
| Transparencia | Informe sencillo de ventas generadas (export CSV en admin) |
| Rapidez | Pagar en los **primeros 10 días** del periodo siguiente |

**Efecto:** es la base de la confianza. Sin esto, el resto falla.

**En el sistema:** campo `payoutFrequency` (Mensual / Trimestral) y `payoutMinimum` por afiliado; ledger + marcar pago en `/admin/afiliados`.

### B. Escala de beneficios por volumen (rappels de afiliado)

| Nivel | Ventas generadas (orientativo) | Beneficio extra |
|-------|-------------------------------|-----------------|
| Inicial | 0–300 €/trimestre | Comisión base 8–10 % |
| Activo | 300–800 €/trimestre | +1 % comisión o detalle de producto |
| Destacado | > 800 €/trimestre | +2 % comisión o cesta regalo + prioridad |

**En el sistema:** el panel calcula volumen trimestral (PVP atribuido) y sugiere subida de nivel. Umbrales: 300 € y 800 €.

### C. Material siempre actualizado y fácil de usar

- Pack de imágenes de cestas y productos (actualizado cada temporada).
- Textos cortos listos para WhatsApp y redes.
- Novedades de temporada (Berrea, Navidad, verano…) con antelación.
- **Un solo enlace o código** por afiliado.

### D. Comunicación de valor (no comercial agresiva)

**Frecuencia:** 1 mensaje cada **3–4 semanas**.

Contenido útil:

- Nueva cesta o producto que funciona bien
- Resultado de otros afiliados (sin datos sensibles)
- Consejo de cómo presentar el producto
- Aviso de temporada alta

### E. Reconocimiento y pertenencia

- Detalle físico 1–2 veces al año (cesta pequeña, miel, tote bag).
- Mención en redes cuando un afiliado destaque (con permiso).
- Invitación a visitar el showroom o a una cata.
- Trato preferente en novedades y ediciones limitadas.

### F. Formación ligera

Mini-guía de 1 página: «Cómo recomendar Sabores de la Culebra».

- Argumentos según tipo de cliente (turista, local, regalo…).
- Respuestas a objeciones: «¿Por qué no es más barato?», «¿Es de verdad artesano?»…

---

## 3. Acciones según tipo de afiliado

| Tipo | Qué más les fideliza |
|------|----------------------|
| **Alojamiento** | Facilidad de reposición + precio especial + quedar bien con el huésped |
| **Productor** | Que no le canibalicen sus ventas + transparencia + trato de igual a igual |
| **Blog / creador** | Material visual de calidad + producto para reseña + mensajes exclusivos |
| **Guía / experiencia** | Comisiones claras por grupo + material para enseñar en ruta |
| **Embajador particular** | Reconocimiento + detalle + sensación de formar parte del proyecto |

---

## 4. Programa en 3 niveles (simple)

| Nivel | Nombre | Requisitos | Beneficios |
|-------|--------|------------|------------|
| 1 | **Colaborador** | Activo en el programa | Comisión base + material |
| 2 | **Embajador** | Volumen recurrente o calidad de recomendaciones | +1 % comisión + detalle trimestral |
| 3 | **Partner** | Alto volumen o aportación estratégica | +2 % + cesta regalo + mención + acceso prioritario |

**En el sistema:** enum `loyaltyTier` → `COLLABORATOR` | `AMBASSADOR` | `PARTNER`.

---

## 5. Métricas para saber si se están fidelizando

| Métrica | Dónde verla |
|---------|-------------|
| % afiliados con ≥ 1 venta en el trimestre | `/admin/afiliados` → Fidelización |
| Nº afiliados activos / total | Misma sección |
| Volumen medio por afiliado activo | Misma sección |
| Tasa de abandono (dejan de promocionar) | Revisión manual + `orderCount` / clicks |
| Nº de afiliados que suben de nivel | Tabla «candidatos a subir» |

---

## 6. Plan de fidelización — primeros 6 meses

| Mes | Acción principal |
|-----|------------------|
| 1–2 | Pago puntual + material básico + primer contacto de valor |
| 3 | Revisar resultados y feedback individual a los activos |
| 4 | Lanzar niveles (Colaborador / Embajador) |
| 5 | Detalle físico a los que hayan generado ventas |
| 6 | Encuesta corta + ajuste de condiciones si hace falta |

---

## 7. Errores que hay que evitar

- Prometer comisiones altas y luego **retrasar los pagos**
- No dar **material actualizado**
- Comunicar **solo cuando interesa vender**
- Tratar igual al que genera ventas y al inactivo
- **Complicar** códigos o reporting

---

## Resumen

La fidelización de afiliados se basa en:

1. Pagar bien y a tiempo
2. Darles facilidad y material
3. Premiar volumen y constancia
4. Hacerles sentir parte del territorio y del proyecto
5. Comunicar poco, pero con valor
