import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HighlightsModal from './HighlightsModal';
import type { Highlight } from '../types/city';

const highlights: Highlight[] = [
  { name: 'Abaporu', author: 'Tarsila do Amaral', note: 'Ícono modernista', image: 'https://x/a.jpg' },
  { name: 'Sin imagen', note: 'va en modo texto' },
];

function setup() {
  const onClose = vi.fn();
  render(<HighlightsModal title="MASP" highlights={highlights} accentColor="#C0392B" onClose={onClose} />);
  return { onClose };
}

describe('HighlightsModal', () => {
  it('muestra título y nombres de destacados', () => {
    setup();
    expect(screen.getByText('MASP')).toBeInTheDocument();
    expect(screen.getByText('Abaporu')).toBeInTheDocument();
    expect(screen.getByText('Tarsila do Amaral')).toBeInTheDocument();
  });

  it('botón cerrar → onClose', () => {
    const { onClose } = setup();
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }));
    expect(onClose).toHaveBeenCalled();
  });

  it('Escape → onClose', () => {
    const { onClose } = setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('imagen rota → cae a placeholder 🖼️', () => {
    setup();
    const img = screen.getByAltText('Abaporu');
    fireEvent.error(img);
    // el 2º destacado ya estaba sin imagen → ahora hay 2 placeholders
    expect(screen.getAllByText('🖼️')).toHaveLength(2);
  });
});
