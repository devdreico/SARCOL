# SARCOL · Sociedad Autónoma Regulatoria de Cumplimiento en Operaciones Legales

Plataforma web imparcial de datos sobre Colombia. Sin comentarios, sin contacto, sin opinión:
**el dato es la herramienta y el voto es el mecanismo.** Si la ciudadanía queda dividida,
SARCOL lo muestra — esa es la imparcialidad.

## Estructura

```
backend/          FastAPI + SQLAlchemy + APScheduler (SQLite en backend/data/sarcol.db)
frontend/         Vite + React 19 + TypeScript + TailwindCSS v4 + Framer Motion + d3-geo
assets/           Logo oficial
```

## Cómo correr

### Backend (puerto 8100)

```bash
cd backend
.venv/bin/uvicorn main:app --port 8100
```

- Al arrancar crea tablas, siembra historia/problemáticas y programa la verificación diaria (10:00 UTC · 05:00 Colombia).
- Sirve el frontend compilado (`frontend/dist`) con catch-all SPA: abra `http://localhost:8100`.
- API: `/api/estado/arbol`, `/api/historia`, `/api/problematicas`, `/api/soluciones`, `/api/mapa/datos`, `/api/votos/*`, `/api/meta/*`.

### Actualizar el contenido (historia + problemáticas)

Edite los seeds y re-sincronice:

```bash
cd backend
.venv/bin/python -m app.resync          # inserta registros nuevos (idempotente)
.venv/bin/python -m app.resync --full   # borra y vuelve a sembrar historia + problemáticas
```

`--full` no toca indicadores ni votos. La ficha `elecciones-2026` queda marcada
`verificacion: "pendiente-manual"` hasta tener resultados oficiales.

### Verificación manual de fuentes en vivo

```bash
curl -X POST http://localhost:8100/api/meta/refrescar
```

Orquesta: Banco Mundial (indicadores comparados) → SECOP II (procesos por departamento, datos.gov.co) → TRM (Superfinanciera). Todo queda en bitácora (`fuentes_log`).

### Frontend (desarrollo)

```bash
cd frontend
npm install   # primera vez
npm run dev   # puerto 5173, proxy /api → localhost:8100
```

### Frontend (producción)

```bash
cd frontend
npm run build   # genera frontend/dist; el backend lo sirve automáticamente
```

### Despliegue del frontend en Vercel

Importe el repositorio en Vercel y establezca `frontend` como **Root Directory**. Vercel usará `npm run build` y `dist` como salida. Configure la variable de entorno `VITE_API_URL` con el origen público del backend, sin `/api` al final (por ejemplo, `https://sarcol-api.example.com`), y vuelva a desplegar.

El backend FastAPI debe desplegarse por separado en un servicio con almacenamiento persistente para SQLite y soporte de procesos de larga duración para APScheduler. Vercel ejecuta funciones efímeras y no garantiza la persistencia de SQLite ni un scheduler continuo, por lo que alojar allí el backend actual no es un despliegue funcional de extremo a extremo. El proxy de `/api` en Vite sigue habilitado para desarrollo local.

## Fuentes por prioridad TIER

1. **TIER 1 · Estatales** — DANE, Banco Mundial (series oficiales)
2. **TIER 2 · Institucionales** — SECOP II (Colombia Compra Eficiente), Superfinanciera (TRM), Rama Judicial
3. **TIER 3 · Verificado/comparativo** — La Silla Vacía, Cuestión Pública, Consejo de Redacción, VerdadAbierta, CNMH/JEP/Comisión de la Verdad

## Principios

- **Voto 1 por dispositivo**: huella hasheada (SHA-256) en el servidor; duplicados rechazados. Anónimo, sin comentarios, sin contacto.
- **Doble explicación** por dato: lenguaje simple + respaldo técnico con fuente.
- **Historia con rigor escalonado** (medio → técnico alto → extremo) y responsables por suceso, sin importar el bando.
- **Problemáticas en pirámide** (nacional → departamental → municipal) con voto binario (sin opción neutral).
