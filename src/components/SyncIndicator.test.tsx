import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

let pending = 0;
vi.mock('../lib/outbox', () => ({
  pendingCount: () => pending,
  subscribe: () => () => {},
}));

import SyncIndicator from './SyncIndicator';

function setOnline(v: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value: v });
}

describe('SyncIndicator', () => {
  beforeEach(() => { pending = 0; setOnline(true); });
  afterEach(() => setOnline(true));

  it('online y sin pendientes → no muestra nada', () => {
    render(<SyncIndicator />);
    expect(screen.queryByRole('status')).toBeNull();
  });

  it('offline → "Sin conexión"', () => {
    setOnline(false);
    render(<SyncIndicator />);
    expect(screen.getByRole('status')).toHaveTextContent(/Sin conexión/);
  });

  it('online con pendientes → "Sincronizando"', () => {
    pending = 2;
    render(<SyncIndicator />);
    expect(screen.getByRole('status')).toHaveTextContent(/Sincronizando 2/);
  });

  it('offline con pendientes → muestra el conteo guardado', () => {
    setOnline(false);
    pending = 3;
    render(<SyncIndicator />);
    expect(screen.getByRole('status')).toHaveTextContent(/3 guardados/);
  });
});
