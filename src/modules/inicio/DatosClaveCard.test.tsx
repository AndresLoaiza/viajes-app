import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import DatosClaveCard from './DatosClaveCard';

describe('DatosClaveCard', () => {
  it('arranca plegada; al expandir muestra números de emergencia como tel:', () => {
    render(<DatosClaveCard />);
    // plegada: los números no están en el DOM aún
    expect(screen.queryByText('190')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /Datos clave/ }));

    expect(screen.getByText('190')).toBeInTheDocument(); // Brasil policía
    expect(screen.getByText('911')).toBeInTheDocument(); // Argentina emergencias

    const links = screen.getAllByRole('link');
    const tels = links.map((l) => l.getAttribute('href'));
    expect(tels).toContain('tel:190');
    expect(tels).toContain('tel:192');
    expect(tels).toContain('tel:911');
    expect(tels).toContain('tel:100');
  });
});
