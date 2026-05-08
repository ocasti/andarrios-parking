# CLAUDE.md — Andarríos Parqueadero

## Identidad del proyecto

PWA offline-first para gestión de parqueadero residencial (Andarríos).
Dos roles: **vigilante** (PIN compartido, operación diaria) y **admin** (login Supabase).
Stack: Next.js 14 App Router · React 18 · TypeScript · Dexie (IndexedDB) · Supabase · Tailwind CSS.

---

## Stack técnico

| Capa | Tecnología |
|---|---|
| Framework | Next.js 14 (App Router) |
| UI | React 18 + TypeScript |
| Estilos | Tailwind CSS (primero) + styled-jsx solo para layout global |
| DB local | Dexie 4 (IndexedDB) — offline-first |
| DB remota | Supabase (PostgreSQL + Realtime) |
| Auth | Supabase Auth + PIN compartido para portería |
| Tests | Vitest + React Testing Library + fake-indexeddb + msw |
| Linting | ESLint (Next.js config) |

---

## Arquitectura — Clean Architecture

### Regla de dependencias (NUNCA violar)

```
presentation → application → domain ← infrastructure
```

- `domain/` no importa nada de fuera del dominio
- `infrastructure/` implementa interfaces definidas en `domain/`
- `application/` (hooks) orquesta use-cases; no importa Dexie ni Supabase directamente
- `presentation/` solo llama hooks — cero lógica de negocio inline
- `app/` (pages) son delgadas: montan providers y llaman componentes de presentación

### Estructura de carpetas

```
src/
├── domain/
│   ├── entities/            # Modelos de negocio tipados
│   ├── value-objects/       # Placa, AptoCod, MesKey, Money — con validación
│   ├── services/            # CobroService, CortesiaService, MensualidadService
│   ├── use-cases/           # Un archivo por caso de uso
│   │   ├── visitantes/
│   │   ├── residentes/
│   │   ├── mensualidades/
│   │   ├── caja/
│   │   └── tarifas/
│   ├── repositories/        # Interfaces (ports) — solo tipos, sin implementación
│   └── constants.ts         # TORRES=12, PISOS=6, APTOS_POR_PISO=4, TARIFAS_ID=1
│
├── infrastructure/
│   ├── db/
│   │   ├── AndarriosDB.ts   # Dexie sin lógica de negocio
│   │   └── repositories/    # DexieResidenteRepo, DexieVisitanteRepo, etc.
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── repositories/    # SupabaseVisitanteRepo (cortesía, capacidad)
│   │   └── sync/            # SyncEngine, SyncQueue
│   └── auth/
│       ├── SupabaseAuthGateway.ts
│       └── PinLockGateway.ts
│
├── application/
│   ├── hooks/               # useResidentes, useVisitantes, useTarifas, useAuth, useSync
│   └── providers/           # AppProviders.tsx
│
├── presentation/
│   ├── components/
│   │   ├── layout/          # AppShell
│   │   ├── guards/          # RequireAdmin, RequireGuardPin, RequireVigilante
│   │   └── ui/              # Pagination, AptoSelector, StatusBar
│   └── forms/               # VisitanteIngresoForm, ResidenteForm
│
└── app/                     # Next.js App Router — páginas delgadas
    ├── layout.tsx
    ├── page.tsx
    └── [modulo]/page.tsx
```

---

## Skills / Personas

Cada skill define cómo Claude debe razonar y actuar según la tarea.
Invoca el skill correcto según el área de trabajo antes de escribir código.

---

### @senior-domain-engineer
**Activa cuando:** trabajas en `src/domain/`

**Reglas:**
- Escribe el test **antes** que la implementación (TDD: rojo → verde → refactor)
- Cero imports de Dexie, Supabase, Next.js o React en esta capa
- Value Objects son inmutables; validan en construcción con `static parse()` que lanza `DomainError`
- Use Cases reciben repositorios por parámetro (inyección de dependencias); nunca los instancian
- Nombra con el lenguaje del negocio: `ingresarVisitante`, `realizarCierre`, `marcarPagado`
- Un use-case = un archivo = una responsabilidad

**Checklist antes de commit en `domain/`:**
- [ ] Test escrito y en verde
- [ ] Sin dependencias externas al dominio
- [ ] Value Objects validan sus invariantes
- [ ] Use Case depende de interfaz, no de implementación concreta

---

### @senior-infra-engineer
**Activa cuando:** trabajas en `src/infrastructure/`

**Reglas:**
- Implementa las interfaces (ports) de `domain/repositories/` — nunca al revés
- Tests de repos Dexie usan `fake-indexeddb` — sin tocar IndexedDB real ni Supabase
- Tests de repos Supabase usan `msw` para interceptar HTTP
- Sync engine: manejo explícito de errores, retry con backoff exponencial, operaciones idempotentes
- No expone tipos de Dexie o Supabase fuera de la capa infra (wrapper types)
- `client.ts` es un singleton con lazy init; nunca lo instancies dos veces

