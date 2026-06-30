// Ideas para el próximo viaje. Wishlist compartida, no son viajes confirmados.
// Agregar uno nuevo = sumar una entrada a la lista.
export interface Destino {
  id: string;
  name: string;
  flag: string;
  emoji: string;   // ícono temático (no foto real)
  note: string;    // una línea, info verificada o nada
}

export const destinos: Destino[] = [
  {
    id: 'isla-fuerte',
    name: 'Isla Fuerte',
    flag: '🇨🇴',
    emoji: '🏝️',
    note: 'Isla del Caribe colombiano, frente a la costa de Bolívar',
  },
  {
    id: 'san-andres',
    name: 'San Andrés',
    flag: '🇨🇴',
    emoji: '🐠',
    note: 'Mar de siete colores en el Caribe',
  },
  {
    id: 'eje-cafetero',
    name: 'Eje Cafetero',
    flag: '🇨🇴',
    emoji: '☕',
    note: 'Valle del Cocora y fincas de café en el Quindío',
  },
  {
    id: 'cartagena',
    name: 'Cartagena',
    flag: '🇨🇴',
    emoji: '🏰',
    note: 'Ciudad amurallada y playas del Caribe',
  },
];
