# Andarríos — Sistema de Parqueadero

PWA offline-first para el conjunto residencial Andarríos. Vigilante sin login, panel admin remoto autenticado, datos sincronizados con Supabase.

## Stack

- **Next.js 14 (App Router)** + **TypeScript** + **Tailwind**
- **Supabase** — Postgres + Auth + Realtime
- **Dexie (IndexedDB)** — caché offline + cola de operaciones
- **Service Worker** — app-shell instalable como PWA

## Cómo funciona offline

Cada acción del vigilante (registrar visitante, marcar pagado, etc.) se escribe primero en IndexedDB; la UI se actualiza al instante. Una entrada se agrega a la `queue` que un runner procesa contra Supabase cuando hay red. Cuando la red vuelve, la cola se drena automáticamente. Realtime mantiene IndexedDB al día con los cambios remotos (admins, otro vigilante, etc.).

## Variables de entorno

Crea `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://yuxllsjvbaabqmselqro.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_…
```

## Desarrollo local

```bash
npm install
npm run dev
```

Abre <http://localhost:3000>.

## Rutas

- `/` Dashboard con métricas en tiempo real
- `/visitantes` Ingreso y salida con cobro automático
- `/residentes` Registro de vehículos por torre/apto
- `/mensualidades` Estado de pagos del mes
- `/control` Bloqueo de aptos morosos y placas aprobadas
- `/caja` Cierre de caja diario
- `/tarifas` Configuración de tarifas (clave por defecto: `123456`)
- `/reportes` Exportar datos a Excel
- `/admin` Panel admin con login (vista de movimientos, pagos, cierres)

## Despliegue

El proyecto está conectado a Vercel. Cualquier push a `main` redespliega automáticamente.
