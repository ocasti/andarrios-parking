import { describe, it, expect, beforeEach } from 'vitest';
import { AndarriosDB } from '../../AndarriosDB';
import { DexieActividadRepository } from '../DexieActividadRepository';
import { makeActividad } from './factories';

describe('DexieActividadRepository', () => {
  let db: AndarriosDB;
  let repo: DexieActividadRepository;

  beforeEach(() => {
    db = new AndarriosDB(`test-actividad-${Math.random()}`);
    repo = new DexieActividadRepository(db);
  });

  describe('registrar', () => {
    it('registrar guarda la actividad en la tabla', async () => {
      const actividad = makeActividad({ id: 'act-1' });

      await repo.registrar(actividad);

      const stored = await db.actividad.get('act-1');
      expect(stored).toBeDefined();
      expect(stored?.id).toBe('act-1');
    });

    it('registrar guarda el msg, ts y tipo correctamente', async () => {
      const ts = '2024-06-15T10:00:00.000Z';
      const actividad = makeActividad({
        id: 'act-2',
        msg: 'Vehículo ingresó al parqueadero',
        ts,
        tipo: 'ingreso',
      });

      await repo.registrar(actividad);

      const stored = await db.actividad.get('act-2');
      expect(stored?.msg).toBe('Vehículo ingresó al parqueadero');
      expect(stored?.ts).toBe(ts);
      expect(stored?.tipo).toBe('ingreso');
    });

    it('múltiples registros se acumulan', async () => {
      const a1 = makeActividad({ id: 'act-a', msg: 'Primera actividad' });
      const a2 = makeActividad({ id: 'act-b', msg: 'Segunda actividad' });
      const a3 = makeActividad({ id: 'act-c', msg: 'Tercera actividad' });

      await repo.registrar(a1);
      await repo.registrar(a2);
      await repo.registrar(a3);

      const all = await db.actividad.toArray();
      expect(all).toHaveLength(3);
      expect(all.map((a) => a.id)).toEqual(expect.arrayContaining(['act-a', 'act-b', 'act-c']));
    });
  });
});
