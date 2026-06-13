import type { CityConfig } from '../../types/city';

const foz: CityConfig = {
  id: 'foz',
  name: 'Foz do Iguaçu',
  country: 'Brasil',
  flag: '🇧🇷',
  coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Iguazu_Falls_Panorama_2009.jpg/960px-Iguazu_Falls_Panorama_2009.jpg',
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
      description: 'La vista más panorámica de las cataratas: desde el sendero de 1,2 km se ven hasta 275 saltos de agua cayendo al mismo tiempo. Es impresionante caminar al borde del abismo con la neblina húmeda en la cara.',
      tip: 'Llega temprano para evitar las multitudes y aprovechar la luz de la mañana.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5b/Iguazu_Falls_Panorama_2009.jpg/960px-Iguazu_Falls_Panorama_2009.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Iguazu_Falls_%28144902383%29.jpeg/960px-Iguazu_Falls_%28144902383%29.jpeg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2c/Iguazu_D%C3%A9cembre_2007_-_Panorama_7.jpg/960px-Iguazu_D%C3%A9cembre_2007_-_Panorama_7.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cataratas+do+Igua%C3%A7u+lado+brasileiro+Foz+do+Igua%C3%A7u',
      category: 'cataratas',
    },
    {
      id: 'passarela-garganta',
      name: 'Passarela Garganta do Diabo',
      description: 'La pasarela sobre el río Iguazú lleva directo a la "Garganta del Diablo", el salto más poderoso de las cataratas. La fuerza del agua y la nube de vapor que se levanta son algo que no se olvida.',
      tip: 'El sendero es corto pero el impacto visual es total: prepárate para mojarte.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Devil%27s_Throat_Iguazu_Falls_09_2009_AR_7224.jpg/960px-Devil%27s_Throat_Iguazu_Falls_09_2009_AR_7224.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Devil%27s_Throat_Iguazu_Falls_09_2009_AR_7222.jpg/960px-Devil%27s_Throat_Iguazu_Falls_09_2009_AR_7222.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/cc/Devil%27s_Throat_Iguazu_Falls_09_2009_AR_7223.jpg/960px-Devil%27s_Throat_Iguazu_Falls_09_2009_AR_7223.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Passarela+Garganta+do+Diabo+Foz+do+Igua%C3%A7u',
      category: 'cataratas',
    },
    {
      id: 'parque-das-aves',
      name: 'Parque das Aves',
      description: 'Un aviario tropical junto a las cataratas con más de 1.500 aves de especies nativas de la selva atlántica. Las jaulas son tan grandes que puedes caminar dentro y que los tucanes y guacamayos te rodeen.',
      tip: 'Parada perfecta al salir del Parque Nacional Iguaçu: queda justo en la entrada.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/Parque_das_Aves%2C_Foz_do_Iguacu%2C_Brazil-12Feb2011.jpg/960px-Parque_das_Aves%2C_Foz_do_Iguacu%2C_Brazil-12Feb2011.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c5/Parque_das_Aves%2C_Foz_do_Igua%C3%A7u_Gabrielle_Patitucci_%2807%29.jpg/960px-Parque_das_Aves%2C_Foz_do_Igua%C3%A7u_Gabrielle_Patitucci_%2807%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Cariama_cristata_at_Parque_das_Aves_%28Foz_do_Igua%C3%A7u%29-2.jpg/960px-Cariama_cristata_at_Parque_das_Aves_%28Foz_do_Igua%C3%A7u%29-2.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Parque+das+Aves+Foz+do+Igua%C3%A7u',
      category: 'cataratas',
    },

    // --- INGENIERÍA & MONUMENTOS ---
    {
      id: 'itaipu-tour',
      name: 'Represa Itaipú (tour panorámico)',
      description: 'La segunda represa hidroeléctrica más grande del mundo, compartida entre Brasil y Paraguay. El tour panorámico en bus permite ver la escala monumental de la obra desde los miradores exteriores.',
      tip: 'Vale la pena el upgrade al tour especial para entrar a las turbinas subterráneas.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Itaipu_Dam_4084_filtered_%281%29.jpg/960px-Itaipu_Dam_4084_filtered_%281%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Itaipu_Dam%2C_aerial_photograph.jpg/960px-Itaipu_Dam%2C_aerial_photograph.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/b/b8/ItaipuAerea2AAL.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Usina+Hidreletrica+Itaipu+Foz+do+Igua%C3%A7u',
      category: 'ingenieria',
    },
    {
      id: 'marco-tres-fronteiras',
      name: 'Marco das Três Fronteiras',
      description: 'El punto exacto donde se encuentran Brasil, Argentina y Paraguay, marcado por un obelisco iluminado en los colores de cada país. La vista al río Iguazú desde el mirador al atardecer es preciosa.',
      tip: 'El lugar se anima especialmente de noche, cuando los obeliscos se iluminan.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Marco_das_Tr%C3%AAs_Fronteiras_-_Noite.jpg/960px-Marco_das_Tr%C3%AAs_Fronteiras_-_Noite.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Marco_das_Tr%C3%AAs_Fronteiras%2C_Foz_do_Igua%C3%A7%C3%BA.jpg/960px-Marco_das_Tr%C3%AAs_Fronteiras%2C_Foz_do_Igua%C3%A7%C3%BA.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/6/6b/Placas_-_Marco_das_Tr%C3%AAs_Fronteiras.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Marco+das+Tr%C3%AAs+Fronteiras+Foz+do+Igua%C3%A7u',
      category: 'ingenieria',
    },

    // --- TEMPLOS & CULTURA ---
    {
      id: 'templo-chen-tien',
      name: 'Templo Budista Chen Tien',
      description: 'El templo budista más grande de América Latina, construido por la comunidad taiwanesa de Foz. Sus techos rojos y dorados entre jardines verdes son un contraste fascinante con la selva circundante.',
      tip: 'La entrada es libre y los jardines son ideales para caminar tranquilamente.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Templo_Budista_de_Foz_do_Igua%C3%A7u.jpg/960px-Templo_Budista_de_Foz_do_Igua%C3%A7u.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Rei_Virudhaka.jpg/960px-Rei_Virudhaka.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/Buda_Amituofo.jpg/960px-Buda_Amituofo.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Templo+Budista+Chen+Tien+Foz+do+Igua%C3%A7u',
      category: 'cultura',
    },
    {
      id: 'mezquita-omar',
      name: 'Mezquita Omar Ibn Al-Khattab',
      description: 'Una de las mezquitas más grandes de América del Sur, reflejo de la numerosa comunidad árabe de Foz do Iguaçu. Su arquitectura blanca con cúpulas y minaretes es completamente inesperada en medio del Brasil subtropical.',
      tip: 'Las visitas guiadas son gratuitas; basta llegar con ropa discreta y respeto.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7e/Omar_Ibn_Al-Khatab_Mosque%2C_Foz_do_Igua%C3%A7u_70.jpg/960px-Omar_Ibn_Al-Khatab_Mosque%2C_Foz_do_Igua%C3%A7u_70.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Omar_Ibn_Al-Khatab_Mosque%2C_Foz_do_Igua%C3%A7u_80.jpg/960px-Omar_Ibn_Al-Khatab_Mosque%2C_Foz_do_Igua%C3%A7u_80.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/2/25/MesquitaFozDoIgua%C3%A7uParanaBrasil.JPG',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Mesquita+Omar+Ibn+Al-Khattab+Foz+do+Igua%C3%A7u',
      category: 'cultura',
    },

    // --- GASTRONOMÍA --- (sin fotos libres en Commons → fallback "Ver en Maps")
    {
      id: 'rafain-churrascaria',
      name: 'Rafain Churrascaria (cena show)',
      description: 'La experiencia gastronómica más famosa de Foz: un rodízio de carnes con show folclórico en vivo con danzas de toda América Latina. Ideal para la primera noche porque combina muy buena comida con un espectáculo de hora y media.',
      tip: 'Reserva con anticipación: se llena casi todas las noches.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rafain+Centro+de+Conven%C3%A7%C3%B5es+Foz+do+Igua%C3%A7u',
      category: 'gastronomia',
    },
    {
      id: 'vo-bertila',
      name: 'Vó Bertila (pizza y pasta)',
      description: 'Restaurante familiar de cocina italiana con décadas de historia en Foz, famoso por sus pastas caseras y pizzas de masa gruesa. El ambiente es acogedor y los precios muy razonables.',
      tip: 'El ravioli de la casa es el plato que la gente más recomienda.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=V%C3%B3+Bertila+Restaurante+Foz+do+Igua%C3%A7u',
      category: 'gastronomia',
    },
    {
      id: 'castelo-libanes',
      name: 'Castelo Libanês',
      description: 'Restaurante de comida árabe y libanesa en el corazón de Foz, donde come la comunidad árabe local. El hummus, el kafta y los mezzes son auténticos y abundantes.',
      tip: 'Perfecto para un almuerzo diferente que refleja la diversidad de esta ciudad fronteriza.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Castelo+Libanes+Restaurante+Foz+do+Igua%C3%A7u',
      category: 'gastronomia',
    },
    {
      id: 'emporio-com-arte',
      name: 'Empório com Arte (café)',
      description: 'Cafetería de especialidad con ambiente artístico, ideal para el desayuno o una pausa entre visitas. Sirven café brasileño de origen con métodos de filtrado, pasteles y panes artesanales.',
      tip: 'El espacio mezcla galería de arte local con cafetería: un rincón especial.',
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
  center: [-25.55, -54.55],
  zoom: 11,
};

export default foz;
