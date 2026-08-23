# Cuaderno de Ejecución y Justificación

**Proyecto:** Marketplace *Sabores de la Culebra* — Villardeciervos (Zamora)  
**Naturaleza:** Herramienta **interna** de seguimiento. No se presenta tal cual a la Administración.  
**Función:** Alimentar la Memoria Técnica Justificativa con datos reales (contratos, facturas, pagos, entregables, indicadores).

**Marco metodológico:** [`Marco_Documentacion_Expediente.md`](./Marco_Documentacion_Expediente.md)

---

## 0. Instrucciones de uso

1. Actualizar este cuaderno **en el momento** de cada contrato, factura, pago o hito — no reconstruir al final.  
2. Cada fila debe poder responder: *¿de qué partida sale?, ¿quién lo ejecutó?, ¿cuánto costó?, ¿está pagado?, ¿qué entregable lo prueba?, ¿es subvencionable?*  
3. Los **objetivos** viven en la Memoria de Proyecto; aquí solo **resultados** medidos o acreditados.  
4. No incluir datos personales innecesarios en copias compartidas; el cuaderno maestro puede contener referencias internas (nº contrato, carpeta documental).

---

## 1. Resumen de seguimiento presupuestario

| Código partida | Partida | Presupuesto | Contratado | Ejecutado | Pagado | Justificado | Admitido | Evidencia principal |
|----------------|---------|----------:|-----------:|----------:|-------:|------------:|---------:|---------------------|
| A.I | Desarrollo núcleo marketplace (servicio) | 14.500 € | | | | | | |
| A.II | Pagos, seguridad y producción (servicio) | 8.500 € | | | | | | |
| B | Equipamiento informático | 2.000 € | | | | | | |
| C | Red y ciberseguridad | 1.500 € | | | | | | |
| D | Adecuación de espacio operativo | 2.500 € | | | | | | |
| E | Logística ligera y puestos | 1.000 € | | | | | | |
| — | Gastos de funcionamiento | ≥ 2.170 € | | | | | | no subvencionables salvo base |
| — | Fondo de maniobra | 10.000 € | | | | | | no subvencionable |
| | **Total inversión subvencionable potencial** | **30.000 €** | | | | | | |

*Presupuesto alineado con [`Memoria_Tecnica_Justificativa_ICECYL_Diputacion_LaRaya_v1.md`](./Memoria_Tecnica_Justificativa_ICECYL_Diputacion_LaRaya_v1.md) §25.2 (ajuste contrato menor: A.I + A.II ≤ 15.000 € c/u).*

---

## 2. Registro de proveedores y contratos

| ID | Proveedor | Servicio / bien | Partida | Contrato | Inicio | Fin | Importe (neto) | Subvencionable | Facturado | Pagado | Entregables | Carpeta |
|----|-----------|-----------------|---------|----------|--------|-----|---------------:|----------------|----------:|-------:|-------------|---------|
| P001a | *(pendiente)* | Desarrollo núcleo marketplace | A.I | CT-001a | | | **14.500 €** | a confirmar | | | A.1–A.3 + A.5a | |
| P001b | *(pendiente)* | Pagos, seguridad y producción | A.II | CT-001b | | | **8.500 €** | a confirmar | | | A.4 + A.5b + A.6 | |
| P002 | *(pendiente)* | Equipamiento informático | B | CT-002 | | | 2.000 € | a confirmar | | | Albaranes / facturas | |
| P003 | *(pendiente)* | Red y ciberseguridad | C | CT-003 | | | 1.500 € | a confirmar | | | Instalación + facturas | |
| P004 | *(pendiente)* | Adecuación local | D | CT-004 | | | 2.500 € | a confirmar | | | Facturas obra / materiales | |
| P005 | *(pendiente)* | Mobiliario / logística ligera | E | CT-005 | | | 1.000 € | a confirmar | | | Albaranes | |
| P006 | *(pendiente)* | Asesoría / contabilidad | Funcionamiento | CT-006 | | | | no | | | | |
| P007 | *(pendiente)* | Marketing lanzamiento | Funcionamiento | CT-007 | | | | depende bases | | | | |

**Cadena obligatoria por gasto subvencionable:**

`Partida → proveedor → contrato → factura → pago → entregable → evidencia`

---

## 3. Hitos, entregables e indicadores