**Checklist antes de commit en `infrastructure/`:**
- [ ] Implementa la interfaz de dominio exactamente
- [ ] Test con fake-indexeddb o msw según el caso
- [ ] Sin lógica de negocio (solo persistencia / transporte)
- [ ] Errores de infraestructura traducidos a errores de dominio

---

### @senior-frontend-engineer
**Activa cuando:** trabajas en `src/presentation/` o `src/app/`

**Reglas:**
- Páginas (`app/*/page.tsx`) solo montan providers y llaman componentes — máximo 30 líneas
- Hooks (`application/hooks/`) orquestan use-cases — no SQL ni Dexie directo
- Componentes puros siempre que sea posible (sin side effects)
- Cero `useEffect` para derivar estado calculado — usar `useMemo`
- Accesibilidad: `aria-label`, roles semánticos, navegación por teclado
- Estilos: Tailwind CSS primero; styled-jsx solo para variables CSS globales en AppShell
- Cero inline styles salvo casos excepcionales justificados con comentario
- Forms: validación delegada al dominio (Value Objects), UI solo muestra el error

**Checklist antes de commit en `presentation/`:**
- [ ] Página ≤ 30 líneas
- [ ] Componente no importa Dexie ni Supabase
- [ ] Test de componente con RTL cubre happy path + error state
- [ ] Accesibilidad básica presente

---

### @senior-qa-engineer
**Activa cuando:** defines estrategia de tests, revisas cobertura o planeas casos de prueba

**Reglas:**
- Define la pirámide de tests antes de implementar cualquier feature:
  ```
  E2E (pocos, lentos)          ← Playwright (futuro)
  Integración (medianos)       ← Hooks + Repos
  Unitarios (muchos, rápidos)  ← Domain puro
  ```
- Para cada use-case define: happy path + al menos 2 edge cases + al menos 1 caso de error
- Los tests prueban **comportamiento observable**, no implementación interna
- Coverage mínimo aceptable: **80% dominio · 70% infra · 60% presentación**
- Código no testeable = deuda técnica; reportarlo en comentario `// TODO(test):` con razón
- Genera test plan estructurado: Given / When / Then

**Checklist de QA por feature:**
- [ ] Test plan escrito antes de implementar
- [ ] Happy path cubierto
- [ ] Edge cases cubiertos (valores límite, nulls, offline)
- [ ] Error path cubierto
- [ ] Coverage >= mínimos

---

### @senior-test-automation
**Activa cuando:** escribes tests concretos en Vitest o React Testing Library

**Reglas:**
- TDD estricto: el test que falla va primero, siempre
- Nombre de test = documentación: `describe("CobroService") / it("cobra hora adicional completa cuando supera horas gratis")`
- Prohibido `test('should work')` o `test('funciona')`
- Sin mocks de lo que controlas — solo mocks en fronteras externas (Supabase HTTP, window.localStorage)
- Usa `fake-indexeddb` para cualquier test que toque Dexie
- Usa `msw` para interceptar llamadas a Supabase REST/Auth
- Factories para datos de prueba — nunca objetos inline duplicados entre tests
- Un `describe` por módulo, un `it` por comportamiento

**Estructura de test unitario:**
```typescript
describe("NombreDelModulo", () => {
  describe("nombreDelMetodo", () => {
    it("hace X cuando Y", () => {
      // Arrange
      // Act
      // Assert
    });
  });
});
```

**Checklist antes de commit de tests:**
- [ ] Nombre del test describe el comportamiento
- [ ] AAA (Arrange / Act / Assert) claro
- [ ] Sin lógica condicional en el test
- [ ] Test falla antes del código, pasa después
- [ ] Factories usadas, sin copy-paste de objetos

---

### @senior-architect
**Activa cuando:** creas archivos nuevos, mueves código entre capas o revisas dependencias

**Reglas:**
- Verifica siempre la regla de dependencias: `presentation → application → domain ← infrastructure`
- Alerta con `// ARCH VIOLATION:` cuando una capa importa otra que no debería
- Módulo > 150 líneas → propone split antes de continuar
- Interfaces (ports) viven en `domain/repositories/` — no en infra
- Toda feature nueva sigue el flujo: domain entity → port interface → infra implementation → application hook → presentation component
- Mantiene este CLAUDE.md actualizado cuando cambia la arquitectura

**Checklist de arquitectura por feature:**
- [ ] Entity o Value Object en dominio
- [ ] Interface en `domain/repositories/`
- [ ] Implementación en `infrastructure/`
- [ ] Use Case en `domain/use-cases/`
- [ ] Hook en `application/hooks/`
- [ ] Componente/Form en `presentation/`
- [ ] Página delgada en `app/`

---

### @senior-code-reviewer
**Activa cuando:** estás por hacer commit o revisas un PR

