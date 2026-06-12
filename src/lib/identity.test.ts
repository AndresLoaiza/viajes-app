import { describe, it, expect } from 'vitest';
import { sha256Hex, getStoredIdentity, storeIdentity } from './identity';

describe('sha256Hex', () => {
  it('hashea determinístico', async () => {
    expect(await sha256Hex('hola')).toBe(
      'b221d9dbb083a7f33428d7c2a3c3198ae925614d70210e28716ccaa7cd4ddb79');
  });
});

describe('identity storage', () => {
  it('guarda y lee', () => {
    storeIdentity('melisa');
    expect(getStoredIdentity()).toBe('melisa');
  });
  it('null si no hay', () => {
    localStorage.clear();
    expect(getStoredIdentity()).toBeNull();
  });
});
