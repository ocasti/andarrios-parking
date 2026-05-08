# Andarríos — Parqueadero

PWA offline-first para gestión de parqueadero residencial. Funciona sin conexión y sincroniza automáticamente cuando hay red.

## Roles

| Rol | Acceso | Autenticación |
|---|---|---|
| **Vigilante** | Dashboard, Visitantes, Caja | PIN compartido del turno (12 h) |
| **Admin** | Todo lo anterior + Residentes, Mensualidades, Control, Tarifas, Reportes, Panel | Login Supabase |

---

## Stack

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TypeScript |
| Estilos | Tailwind CSS + styled-jsx (layout global) |
| DB local | Dexie 4 (IndexedDB) — offline-first |
| DB remota | Supabase (PostgreSQL + Realtime) |
| Auth | Supabase Auth (admin) + PIN RPC (vigilante) |
| Tests | Vitest + fake-indexeddb |

---

## Arquitectura — Clean Architecture

```
presentation → application → domain ← infrastructure
```

```
src/
├── domain/
│   ├── entities/            # Modelos de negocio (Resident, Visitor, BlockedUnit…)
│   ├── value-objects/       # LicensePlate, ApartmentCode, MonthKey, Money
│   ├── services/            # CobroService, CortesiaService, FormatterService
│   ├── use-cases/
│   │   ├── visitors/        # CheckInVisitor, CheckOutVisitor
│   │   ├── residents/       # RegisterResident, RemoveResident
│   │   ├── monthly-fees/    # MarkAsPaid
│   │   ├── daily-close/     # PerformDailyClose
│   │   ├── pricing/         # UpdatePricing
│   │   └── control/         # BlockUnit, UnblockUnit, ApprovePlate, RevokePlate
│   └── repositories/        # Interfaces (ports) — solo tipos
│
├── infrastructure/
│   ├── db/
│   │   ├── AndarriosDB.ts   # Dexie — schema completo
│   │   ├── mappers.ts       # Row ↔ Entity (snake_case ↔ camelCase)
│   │   └── repositories/    # Dexie* + Sync* (escribe IndexedDB + encola Supabase)
│   └── auth/
│       └── PinLockGateway.ts
│
├── application/
│   ├── actions.ts           # Wiring use-cases ↔ repos (punto de entrada de páginas)
│   └── hooks/               # useAuth, usePricing, useSync, usePagedQuery
│
└── presentation/
    └── components/
        ├── layout/          # AppShell (nav, sync status, PIN lock)
        ├── guards/          # RequireAdmin, RequireGuardPin
        ├── ui/              # AptoSelector, Pagination, StatusBar
        └── forms/           # VisitorCheckInForm

app/                         # Next.js App Router — páginas delgadas
├── page.tsx                 # Dashboard (vigilante)
├── visitors/                # Ingreso/salida visitantes con cobro
├── cashier/                 # Cierre de caja diario
├── residents/               # CRUD residentes (admin)
├── monthly-fees/            # Estado de pagos mensuales (admin)
├── control/                 # Bloqueo de aptos + placas aprobadas (admin)
├── pricing/                 # Tarifas (admin)
├── reports/                 # Exportación Excel (admin)
└── admin/                   # Panel con estadísticas y movimientos (admin)

lib/                         # Utilidades compartidas (sync engine, supabase client)
```

### Regla de dependencias

- `domain/` no importa nada externo
- `infrastructure/` implementa interfaces de `domain/`
- `application/` orquesta use-cases; no importa Dexie ni Supabase directamente
- `presentation/` solo llama hooks — cero lógica de negocio inline
- `app/` monta providers y llama componentes de presentación

---

## Sync offline-first

Toda escritura sigue este flujo:

```
UI → actions.ts → SyncRepository → IndexedDB (inmediato)
                                 ↘ queue (Dexie) → sync engine → Supabase
```

El sync engine (`lib/sync.ts`) procesa la cola en orden cuando hay red. Si falla, reintenta hasta 5 veces. Supabase Realtime mantiene IndexedDB sincronizado en la dirección remota → local.

---

## Variables de entorno

Copia `.env.local.example` a `.env.local` y completa:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Comandos

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run lint         # ESLint
npm run test         # Vitest (304 tests)
npm run test:ui      # Vitest UI
npm run test:cov     # Cobertura
```

---

## Dominio

| Término | Significado |
|---|---|
| `residente` | Vehículo con mensualidad fija |
| `visitante` | Vehículo de paso — cobro por hora |
| `cortesía` | Primeras N horas sin costo |
| `cod` | Código de apto: `T01-101` (torre-piso-unidad) |
| `mesKey` | `YYYY-MM` en zona horaria Colombia |
| `cierre de caja` | Corte diario de recaudo |
| `bloqueado` | Apto con restricción de ingreso (mora) |
| `placa aprobada` | Placa pre-autorizada para un apto |
