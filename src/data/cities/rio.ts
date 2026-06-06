import type { CityConfig } from '../../types/city';

const CDN = (id: string) => `${id}?auto=format&fit=crop&w=800&q=80`;
const SEED = (seed: string) => `https://picsum.photos/seed/${encodeURIComponent(seed)}/800/450`;

const rio: CityConfig = {
  id: 'rio',
  name: 'Río de Janeiro',
  country: 'Brasil',
  flag: '🇧🇷',
  coverImage: CDN('https://images.unsplash.com/photo-1596573677494-accc8fbe89e8'),
  welcomeTitle: '¡Hola Melisa! 🌴',
  welcomeSubtitle: '¿Lista para el viaje? Escoge los lugares que quieres visitar en Río de Janeiro',
  travelerName: 'Melisa',
  senderName: 'Andrés',
  formspreeEndpoint: 'https://formspree.io/f/REEMPLAZA_CON_TU_ID',
  dates: [
    { id: 'thu-25', label: 'Jueves 25 jun', shortLabel: 'Jue 25' },
    { id: 'fri-26', label: 'Viernes 26 jun', shortLabel: 'Vie 26' },
    { id: 'sat-27', label: 'Sábado 27 jun', shortLabel: 'Sáb 27' },
    { id: 'sun-28', label: 'Domingo 28 jun', shortLabel: 'Dom 28', note: 'Solo mañana' },
  ],
  categories: [
    { id: 'playas',      name: 'Playas',              emoji: '🏖️', color: '#1B6CA8' },
    { id: 'naturaleza',  name: 'Naturaleza & Senderos', emoji: '🌿', color: '#009C3B' },
    { id: 'cultura',     name: 'Cultura & Historia',  emoji: '🎭', color: '#8B4513' },
    { id: 'experiencias',name: 'Experiencias',         emoji: '🌅', color: '#FF6B35' },
    { id: 'gastronomia', name: 'Gastronomía',          emoji: '🍽️', color: '#C0392B' },
    { id: 'compras',     name: 'Compras & Noche',      emoji: '🛍️', color: '#8E44AD' },
  ],
  places: [
    // --- PLAYAS ---
    {
      id: 'copacabana',
      name: 'Playa Copacabana',
      description: 'La playa más famosa del mundo. Arena blanca, olas perfectas y todo el vibe carioca.',
      imageUrl: CDN('https://images.unsplash.com/photo-1596573677494-accc8fbe89e8'),
      category: 'playas',
    },
    {
      id: 'ipanema',
      name: 'Ipanema',
      description: 'La playa más cool de Río. Atardeceres épicos frente al Morro Dois Irmãos.',
      imageUrl: CDN('https://images.unsplash.com/photo-1483729558449-99ef09a8c325'),
      category: 'playas',
    },
    {
      id: 'arco-prahinha',
      name: 'Arco da Lapa',
      description: 'Icónico acueducto del siglo XVIII en el corazón bohemio de Lapa.',
      imageUrl: SEED('arcos-lapa-rio'),
      category: 'playas',
    },

    // --- NATURALEZA ---
    {
      id: 'morro-dois-irmaos',
      name: 'Morro Dois Irmãos',
      description: 'Sendero con vista panorámica a Ipanema, Leblon y las dos montañas gemelas.',
      imageUrl: SEED('morro-dois-irmaos-rio'),
      category: 'naturaleza',
    },
    {
      id: 'pedra-bonita',
      name: 'Pedra Bonita',
      description: 'Sendero en el Parque Nacional Tijuca con vistas espectaculares. Punto de lanzamiento del ala delta.',
      imageUrl: SEED('pedra-bonita-tijuca-rio'),
      category: 'naturaleza',
    },
    {
      id: 'pan-de-azucar',
      name: 'Pan de Azúcar',
      description: 'Teleférico hasta la cima con vista de 360° de toda la bahía. O sube caminando si te atreves.',
      imageUrl: CDN('https://images.unsplash.com/photo-1651776739711-918f1ffd3235'),
      category: 'naturaleza',
    },
    {
      id: 'parque-lage',
      name: 'Parque Lage',
      description: 'Mansión histórica rodeada de selva atlántica. Tiene un café con piscina en el patio.',
      imageUrl: SEED('parque-lage-mansion-rio'),
      category: 'naturaleza',
    },
    {
      id: 'jardin-botanico',
      name: 'Jardín Botánico',
      description: '140 hectáreas con 6.000 especies de plantas. La avenida de palmeras reales es increíble.',
      imageUrl: SEED('jardim-botanico-palms-rio'),
      category: 'naturaleza',
    },

    // --- CULTURA ---
    {
      id: 'real-gabinete',
      name: 'Real Gabinete Português de Lectura',
      description: 'La biblioteca más bella de América Latina. Arquitectura neo-manuelina del siglo XIX.',
      imageUrl: CDN('https://images.unsplash.com/photo-1660700009798-eef167041886'),
      category: 'cultura',
    },
    {
      id: 'cristo-redentor',
      name: 'Cristo Redentor',
      description: 'Una de las 7 maravillas del mundo moderno. Vista de 360° de todo Río desde el Corcovado.',
      imageUrl: CDN('https://images.unsplash.com/photo-1518639192441-8fce0a366e2e'),
      category: 'cultura',
      tip: 'Compra las entradas con anticipación en el sitio web oficial.',
      bookingUrl: 'https://www.paineirascorcovado.com.br',
    },
    {
      id: 'selaron',
      name: 'Escaleras Selarón',
      description: 'Obra de arte del artista chileno Jorge Selarón. 215 escalones cubiertos de azulejos coloridos.',
      imageUrl: CDN('https://images.unsplash.com/photo-1626568941852-70bc179e493e'),
      category: 'cultura',
    },
    {
      id: 'sambodromo',
      name: 'Sambódromo',
      description: 'El escenario del Carnaval más famoso del mundo. Aunque no sea temporada, vale la visita.',
      imageUrl: SEED('sambadrome marquis de sapucai rio carnival'),
      category: 'cultura',
    },
    {
      id: 'santa-teresa',
      name: 'Barrio Santa Teresa',
      description: 'El barrio bohemio de Río. Calles empedradas, arte callejero, bares y restaurantes únicos.',
      imageUrl: SEED('santa teresa rio de janeiro neighborhood colorful'),
      category: 'cultura',
    },
    {
      id: 'forte-copacabana',
      name: 'Forte de Copacabana',
      description: 'Fuerte histórico de 1914 al final de la playa de Copacabana. Museo y vistas al mar.',
      imageUrl: SEED('forte de copacabana fort rio ocean'),
      category: 'cultura',
    },
    {
      id: 'museu-amanha',
      name: 'Museu do Amanhã',
      description: 'Museo de ciencias futurista diseñado por Santiago Calatrava. Arquitectura espectacular en el puerto.',
      imageUrl: SEED('museum of tomorrow rio de janeiro calatrava'),
      category: 'cultura',
    },

    // --- EXPERIENCIAS ---
    {
      id: 'paddle-amanecer',
      name: 'Amanecer en Paddle Surf',
      description: 'Salir al mar en tabla de SUP antes de que salga el sol. Con @surfrio o @modoverticaltour.',
      imageUrl: SEED('stand up paddle surf sunrise copacabana'),
      category: 'experiencias',
    },
    {
      id: 'ala-delta',
      name: 'Ala Delta / Paracaidismo',
      description: 'Volar en tándem desde Pedra Bonita con vistas a toda la ciudad. Una de las mejores del mundo.',
      imageUrl: SEED('hang gliding rio de janeiro aerial view'),
      category: 'experiencias',
    },
    {
      id: 'malecon',
      name: 'Caminar por el Malecón',
      description: 'El Aterro do Flamengo, parque costero con 1,2 km de playa artificial y vistas a la bahía.',
      imageUrl: SEED('aterro flamengo rio de janeiro waterfront promenade'),
      category: 'experiencias',
    },

    // --- GASTRONOMÍA ---
    {
      id: 'confiteria',
      name: 'Confeitaria Colombo',
      description: 'El café más elegante de Río. Belle Époque con espejos belgas, mármol y pastelería de ensueño.',
      imageUrl: SEED('confeitaria colombo cafe interior belle epoque'),
      category: 'gastronomia',
    },
    {
      id: 'sanduche-paraicopa',
      name: 'Sanduíche Bar Paraíso',
      description: 'El sanduche carioca más famoso. Cola siempre, pero vale cada minuto.',
      imageUrl: SEED('sanduiche paraiso rio de janeiro street food'),
      category: 'gastronomia',
    },
    {
      id: 'garota-ipanema',
      name: 'Bar Garota de Ipanema',
      description: 'El bar donde Tom Jobim compuso "La chica de Ipanema". Musica ao vivo y caipirinha legendaria.',
      imageUrl: SEED('garota de ipanema bar restaurant rio'),
      category: 'gastronomia',
    },
    {
      id: 'carretao',
      name: 'Carretão (Carnes)',
      description: 'Churrascaria brasileña por kilo. La mejor carne asada de la ciudad.',
      imageUrl: SEED('churrascaria barbecue brazil beef grilled'),
      category: 'gastronomia',
    },
    {
      id: 'so-lo-cafe',
      name: 'So Lo Café',
      description: 'Café de especialidad en un rincón con onda en Río.',
      imageUrl: SEED('specialty coffee cafe rio de janeiro'),
      category: 'gastronomia',
    },
    {
      id: 'padaria-ipanema',
      name: 'Padaria Ipanema',
      description: 'La panadería de barrio más querida de Ipanema. Pão de queijo y café da manhã perfectos.',
      imageUrl: SEED('padaria bakery brazil pao de queijo breakfast'),
      category: 'gastronomia',
    },
    {
      id: 'fala',
      name: 'Fala',
      description: 'Restaurante moderno con cocina brasileña contemporánea.',
      imageUrl: SEED('modern restaurant rio de janeiro contemporary food'),
      category: 'gastronomia',
    },
    {
      id: 'feria-nocturna',
      name: 'Feria Nocturna de Copacabana',
      description: 'Mercado nocturno en la orla de Copacabana. Artesanías, comida y música carioca.',
      imageUrl: SEED('night market copacabana beach fair rio'),
      category: 'gastronomia',
    },

    // --- COMPRAS & NOCHE ---
    {
      id: 'havaianas',
      name: 'Tienda Havaianas',
      description: 'La tienda flagship de las chancletas más famosas de Brasil. Personalízalas en el momento.',
      imageUrl: SEED('havaianas flip flops store brazil colorful'),
      category: 'compras',
    },
    {
      id: 'roxy-show',
      name: 'Roxy Dinner Show',
      description: 'Show de samba, capoeira y danzas brasileñas mientras cenas. La experiencia carioca completa.',
      imageUrl: SEED('samba dinner show rio de janeiro performance'),
      category: 'compras',
    },
  ],
  theme: {
    primaryColor: '#009C3B',
    secondaryColor: '#FFDF00',
    accentColor: '#002776',
  },
};

export default rio;
