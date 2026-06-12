import { describe, it, expect } from 'vitest';
import { applyChange } from './realtime';

type Row = { id: string; title: string };
const rows: Row[] = [{ id: 'a', title: 'uno' }, { id: 'b', title: 'dos' }];

describe('applyChange', () => {
  it('INSERT agrega', () => {
    const out = applyChange(rows, { eventType: 'INSERT', new: { id: 'c', title: 'tres' }, old: {} });
    expect(out).toHaveLength(3);
  });
  it('INSERT no duplica id existente', () => {
    const out = applyChange(rows, { eventType: 'INSERT', new: { id: 'a', title: 'uno' }, old: {} });
    expect(out).toHaveLength(2);
  });
  it('UPDATE reemplaza por id', () => {
    const out = applyChange(rows, { eventType: 'UPDATE', new: { id: 'a', title: 'editado' }, old: { id: 'a' } });
    expect(out.find(r => r.id === 'a')!.title).toBe('editado');
  });
  it('DELETE quita por id', () => {
    const out = applyChange(rows, { eventType: 'DELETE', new: {}, old: { id: 'b' } });
    expect(out).toHaveLength(1);
  });
});
