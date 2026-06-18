import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import InstallPrompt from './InstallPrompt';

function setUA(ua: string) {
  Object.defineProperty(navigator, 'userAgent', { configurable: true, value: ua });
}
function setStandalone(matches: boolean) {
  window.matchMedia = vi.fn().mockReturnValue({
    matches, media: '', addEventListener: () => {}, removeEventListener: () => {},
    addListener: () => {}, removeListener: () => {}, onchange: null, dispatchEvent: () => false,
  }) as unknown as typeof window.matchMedia;
}

const IOS = 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14) AppleWebKit/537';

describe('InstallPrompt', () => {
  beforeEach(() => {
    localStorage.clear();
    setStandalone(false);
    setUA(ANDROID);
  });
  afterEach(() => localStorage.clear());

  it('iOS sin descartar → banner con hint de Compartir', () => {
    setUA(IOS);
    render(<InstallPrompt />);
    expect(screen.getByRole('dialog', { name: 'Instalar la app' })).toBeInTheDocument();
    expect(screen.getByText(/Compartir/)).toBeInTheDocument();
    // iOS no muestra botón Instalar
    expect(screen.queryByRole('button', { name: /Instalar/ })).toBeNull();
  });

  it('descartado en localStorage → no muestra nada', () => {
    setUA(IOS);
    localStorage.setItem('pwa-install-dismissed', '1');
    render(<InstallPrompt />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('app en standalone → no muestra nada', () => {
    setUA(IOS);
    setStandalone(true);
    render(<InstallPrompt />);
    expect(screen.queryByRole('dialog')).toBeNull();
  });

  it('Android: aparece tras beforeinstallprompt con botón Instalar', () => {
    render(<InstallPrompt />);
    expect(screen.queryByRole('dialog')).toBeNull();

    act(() => {
      const e = new Event('beforeinstallprompt');
      Object.assign(e, { prompt: () => Promise.resolve(), userChoice: Promise.resolve({ outcome: 'accepted' }) });
      window.dispatchEvent(e);
    });

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Instalar/ })).toBeInTheDocument();
  });

  it('cerrar guarda el descarte y oculta el banner', () => {
    setUA(IOS);
    render(<InstallPrompt />);
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(localStorage.getItem('pwa-install-dismissed')).toBe('1');
  });
});