| Hito | Mes previsto | Entregable | Indicador (objetivo → resultado) | Evidencia | Estado |
|------|-------------|------------|----------------------------------|-----------|--------|
| H1 | 1 | S.L. constituida; plan de proyecto cerrado | Objetivo: constitución → Resultado: | Escritura, CIF | pendiente |
| H2 | 2 | Arquitectura y entorno base | Objetivo: arquitectura documentada → Resultado: | Repositorio, documentación | pendiente |
| H3 | 2–3 | Catálogo + panel productor en beta | Objetivo: módulo usable → Resultado: | Capturas, acceso piloto | pendiente |
| H4 | 3–4 | Pedidos end-to-end | Objetivo: flujo completo → Resultado: | Logs, pedidos prueba | pendiente |
| H5 | 4 | Pagos + retención 14 días validados | Objetivo: 5 validaciones → Resultado: | Informes pasarela | pendiente |
| H6 | 5 | Beta con piloto (5 productores) | Objetivo: 5 productores → Resultado: | Altas, contratos adhesión | pendiente |
| H7 | 6 | Lanzamiento público | Objetivo: apertura → Resultado: | URL producción, acta interna | pendiente |

---

## 4. Matriz de justificación ampliada (plantilla)

Completar una fila por subpartida o por gasto relevante.

| Partida | Proveedor | Contrato | Inversión (€) | Necesidad | Entregable | Indicador | Factura | Pago | Evidencia | Impacto | Subvención |
|---------|-----------|----------|-------------:|-----------|------------|-----------|---------|------|-----------|---------|------------|
| A.1 | | | | Base técnica multi-vendedor | Arquitectura + entorno | Documentación mes 2 | | | | Capacidad en Villardeciervos | |
| A.2 | | | | Digitalizar oferta productores | Catálogo + panel | Beta usable | | | | Digitalización local | |
| A.3 | | | | Canal compra unificado | Pedidos desglosados | Flujo end-to-end piloto | | | | Canal comercial | |
| A.4 | | | | Cobro y desistimiento | Split + retención | 5 validaciones pago | | | | Confianza canal | |
| A.5 | | | | Relación con proveedores | Panel admin | Contratos/comisiones operativos | | | | Gobernanza | |
| A.6 | | | | Seguridad y producción | Beta desplegada | Checklist seguridad | | | | Confianza institucional | |
| B | | | | Puestos de trabajo | Equipamiento instalado | Entorno local mes 2 | | | | Permanencia rural | |
| C | | | | Protección infraestructura | Red + firewall | Controles implantados | | | | Riesgo operativo | |
| D | | | | Espacio operativo | Local habilitado | Espacio usable mes 2–3 | | | | Fijación en municipio | |
| E | | | | Logística ligera | Báscula + etiquetado | ≥90% trazabilidad piloto | | | | Servicio rural | |

---

## 5. Empleo (objetivo vs acreditación)

| Concepto | Memoria de Proyecto (objetivo) | Cuaderno (resultado acreditado) | Documentación |
|----------|--------------------------------|---------------------------------|---------------|
| Puestos directos fase implantación | Coordinación / supervisión técnica según necesidad | | Contratos, altas SS, nóminas |
| Personal especializado externo | Servicios tecnológicos contratados | | Contratos, facturas |
| Empleo post-lanzamiento | Según evolución demanda | | Altas reales |

*No fijar el expediente a un único perfil interno imprescindible; la ejecución puede combinar recursos internos y externos.*

---

## 6. Subvención solicitada / concedida / justificada

| Convocatoria | Base elegible | % / importe solicitado | Resolución | Importe concedido | Justificado | Pendiente | Observaciones |
|--------------|-------------:|------------------------:|------------|------------------:|------------:|----------:|---------------|
| ICECYL creación empresas 2026 | 30.000 € (prev.) | 40% → 12.000 € (simul.) | pendiente | | | | |
| Diputación La Raya Línea 1 | complemento | 34% → 10.200 € (simul.) | pendiente | | | | |

---

## 7. Checklist documental por gasto (antes de cerrar justificación)

- [ ] Contrato o pedido firmado vinculado a partida presupuestaria  
- [ ] Factura con concepto identificable y fecha dentro del periodo elegible  
- [ ] Justificante de pago (transferencia, extracto)  
- [ ] Entregable o evidencia técnica (informe, despliegue, albarán, acta recepción)  
- [ ] Indicador SMART medido (si aplica)  
- [ ] Clasificación subvencionable confirmada con bases / consulta ICECYL  
- [ ] Copia archivada en carpeta del proveedor (columna «Carpeta» §2)

---

## 8. Bitácora de cambios (extracto)

| Fecha | Autor | Cambio |
|-------|-------|--------|
| 2026-08-20 | — | Creación del cuaderno. Estructura alineada con Marco_Documentacion_Expediente. |

---

*Actualizar en paralelo a la ejecución. La Memoria Técnica Justificativa definitiva se redactará extrayendo datos verificados de este cuaderno.*
