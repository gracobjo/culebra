# Procedencia de visitantes y compradores — Showroom

![Logo Sabores de la Culebra](./imagenes/logo.png)

Sistema operativo para saber **de dónde vienen** las personas al showroom físico, alimentar KPIs y orientar marketing — pensado para **una sola persona** y captura en **10–15 segundos**.

**Panel:** `/admin/showroom/estadisticas` (bloque «¿De dónde nos visitáis?» arriba).

---

## 1. Principio de diseño

- Rápido: menos de 15–20 s por registro.
- No parece un interrogatorio: pregunta conversacional + toques en pantalla.
- Sirve para **visita** y **compra**.
- Datos en base de datos, export CSV y KPIs automáticos (ritual quincenal).

---

## 2. Flujo en el showroom

### A. Pregunta natural (script)

En caja o mientras miran productos:

> «¿De dónde nos visitáis?»  
> o  
> «¿Venís de por aquí cerca o de fuera?»

Si captáis contacto:

> «Perfecto. Si quieres, te dejo el WhatsApp / QR por si más adelante quieres cestas o novedades.»  
> Marcar **Contacto captado** en el formulario.

### B. Registro digital (recomendado)

En móvil/tablet, abrir `/admin/showroom/estadisticas`:

1. **Tipo:** Visita o Compra  
2. **Procedencia:** grupo fijo (ver tabla abajo)  
3. Opcional: localidad, canal, contacto, nota  
4. **Guardar registro**

Cada guardado **suma +1** al día en estadísticas diarias (visitas, compras o contactos según corresponda).

### C. Alternativa papel

Si no hay cobertura, usar hoja con columnas: Fecha · Tipo · Procedencia · Canal · Notas. Trasladar al panel cuando haya conexión.

---

## 3. Grupos de procedencia (fijos)

| Grupo | Ejemplos |
|-------|----------|
| **Local** | Villardeciervos y pueblos muy cercanos |
| **Zamora provincia** | Resto de la provincia |
| **Castilla y León** | León, Salamanca, Valladolid… |
| **Madrid y alrededores** | Comunidad de Madrid |
| **Otras CCAA** | Galicia, País Vasco, Cataluña, Andalucía… |
| **Extranjero** | Portugal, Francia, resto |
| **No indicado** | Cuando no se averigua |

Detalle opcional en campo **Localidad** (ej. «Madrid – Las Rozas»).

### Canales (opcional)

| Canal | Uso |
|-------|-----|
| Alojamiento | Partner rural / bienvenida |
| Pasaba / de paso | Turismo de paso |
| Redes sociales | Instagram, etc. |
| Recomendación | Boca a boca |
| Otro | — |

---

## 4. KPIs (panel automático)

Cada mes o cada **15 días** revisar en el bloque «KPIs de procedencia»:

| KPI | Para qué |
|-----|----------|
| % locales vs de fuera | Horarios y mensaje territorial |
| Top grupos / localidades | Campañas geográficas |
| % vía alojamiento | Canal rural y cestas partners |
| % contacto captado | Segmentación WhatsApp/email |
| Compras vs visitas | Conversión por origen |

**Export CSV:** botón en el mismo bloque → Excel / Google Sheets.

---

## 5. Marketing personalizado (ideas)

| Origen | Mensaje orientativo |
|--------|---------------------|
| Madrid y grandes ciudades | «Llévate la sierra a casa» + envío |
| Zamora provincia | «Productos de aquí, para regalar o para casa» |
| Alojamientos | Recordatorio cestas y packs |
| Extranjero | Versión más visual, menos texto |

---

## 6. Implantación en 3 pasos

| Paso | Acción | Cuándo |
|------|--------|--------|
| 1 | Probar formulario en `/admin/showroom/estadisticas` | Esta semana |
| 2 | Incluir pregunta en script de atención | Día 1 de apertura |
| 3 | Revisar KPIs + export cada 15 días | Ritual quincenal |

---

## 7. Técnico

| Pieza | Ubicación |
|-------|-----------|
| Modelo BD | `ShowroomFootfallEntry` en `packages/db/prisma/schema.prisma` |
| Servicio | `packages/auth/src/showroom-footfall.service.ts` |
| UI captura | `apps/web/src/components/admin/showroom-footfall-panel.tsx` |
| KPIs | `apps/web/src/components/admin/showroom-footfall-insights.tsx` |
| Export API | `GET /api/admin/showroom/footfall/export?from=&to=` |
| Migración | `20260826120000_showroom_footfall_entries` |

Tras desplegar: `npm run db:migrate` y recompilar `@culebra/auth` si el web resuelve a `dist/`.

---

*Documento alineado con el playbook operativo del showroom y el panel Stats showroom.*
