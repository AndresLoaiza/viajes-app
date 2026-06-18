import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { Category, Place, SelectionsMap } from '../types/city';
import SwipeDeck from './SwipeDeck';

vi.mock('./HighlightsModal', () => ({
  default: ({ title }: { title: string }) => <div data-testid="highlights">{title}</div>,
}));

const category: Category = { id: 'c', name: 'Museos', emoji: '🖼️', color: '#123456' };
const places: Place[] = [
  { id: 'p1', name: 'Uno', description: 'd1', images: [], category: 'c' },
  { id: 'p2', name: 'Dos', description: 'd2', images: [], category: 'c', highlights: [{} as never] },
];

function setup(selections: SelectionsMap = {}) {
  const onDecide = vi.fn();
  const onClose = vi.fn();
  const utils = render(
    <SwipeDeck category={category} places={places} selections={selections} onDecide={onDecide} onClose={onClose} />,
  );
  return { onDecide, onClose, ...utils };
}

/** Avanza la animación de salida (260ms) dentro de act. */
function flushLeave() {
  act(() => { vi.advanceTimersByTime(300); });
}

describe('SwipeDeck', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('progreso inicial y botón ♥ → onDecide(true) y avanza', () => {
    const { onDecide } = setup();
    expect(screen.getByText('1 de 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Me gusta' }));
    expect(onDecide).toHaveBeenCalledWith('p1', true);

    flushLeave();
    expect(screen.getByText('2 de 2')).toBeInTheDocument();
  });

  it('botón ✕ → onDecide(false)', () => {
    const { onDecide } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Pasar' }));
    expect(onDecide).toHaveBeenCalledWith('p1', false);
  });

  it('Deshacer inhabilitado en la primera; tras avanzar retrocede', () => {
    setup();
    const undo = screen.getByRole('button', { name: 'Deshacer' });
    expect(undo).toBeDisabled();

    fireEvent.click(screen.getByRole('button', { name: 'Me gusta' }));
    flushLeave();
    expect(screen.getByText('2 de 2')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Deshacer' }));
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });

  it('al terminar muestra resumen con los elegidos (de selections)', () => {
    setup({ p1: { placeId: 'p1', selected: true, preferredDates: [], notes: '' } });
    fireEvent.click(screen.getByRole('button', { name: 'Me gusta' }));
    flushLeave();
    fireEvent.click(screen.getByRole('button', { name: 'Pasar' }));
    flushLeave();

    expect(screen.getByText('Elegiste 1 de 2')).toBeInTheDocument();
  });

  it('"Repasar de nuevo" reinicia el mazo', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Me gusta' })); flushLeave();
    fireEvent.click(screen.getByRole('button', { name: 'Pasar' })); flushLeave();
    expect(screen.queryByText('1 de 2')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Repasar de nuevo/ }));
    expect(screen.getByText('1 de 2')).toBeInTheDocument();
  });

  it('cerrar invoca onClose', () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Volver a categorías' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('botón de highlights abre el modal', () => {
    setup();
    // avanzar a p2 (tiene highlights)
    fireEvent.click(screen.getByRole('button', { name: 'Me gusta' }));
    flushLeave();
    fireEvent.click(screen.getByRole('button', { name: /Ver obras destacadas/ }));
    expect(screen.getByTestId('highlights')).toHaveTextContent('Dos');
  });

  it('arrastrar más allá del umbral cuenta como "me gusta"', () => {
    const { onDecide, container } = setup();
    const card = container.querySelector('.touch-none') as HTMLElement;
    fireEvent.pointerDown(card, { clientX: 0, pointerId: 1 });
    fireEvent.pointerMove(card, { clientX: 200, pointerId: 1 });
    fireEvent.pointerUp(card, { pointerId: 1 });
    expect(onDecide).toHaveBeenCalledWith('p1', true);
  });
});
