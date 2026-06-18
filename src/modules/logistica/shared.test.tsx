import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import {
  Accordion, ConfirmChip, ErrorAlert, FormActions, NoteText, UnpaidBadge,
} from './shared';

describe('shared/NoteText', () => {
  it('convierte URLs en enlaces y deja el texto plano', () => {
    render(<NoteText text="Reserva en https://booking.com/x gracias" />);
    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('https://booking.com/x');
    expect(link).toHaveTextContent('booking.com/x'); // sin el https://
    expect(screen.getByText(/gracias/)).toBeInTheDocument();
  });

  it('sin URL → solo texto', () => {
    render(<NoteText text="Pago en efectivo" />);
    expect(screen.queryByRole('link')).toBeNull();
    expect(screen.getByText('Pago en efectivo')).toBeInTheDocument();
  });
});

describe('shared/ErrorAlert', () => {
  it('vacío → no renderiza', () => {
    const { container } = render(<ErrorAlert msg="" />);
    expect(container).toBeEmptyDOMElement();
  });
  it('con mensaje → role alert', () => {
    render(<ErrorAlert msg="Falló" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Falló');
  });
});

describe('shared/FormActions', () => {
  it('inválido o guardando → Guardar deshabilitado; texto según modo', () => {
    const onSave = vi.fn(); const onCancel = vi.fn();
    const { rerender } = render(
      <FormActions onCancel={onCancel} onSave={onSave} saving={false} valid={false} isEdit={false} />);
    const btn = screen.getByRole('button', { name: 'Agregar' });
    expect(btn).toBeDisabled();

    rerender(<FormActions onCancel={onCancel} onSave={onSave} saving={false} valid isEdit />);
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeEnabled();

    rerender(<FormActions onCancel={onCancel} onSave={onSave} saving valid isEdit />);
    expect(screen.getByRole('button', { name: 'Guardando…' })).toBeDisabled();
  });

  it('Cancelar/Guardar disparan callbacks', () => {
    const onSave = vi.fn(); const onCancel = vi.fn();
    render(<FormActions onCancel={onCancel} onSave={onSave} saving={false} valid isEdit={false} />);
    fireEvent.click(screen.getByRole('button', { name: 'Cancelar' }));
    fireEvent.click(screen.getByRole('button', { name: 'Agregar' }));
    expect(onCancel).toHaveBeenCalled();
    expect(onSave).toHaveBeenCalled();
  });
});

describe('shared/Accordion', () => {
  it('header alterna; + agrega; conteo visible', () => {
    const onToggle = vi.fn(); const onAdd = vi.fn();
    render(
      <Accordion icon={<i />} title="Vuelos" count={3} open={false} onToggle={onToggle} onAdd={onAdd}>
        <p>contenido</p>
      </Accordion>,
    );
    expect(screen.getByRole('button', { name: /^Vuelos/ })).toHaveTextContent('(3)');
    fireEvent.click(screen.getByRole('button', { name: /^Vuelos/ }));
    expect(onToggle).toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'Agregar a Vuelos' }));
    expect(onAdd).toHaveBeenCalled();
  });
});

describe('shared/ConfirmChip', () => {
  beforeEach(() => {
    Object.assign(navigator, { clipboard: { writeText: vi.fn(() => Promise.resolve()) } });
  });
  it('copia el valor al portapapeles', async () => {
    render(<ConfirmChip value="ABC123" />);
    fireEvent.click(screen.getByRole('button', { name: /Copiar confirmación ABC123/ }));
    await waitFor(() => expect(navigator.clipboard.writeText).toHaveBeenCalledWith('ABC123'));
  });
});

describe('shared/UnpaidBadge', () => {
  it('muestra "Sin pagar"', () => {
    render(<UnpaidBadge />);
    expect(screen.getByText('Sin pagar')).toBeInTheDocument();
  });
});