**Checklist obligatorio:**
- [ ] Cero `any` sin comentario justificado
- [ ] Cero magic numbers — constante nombrada en `domain/constants.ts`
- [ ] Cero lógica de negocio en páginas o componentes
- [ ] Imports al tope del archivo, ordenados: externos → `@/` → relativos
- [ ] Tests existen y cubren el cambio
- [ ] Nombres en español para el dominio del negocio (`residente`, `placa`, `mesKey`)
- [ ] Nombres en inglés para código técnico (`repository`, `handler`, `factory`)
- [ ] Sin `console.log` en código de producción — usar el logger de actividad
- [ ] `'use client'` solo donde hay interactividad o hooks del browser
- [ ] Sin imports mid-file (todos al tope)

---

## Reglas de Clean Code (transversales)

1. **Un archivo = una responsabilidad.** Si supera 150 líneas, pregúntate si hay dos conceptos mezclados.
2. **Funciones ≤ 20 líneas.** Si necesitas más, extrae una función con nombre que describa el "qué".
3. **No comments que expliquen el QUÉ** — el código debe ser auto-explicativo. Solo comenta el POR QUÉ cuando sea no-obvio.
4. **Cero `any`.** Usa `unknown` si no conoces el tipo; tipea explícito siempre.
5. **Fail fast.** Valida en la frontera (Value Objects, entrada de usuario). No propagues datos inválidos.
6. **Inmutabilidad primero.** `const` por defecto; `let` solo cuando hay reasignación real.
7. **No null checks en cadena.** Optional chaining (`?.`) está bien; `if (a && a.b && a.b.c)` no.
8. **Errores como valores** en dominio: `Result<T, DomainError>` o throw tipado — nunca `catch` silencioso.

---

## Reglas de TDD

1. **Rojo primero.** El test debe fallar antes de escribir implementación.
2. **Verde mínimo.** Escribe el código más simple que haga pasar el test.
3. **Refactor.** Con el test en verde, limpia — sin cambiar comportamiento.
4. **Un test a la vez.** No adelantes casos antes de tener verde el actual.
5. **Los tests de dominio son los más valiosos.** Si solo puedes testear una capa, esa es la del dominio.
6. **Antes de tocar código existente:** escribe un test que falle para reproducir el bug o documentar el comportamiento actual.

---

## Constantes del dominio

Todos los valores fijos del negocio viven en `src/domain/constants.ts`. Nunca hardcodeados en páginas ni componentes.

```typescript
// src/domain/constants.ts
export const TORRES = 12;
export const PISOS_POR_TORRE = 6;
export const APTOS_POR_PISO = 4;
export const TARIFAS_ID = 1;
export const PIN_LOCK_KEY = 'andarrios_porteria_unlock';
export const TURNO_DURACION_MS = 12 * 60 * 60 * 1000;
export const SYNC_INTERVAL_MS = 30_000;
export const SYNC_MAX_ATTEMPTS = 5;
export const ZONA_HORARIA = 'America/Bogota';
```

---

## Lenguaje del dominio (Ubiquitous Language)

| Término | Significado |
|---|---|
| `residente` | Vehículo registrado con mensualidad |
| `visitante` | Vehículo de paso con cobro por hora |
| `placa` | Identificador único del vehículo |
| `cod` | Código de apartamento (ej: T01-101) |
| `mesKey` | Clave de mes en formato YYYY-MM (zona Colombia) |
| `cortesía` | Primeras N horas sin costo para visitante |
| `cierre de caja` | Corte diario de ingresos |
| `mensualidad` | Pago mensual de residente por espacio |
| `bloqueado` | Apartamento con restricción de ingreso |
| `placa aprobada` | Placa pre-autorizada para un apartamento |

---

## Convenciones de commits

```
feat(dominio): agrega IngresoVisitante use-case con TDD
feat(infra): implementa DexieVisitanteRepository
feat(ui): formulario de ingreso de visitante
test(dominio): cubre edge cases de CobroService
fix(sync): corrige retry infinito en error de red
refactor(actions): extrae CobroService del god file
```

Siempre con el skill activo como contexto mental.

---

## Flujo de trabajo por feature

```
1. @senior-architect    → define capas afectadas y contratos
2. @senior-qa-engineer  → escribe test plan (Given/When/Then)
3. @senior-domain-engineer → TDD en domain/ (rojo→verde→refactor)
4. @senior-infra-engineer  → implementa repositorio/adaptador
5. @senior-frontend-engineer → hook + componente + form
6. @senior-test-automation → tests de integración y componente
7. @senior-code-reviewer   → checklist final antes de commit
```

---

## Comandos

```bash
npm run dev          # servidor de desarrollo
npm run build        # build de producción
npm run lint         # ESLint
npm run test         # Vitest (cuando esté configurado)
npm run test:ui      # Vitest UI
npm run test:cov     # cobertura
```

---

## Variables de entorno requeridas

Ver `.env.local.example`. Las críticas:

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

---

## Notas de arquitectura activas

- **Refactor en curso:** migrando de arquitectura monolítica (`lib/actions.ts` god file) a Clean Architecture. Los archivos en `lib/` son legacy y se eliminan progresivamente.
- **Prioridad de migración:** domain → infrastructure → application → presentation.
- **Compatibilidad:** durante la migración, los módulos legacy y los nuevos coexisten. Un módulo legacy no debe importar uno nuevo; uno nuevo nunca importa legacy.
