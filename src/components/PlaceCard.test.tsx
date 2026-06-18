import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlaceCard from './PlaceCard';
import type { Place, TravelDate, PlaceSelection } from '../types/city';

const dates: TravelDate[] = [
  { id: 'd1', label: 'Sábado 25', shortLabel: 'Sáb 25' },
  { id: 'd2', label: 'Domingo 26', shortLabel: 'Dom 26' },
];

const place = (over: Partial<Place> = {}): Place => ({
  id: 'p1', name: 'MASP', description: 'Museo de arte', images: [], category: 'museos', ...over,
});
const sel = (over: Partial<PlaceSelection> = {}): PlaceSelection => ({
  placeId: 'p1', selected: false, preferredDates: [], notes: '', ...over,
});

function setup(p: Place, s: PlaceSelection) {
  const onChange = vi.fn();
  render(<PlaceCard place={p} dates={dates} selection={s} categoryColor="#C0392B" onChange={onChange} />);
  return { onChange };
}

describe('PlaceCard', () => {
  it('tap en el cuerpo alterna selección', () => {
    const { onChange } = setup(place(), sel());
    fireEvent.click(screen.getByText('Museo de arte'));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ selected: true }));
  });

  it('sin imágenes + mapsUrl → enlace a Google Maps', () => {
    setup(place({ mapsUrl: 'https://maps/x' }), sel());
    const link = screen.getByRole('link', { name: /Ver fotos en Google Maps/ });
    expect(link.getAttribute('href')).toBe('https://maps/x');
  });

  it('seleccionado → badge ✓ y selector de fechas; toggle de fecha', () => {
    const { onChange } = setup(place(), sel({ selected: true }));
    expect(screen.getByText('✓')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Sáb 25/ }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ preferredDates: ['d1'] }));
  });

  it('nota: abrir textarea y escribir → onChange notes', () => {
    const { onChange } = setup(place(), sel({ selected: true }));
    fireEvent.click(screen.getByRole('button', { name: /Agregar nota/ }));
    fireEvent.change(screen.getByPlaceholderText(/Añade una nota/), { target: { value: 'antes de mediodía' } });
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ notes: 'antes de mediodía' }));
  });

  it('con highlights → botón abre el modal de destacados', () => {
    setup(place({ highlights: [{ name: 'Abaporu' }], highlightsLabel: 'Ver obras' }), sel());
    fireEvent.click(screen.getByRole('button', { name: /Ver obras/ }));
    // HighlightsModal real: muestra el título (nombre del lugar) y la obra
    expect(screen.getByText('Abaporu')).toBeInTheDocument();
    expect(screen.getByText('Destacados')).toBeInTheDocument();
  });

  it('carrusel: flecha siguiente cambia la imagen visible', () => {
    setup(place({ images: ['a.jpg', 'b.jpg'] }), sel());
    const imgs = screen.getAllByRole('img');
    // primera visible (opacity 1), segunda oculta
    expect(imgs[0]).toHaveStyle({ opacity: '1' });
    fireEvent.click(screen.getByRole('button', { name: 'Siguiente' }));
    expect(imgs[1]).toHaveStyle({ opacity: '1' });
  });
});
