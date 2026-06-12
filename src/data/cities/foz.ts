import type { CityConfig } from '../../types/city';

const foz: CityConfig = {
  id: 'foz',
  name: 'Foz do Iguaçu',
  country: 'Brasil',
  flag: '🇧🇷',
  coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1a/Cataratas_do_Igua%C3%A7u_-_Foz_do_Igua%C3%A7u_-_Brasil_-_panoramio_%2813%29.jpg/1280px-Cataratas_do_Igua%C3%A7u_-_Foz_do_Igua%C3%A7u_-_Brasil_-_panoramio_%2813%29.jpg',
  welcomeTitle: '¡Bienvenidos a Foz! 🌊',
  welcomeSubtitle: 'Las cataratas más impresionantes del mundo te esperan en Foz do Iguaçu.',
  travelerName: 'Melisa',
  senderName: 'Andrés',
  dates: [],
  categories: [
    { id: 'cataratas',   name: 'Cataratas & Naturaleza',     emoji: '🌊', color: '#1B8CA8' },
    { id: 'ingenieria',  name: 'Ingeniería & Monumentos',    emoji: '🏗️', color: '#4A5568' },
    { id: 'cultura',     name: 'Templos & Cultura',          emoji: '🛕', color: '#805AD5' },
    { id: 'gastronomia', name: 'Gastronomía',                emoji: '🍽️', color: '#C0392B' },
  ],
  places: [
    // --- CATARATAS & NATURALEZA ---
    {
      id: 'cataratas-brasileno',
      name: 'Cataratas do Iguaçu (lado brasileño)',
      description: 'La vista más panorámica de las cataratas: desde el sendero de 1,2 km se ven hasta 275 saltos de agua cayendo al mismo tiempo. Es impresionante caminar al borde del abismo con la neblina húmeda en la cara. Llega temprano para evitar las multitudes y aprovechar la luz de la mañana.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cataratas+do+Igua%C3%A7u+lado+brasileiro+Foz+do+Igua%C3%A7u',
      category: 'cataratas',
    },
    {
      id: 'passarela-garganta',
      name: 'Passarela Garganta do Diabo',
      description: 'La pasarela sobre el río Iguazú lleva directo a la "Garganta del Diablo", el salto más poderoso de las cataratas. La fuerza del agua y la nube de vapor que se levanta son algo que no se olvida. El sendero es corto pero el impacto visual es total: prepárate para mojarte.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Passarela+Garganta+do+Diabo+Foz+do+Igua%C3%A7u',
      category: 'cataratas',
    },
    {
      id: 'parque-das-aves',
      name: 'Parque das Aves',
      description: 'Un aviario tropical justo al lado de las cataratas con más de 1.500 aves de especies nativas de la selva atlántica. Las jaulas son tan grandes que puedes caminar dentro y que los tucanes y guacamayos te rodeen. Es una parada perfecta al salir del Parque Nacional Iguaçu.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Parque+das+Aves+Foz+do+Igua%C3%A7u',
      category: 'cataratas',
    },

    // --- INGENIERÍA & MONUMENTOS ---
    {
      id: 'itaipu-tour',
      name: 'Represa Itaipú (tour panorámico)',
      description: 'La segunda represa hidroeléctrica más grande del mundo, compartida entre Brasil y Paraguay. El tour panorámico en bus permite ver la escala monumental de la obra desde las miradores exteriores. Vale la pena el upgrade al tour especial para entrar a las turbinas subterráneas.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Usina+Hidreletrica+Itaipu+Foz+do+Igua%C3%A7u',
      category: 'ingenieria',
    },
    {
      id: 'marco-tres-fronteiras',
      name: 'Marco das Três Fronteiras',
      description: 'El punto exacto donde se encuentran Brasil, Argentina y Paraguay, marcado por un obelisco iluminado en los colores de cada país. La vista al río Iguazú y al Paraguay desde el mirador al atardecer es preciosa. El lugar se anima especialmente de noche cuando los obeliscos se iluminan.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Marco+das+Tr%C3%AAs+Fronteiras+Foz+do+Igua%C3%A7u',
      category: 'ingenieria',
    },

    // --- TEMPLOS & CULTURA ---
    {
      id: 'templo-chen-tien',
      name: 'Templo Budista Chen Tien',
      description: 'El templo budista más grande de América Latina, construido por la comunidad taiwanesa de Foz. La arquitectura con sus techos rojos y dorados en medio de los jardines verdes es un contraste fascinante con la selva circundante. La entrada es libre y los jardines son ideales para caminar tranquilamente.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Templo+Budista+Chen+Tien+Foz+do+Igua%C3%A7u',
      category: 'cultura',
    },
    {
      id: 'mezquita-omar',
      name: 'Mezquita Omar Ibn Al-Khattab',
      description: 'Una de las mezquitas más grandes de América del Sur, reflejo de la numerosa comunidad árabe de Foz do Iguaçu. Su arquitectura blanca con cúpulas y minaretes es completamente inesperada en medio del Brasil subtropical. Las visitas guiadas son gratuitas y muy bien recibidas a quienes llegan con respeto.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mesquita+Omar+Ibn+Al-Khattab+Foz+do+Igua%C3%A7u',
      category: 'cultura',
    },

    // --- GASTRONOMÍA ---
    {
      id: 'rafain-churrascaria',
      name: 'Rafain Churrascaria (cena show)',
      description: 'La experiencia gastronómica más famosa de Foz: un rodízio de carnes con show folclórico en vivo que incluye danzas de toda América Latina. Es ideal para la primera noche en la ciudad porque combina muy buena comida con un espectáculo de hora y media. Reserva con anticipación.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rafain+Centro+de+Conven%C3%A7%C3%B5es+Foz+do+Igua%C3%A7u',
      category: 'gastronomia',
    },
    {
      id: 'vo-bertila',
      name: 'Vó Bertila (pizza y pasta)',
      description: 'Restaurante familiar de cocina italiana con décadas de historia en Foz, famoso por sus pastas caseras y pizzas de masa gruesa. El ambiente es acogedor y los precios muy razonables para lo que ofrecen. El ravioli de la casa es el plato que la gente más recomienda.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=V%C3%B3+Bertila+Restaurante+Foz+do+Igua%C3%A7u',
      category: 'gastronomia',
    },
    {
      id: 'castelo-libanes',
      name: 'Castelo Libanês',
      description: 'Restaurante de comida árabe y libanesa en el corazón de Foz, donde la comunidad árabe local come. El hoummus, el kafta y los mezzes son auténticos y abundantes. Perfecto para un almuerzo diferente que recuerda la diversidad cultural única de esta ciudad fronteriza.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Castelo+Libanes+Restaurante+Foz+do+Igua%C3%A7u',
      category: 'gastronomia',
    },
    {
      id: 'emporio-com-arte',
      name: 'Empório com Arte (café)',
      description: 'Cafetería de especialidad con ambiente artístico en Foz, ideal para el desayuno o una pausa entre visitas. Sirven café de origen brasileño con métodos de filtrado y tienen pasteles y panes artesanales. El espacio mezcla galería de arte local con cafetería, lo que lo hace un rincón especial.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Emp%C3%B3rio+com+Arte+Foz+do+Igua%C3%A7u',
      category: 'gastronomia',
    },
  ],
  theme: {
    primaryColor: '#1A7A4A',
    secondaryColor: '#2B7A9E',
    accentColor: '#F6AD55',
  },
};

export default foz;
