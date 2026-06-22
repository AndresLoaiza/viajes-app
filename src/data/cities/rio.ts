import type { CityConfig } from '../../types/city';

// Imágenes decorativas (Ideogram) servidas desde /public/decor con el base de Vite
const asset = (p: string) => `${import.meta.env.BASE_URL}decor/${p}`;

const rio: CityConfig = {
  id: 'rio',
  name: 'Río de Janeiro',
  country: 'Brasil',
  flag: '🇧🇷',
  coverImage: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Rio_de_Janeiro_Copacabana-20110505-RM-100139.jpg/960px-Rio_de_Janeiro_Copacabana-20110505-RM-100139.jpg',
  heroImage: asset('hero.png'),
  successImage: asset('success.png'),
  welcomeBadge: asset('welcome-badge.png'),
  mascot: asset('bear.png'),
  welcomeTitle: '¡Hola Melisa! 🌴',
  welcomeSubtitle: '¿Lista para el viaje? Escoge los lugares que quieres visitar en Río de Janeiro',
  travelerName: 'Melisa',
  senderName: 'Andrés',
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
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4c/Rio_de_Janeiro_Copacabana-20110505-RM-100139.jpg/960px-Rio_de_Janeiro_Copacabana-20110505-RM-100139.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Rio_de_Janeiro_Copacabana-20110505-RM-102753.jpg/960px-Rio_de_Janeiro_Copacabana-20110505-RM-102753.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/bc/Rio_de_Janeiro_Copacabana-20110505-RM-100411.jpg/960px-Rio_de_Janeiro_Copacabana-20110505-RM-100411.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f9/Rio_de_Janeiro_Copacabana-20110505-RM-100035.jpg/960px-Rio_de_Janeiro_Copacabana-20110505-RM-100035.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Praia%20de%20Copacabana%2C%20Rio%20de%20Janeiro',
      category: 'playas',
    },
    {
      id: 'ipanema',
      name: 'Ipanema',
      description: 'La playa más cool de Río. Atardeceres épicos frente al Morro Dois Irmãos.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Posto7_Rio_de_Janeiro_Ipanema.jpg/960px-Posto7_Rio_de_Janeiro_Ipanema.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/5/54/Gay_Beach-Ipanema-Rio_de_Janeiro_Brazil.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/Rio_De_Janeiro_-_Ipanema_-_Sunset.JPG/960px-Rio_De_Janeiro_-_Ipanema_-_Sunset.JPG',
        'https://upload.wikimedia.org/wikipedia/commons/a/aa/Rio_de_Janeiro-Ipanema_Beach.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Praia%20de%20Ipanema%2C%20Rio%20de%20Janeiro',
      category: 'playas',
    },
    {
      id: 'arco-prahinha',
      name: 'Arco da Lapa',
      description: 'Icónico acueducto del siglo XVIII en el corazón bohemio de Lapa.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/At_Rio_de_Janeiro_2019_125.jpg/960px-At_Rio_de_Janeiro_2019_125.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/54/At_Rio_de_Janeiro_2019_128.jpg/960px-At_Rio_de_Janeiro_2019_128.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e9/At_Rio_de_Janeiro_2019_129.jpg/960px-At_Rio_de_Janeiro_2019_129.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/At_Rio_de_Janeiro_2019_135.jpg/960px-At_Rio_de_Janeiro_2019_135.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Arcos%20da%20Lapa%2C%20Rio%20de%20Janeiro',
      category: 'playas',
    },

    // --- NATURALEZA ---
    {
      id: 'morro-dois-irmaos',
      name: 'Morro Dois Irmãos',
      description: 'Sendero con vista panorámica a Ipanema, Leblon y las dos montañas gemelas.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/Praia_do_Leblon_e_o_Morro_dois_Irm%C3%A3os_%28013RJ012044%29.jpg/960px-Praia_do_Leblon_e_o_Morro_dois_Irm%C3%A3os_%28013RJ012044%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Morro_Dois_Irm%C3%A3os_a_partir_da_praia_do_Leblon_%28007_IMG_0987%29.jpg/960px-Morro_Dois_Irm%C3%A3os_a_partir_da_praia_do_Leblon_%28007_IMG_0987%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d4/Praia_do_Leblon%3B_ao_fundo%2C_o_Morro_Dois_Irm%C3%A3os_%28007A5P4F02-051%29.jpg/960px-Praia_do_Leblon%3B_ao_fundo%2C_o_Morro_Dois_Irm%C3%A3os_%28007A5P4F02-051%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/72/MORRO_DOIS_IRM%C3%83OS_VISTO_DA_PRAIA_DO_LEBLON.jpg/960px-MORRO_DOIS_IRM%C3%83OS_VISTO_DA_PRAIA_DO_LEBLON.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Morro%20Dois%20Irm%C3%A3os%2C%20Rio%20de%20Janeiro',
      category: 'naturaleza',
    },
    {
      id: 'pedra-bonita',
      name: 'Pedra Bonita',
      description: 'Sendero en el Parque Nacional Tijuca con vistas espectaculares. Punto de lanzamiento del ala delta.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Pedra_Bonita_by_diego_Baravelli.jpg/960px-Pedra_Bonita_by_diego_Baravelli.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/PedraBonita.jpg/960px-PedraBonita.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3d/Pedra_Bonita-RJ.jpg/960px-Pedra_Bonita-RJ.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Pedra_Bonita_10.jpg/960px-Pedra_Bonita_10.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Pedra%20Bonita%2C%20Rio%20de%20Janeiro',
      category: 'naturaleza',
    },
    {
      id: 'pan-de-azucar',
      name: 'Pan de Azúcar',
      description: 'Teleférico hasta la cima con vista de 360° de toda la bahía. O sube caminando si te atreves.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Rio_de_Janeiro_from_Sugarloaf_mountain%2C_May_2004.jpg/960px-Rio_de_Janeiro_from_Sugarloaf_mountain%2C_May_2004.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ed/Rio_de_Janeiro%2C_Brazil_-08.jpg/960px-Rio_de_Janeiro%2C_Brazil_-08.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Sugarloaf_Sunrise_2.jpg/960px-Sugarloaf_Sunrise_2.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b1/Rio_de_Janeiro_-_P%C3%A3o_de_A%C3%A7ucar_-_Cablecar.jpg/960px-Rio_de_Janeiro_-_P%C3%A3o_de_A%C3%A7ucar_-_Cablecar.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=P%C3%A3o%20de%20A%C3%A7%C3%BAcar%2C%20Rio%20de%20Janeiro',
      category: 'naturaleza',
    },
    {
      id: 'parque-lage',
      name: 'Parque Lage',
      description: 'Mansión histórica rodeada de selva atlántica. Tiene un café con piscina en el patio.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/01/Parque_Lage%2C_Rio_de_Janeiro_Project_2345_01.jpg/960px-Parque_Lage%2C_Rio_de_Janeiro_Project_2345_01.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/51/Caf%C3%A9_Lage%2C_R%C3%ADo_de_Janeiro_A74281920241124.jpg/960px-Caf%C3%A9_Lage%2C_R%C3%ADo_de_Janeiro_A74281920241124.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/36/Palacio%2C_interior_del_Parque_Lage_A74281420241124.jpg/960px-Palacio%2C_interior_del_Parque_Lage_A74281420241124.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Entrada_Parque_Lage_A74281120241124.jpg/960px-Entrada_Parque_Lage_A74281120241124.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Parque%20Lage%2C%20Rio%20de%20Janeiro',
      category: 'naturaleza',
    },
    {
      id: 'jardin-botanico',
      name: 'Jardín Botánico',
      description: '140 hectáreas con 6.000 especies de plantas. La avenida de palmeras reales es increíble.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/As_palmeiras_imperiais_do_Jardim_Bot%C3%A2nico_-_Rio_de_Janeiro._%289062349874%29.jpg/960px-As_palmeiras_imperiais_do_Jardim_Bot%C3%A2nico_-_Rio_de_Janeiro._%289062349874%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Jardim_Bot%C3%A2nico_-_Aleia_das_Palmeiras_Imperiais_%28002057TP006%29.jpg/960px-Jardim_Bot%C3%A2nico_-_Aleia_das_Palmeiras_Imperiais_%28002057TP006%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/96/Palmeiras_Imperiais%2C_Jardim_Bot%C3%A2nico%2C_Rio_de_Janeiro.jpg/960px-Palmeiras_Imperiais%2C_Jardim_Bot%C3%A2nico%2C_Rio_de_Janeiro.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b8/Rua_Jardim_Bot%C3%A2nico_-_Palmeiras_Imperiais_%28013RJ011036%29.jpg/960px-Rua_Jardim_Bot%C3%A2nico_-_Palmeiras_Imperiais_%28013RJ011036%29.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Jardim%20Bot%C3%A2nico%20do%20Rio%20de%20Janeiro',
      category: 'naturaleza',
    },

    // --- CULTURA ---
    {
      id: 'real-gabinete',
      name: 'Real Gabinete Português de Lectura',
      description: 'La biblioteca más bella de América Latina. Arquitectura neo-manuelina del siglo XIX.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/88/Real_Gabinete_Portugu%C3%AAs_de_Leitura_03.jpg/960px-Real_Gabinete_Portugu%C3%AAs_de_Leitura_03.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/Real_Gabinete_Portugu%C3%AAs_de_Leitura_11-18.jpg/960px-Real_Gabinete_Portugu%C3%AAs_de_Leitura_11-18.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Real_Gabinete_Portugu%C3%AAs_de_Leitura.jpg/960px-Real_Gabinete_Portugu%C3%AAs_de_Leitura.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c9/Real_Gabinete_Portugu%C3%AAs_de_Leitura_por_Rodrigo_Tetsuo_Argenton_%2801%29.jpg/960px-Real_Gabinete_Portugu%C3%AAs_de_Leitura_por_Rodrigo_Tetsuo_Argenton_%2801%29.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Real%20Gabinete%20Portugu%C3%AAs%20de%20Leitura%2C%20Rio%20de%20Janeiro',
      category: 'cultura',
    },
    {
      id: 'cristo-redentor',
      name: 'Cristo Redentor',
      description: 'Una de las 7 maravillas del mundo moderno. Vista de 360° de todo Río desde el Corcovado.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a5/Obama_family_in_mist_in_Rio_de_Janeiro.jpg/960px-Obama_family_in_mist_in_Rio_de_Janeiro.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/Unique_Moment_with_the_Moon_and_Christ_the_Redeemer_3.jpg/960px-Unique_Moment_with_the_Moon_and_Christ_the_Redeemer_3.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Redentor_Over_Clouds_1.jpg/960px-Redentor_Over_Clouds_1.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/Corcovado_sunset_silhouette.jpg/960px-Corcovado_sunset_silhouette.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cristo%20Redentor%2C%20Rio%20de%20Janeiro',
      category: 'cultura',
      tip: 'Compra las entradas con anticipación en el sitio web oficial.',
      bookingUrl: 'https://www.paineirascorcovado.com.br',
    },
    {
      id: 'selaron',
      name: 'Escaleras Selarón',
      description: 'Obra de arte del artista chileno Jorge Selarón. 215 escalones cubiertos de azulejos coloridos.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/Colorful_Selaron_Stairs_3.jpg/960px-Colorful_Selaron_Stairs_3.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fc/Escadaria_Selar%C3%B3n_-_Rio_de_Janeiro_-_20240417062601.jpg/960px-Escadaria_Selar%C3%B3n_-_Rio_de_Janeiro_-_20240417062601.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Escadaria_Selar%C3%B3n-3.jpg/960px-Escadaria_Selar%C3%B3n-3.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ef/Escadaria_Selar%C3%B3n-4.jpg/960px-Escadaria_Selar%C3%B3n-4.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Escadaria%20Selar%C3%B3n%2C%20Rio%20de%20Janeiro',
      category: 'cultura',
    },
    {
      id: 'santa-teresa',
      name: 'Barrio Santa Teresa',
      description: 'El barrio bohemio de Río. Calles empedradas, arte callejero, bares y restaurantes únicos.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ea/BrunaPrado_Bonde_de_Santa_Teresa_Rio_de_Janeiro_RJ_%2841577817931%29.jpg/960px-BrunaPrado_Bonde_de_Santa_Teresa_Rio_de_Janeiro_RJ_%2841577817931%29.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0b/Bondinho_de_Santa_Teresa_na_Esta%C3%A7%C3%A3o_Carioca_02.jpg/960px-Bondinho_de_Santa_Teresa_na_Esta%C3%A7%C3%A3o_Carioca_02.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a3/Tram_Bonde_de_Santa_Teresa.jpg/960px-Tram_Bonde_de_Santa_Teresa.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/R%C3%ADo_de_Janeiro%2C_Bonde_%282007%29_07.jpg/960px-R%C3%ADo_de_Janeiro%2C_Bonde_%282007%29_07.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Santa%20Teresa%2C%20Rio%20de%20Janeiro',
      category: 'cultura',
    },
    {
      id: 'forte-copacabana',
      name: 'Forte de Copacabana',
      description: 'Fuerte histórico de 1914 al final de la playa de Copacabana. Museo y vistas al mar.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/Forte_de_Copacabana_10-crop.jpg/960px-Forte_de_Copacabana_10-crop.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Forte_de_Copacabana_panorama.jpg/960px-Forte_de_Copacabana_panorama.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/31/Forte_de_Copacabana_06.jpg/960px-Forte_de_Copacabana_06.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f5/1_Forte_de_Copacabana_2014.jpg/960px-1_Forte_de_Copacabana_2014.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Forte%20de%20Copacabana%2C%20Rio%20de%20Janeiro',
      category: 'cultura',
    },
    {
      id: 'museu-amanha',
      name: 'Museu do Amanhã',
      description: 'Museo de ciencias futurista diseñado por Santiago Calatrava. Arquitectura espectacular en el puerto.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Museu_do_Amanh%C3%A3_ao_anoitecer_do_Rio.jpg/960px-Museu_do_Amanh%C3%A3_ao_anoitecer_do_Rio.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/Museo_del_Ma%C3%B1ana%2C_R%C3%ADo_de_Janeiro_A74237820241122.jpg/960px-Museo_del_Ma%C3%B1ana%2C_R%C3%ADo_de_Janeiro_A74237820241122.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Museo_del_Ma%C3%B1ana%2C_R%C3%ADo_de_Janeiro_A74236920241122.jpg/960px-Museo_del_Ma%C3%B1ana%2C_R%C3%ADo_de_Janeiro_A74236920241122.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e5/Escultura_de_la_Estrella_Met%C3%A1lica_y_Vista_de_la_Bah%C3%ADa_de_Guanabara%2C_R%C3%ADo_de_Janeiro_A74240520241122.jpg/960px-Escultura_de_la_Estrella_Met%C3%A1lica_y_Vista_de_la_Bah%C3%ADa_de_Guanabara%2C_R%C3%ADo_de_Janeiro_A74240520241122.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Museu%20do%20Amanh%C3%A3%2C%20Rio%20de%20Janeiro',
      category: 'cultura',
    },

    // --- EXPERIENCIAS ---
    {
      id: 'paddle-amanecer',
      name: 'Amanecer en Paddle Surf',
      description: 'Salir al mar en tabla de SUP antes de que salga el sol. Con @surfrio o @modoverticaltour.',
      images: [
        `${import.meta.env.BASE_URL}paddle/sup1.png`,
        `${import.meta.env.BASE_URL}paddle/sup2.png`,
        `${import.meta.env.BASE_URL}paddle/sup3.png`,
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Praia%20de%20Copacabana%20Posto%206%2C%20Rio%20de%20Janeiro',
      category: 'experiencias',
    },
    {
      id: 'ala-delta',
      name: 'Ala Delta / Paracaidismo',
      description: 'Volar en tándem desde Pedra Bonita con vistas a toda la ciudad. Una de las mejores del mundo.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Olhar_de_p%C3%A1ssaro.jpg/960px-Olhar_de_p%C3%A1ssaro.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Rampa%20de%20Voo%20Livre%20Pedra%20Bonita%2C%20S%C3%A3o%20Conrado%2C%20Rio%20de%20Janeiro',
      category: 'experiencias',
    },
    {
      id: 'malecon',
      name: 'Caminar por el Malecón',
      description: 'El Aterro do Flamengo, parque costero con 1,2 km de playa artificial y vistas a la bahía.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/4/45/Top_Down_View_of_Copacabana_Mosaic_and_Palm_Trees_3.jpg/960px-Top_Down_View_of_Copacabana_Mosaic_and_Palm_Trees_3.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d8/Cal%C3%A7ad%C3%A3o_de_Copacabana_-_Rio_de_Janeiro_%283%29.JPG/960px-Cal%C3%A7ad%C3%A3o_de_Copacabana_-_Rio_de_Janeiro_%283%29.JPG',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/18/Cal%C3%A7ad%C3%A3o_de_Copacabana_-_Rio_de_Janeiro_%282%29.JPG/960px-Cal%C3%A7ad%C3%A3o_de_Copacabana_-_Rio_de_Janeiro_%282%29.JPG',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Cal%C3%A7ad%C3%A3o_de_Copacabana_-_Rio_de_Janeiro_%281%29.JPG/960px-Cal%C3%A7ad%C3%A3o_de_Copacabana_-_Rio_de_Janeiro_%281%29.JPG',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Cal%C3%A7ad%C3%A3o%20de%20Copacabana%2C%20Rio%20de%20Janeiro',
      category: 'experiencias',
    },

    // --- GASTRONOMÍA ---
    {
      id: 'confiteria',
      name: 'Confeitaria Colombo',
      description: 'El café más elegante de Río. Belle Époque con espejos belgas, mármol y pastelería de ensueño.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/16/Confeitaria_Colombo_-_Rio_de_Janeiro_-_20230323130249.jpg/960px-Confeitaria_Colombo_-_Rio_de_Janeiro_-_20230323130249.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Confeitaria_Colombo_-_Rio_de_Janeiro_-_20230323130434.jpg/960px-Confeitaria_Colombo_-_Rio_de_Janeiro_-_20230323130434.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Confeitaria_Colombo_-_Rio_de_Janeiro_-_20210911155216.jpg/960px-Confeitaria_Colombo_-_Rio_de_Janeiro_-_20210911155216.jpg',
        'https://upload.wikimedia.org/wikipedia/commons/thumb/6/62/Confeitaria_Colombo%2C_Rio.JPG/960px-Confeitaria_Colombo%2C_Rio.JPG',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Confeitaria%20Colombo%2C%20Centro%2C%20Rio%20de%20Janeiro',
      category: 'gastronomia',
    },
    {
      id: 'garota-ipanema',
      name: 'Bar Garota de Ipanema',
      description: 'El bar donde Tom Jobim compuso "La chica de Ipanema". Musica ao vivo y caipirinha legendaria.',
      images: [
        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/8b/Sign_of_Bar_Garota_de_Ipanema_-_Ipanema_-_Rio_de_Janeiro_-_Brazil_%2817370446502%29.jpg/960px-Sign_of_Bar_Garota_de_Ipanema_-_Ipanema_-_Rio_de_Janeiro_-_Brazil_%2817370446502%29.jpg',
        'https://media-cdn.tripadvisor.com/media/photo-s/03/22/16/f9/garota-de-ipanema.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Garota%20de%20Ipanema%2C%20Rua%20Vin%C3%ADcius%20de%20Moraes%2049%2C%20Ipanema%2C%20Rio%20de%20Janeiro',
      category: 'gastronomia',
    },
    {
      id: 'lasai',
      name: 'Restaurante Lasai',
      description: 'Alta cocina contemporánea en Botafogo (chef Rafa Costa e Silva). Menú degustación con ingredientes de su propia huerta; estrella Michelin y de los mejores de Latinoamérica. Reservar con anticipación.',
      tip: 'Reserva obligatoria, con semanas de anticipación.',
      images: [],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Lasai%2C%20Rua%20Conde%20de%20Iraj%C3%A1%20191%2C%20Botafogo%2C%20Rio%20de%20Janeiro',
      category: 'gastronomia',
    },
    {
      id: 'carretao',
      name: 'Carretão (Carnes)',
      description: 'Churrascaria brasileña por kilo. La mejor carne asada de la ciudad.',
      images: [
        `${import.meta.env.BASE_URL}lugares/carretao.png`,
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Carret%C3%A3o%20Ipanema%2C%20Rua%20Visconde%20de%20Piraj%C3%A1%20112%2C%20Rio%20de%20Janeiro',
      category: 'gastronomia',
    },
    {
      id: 'so-lo-cafe',
      name: 'So Lo Café',
      description: 'Café de especialidad en un rincón con onda en Río.',
      images: [
        'https://images.adsttc.com/media/images/68af/0f85/7b16/8100/0138/25f6/newsletter/Est_dio_Ch_o__Fevereiro_2025___Renato_Mangolin_015.jpg?1756303331',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=SO_Lo%20Caf%C3%A9%2C%20Rua%20Garcia%20d%27%C3%81vila%20147%2C%20Ipanema%2C%20Rio%20de%20Janeiro',
      category: 'gastronomia',
    },
    {
      id: 'padaria-ipanema',
      name: 'Padaria Ipanema',
      description: 'La panadería de barrio más querida de Ipanema. Pão de queijo y café da manhã perfectos.',
      images: [
        'https://lh3.googleusercontent.com/gps-cs-s/APNQkAFNUDiQyv7paiBPQoi0ZxNTwhHhDdwwK6FBoPLYUAdxJd8_Ue5NW71u1gFXJzOglS1mexuHYHw-7malIasRPdKI5rxfLUT695rENR8hlffxsdTLEEggKfGomfhhO5D8tI7Jw54mJqwYUjQb=s680-w680-h510-rw',
        'https://lh3.googleusercontent.com/gps-cs-s/APNQkAHNKDHKClK5PngB1jOmiS2UWAn8q6alntdUO6pVUltcgqrkH7n76-oQk3Ubv_l3nkH5Zk-mNbpev46eN0-VL-skjrpWOEPc8zsbhhdtt3b8BouRMFUpxUmp9FOLZzyH-gIaZz30xUl_vZA=s680-w680-h510-rw',
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRsb8mHo-B5sJe-NTmAgdXOINm4eEticqCGew&s',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Padaria%20Ipanema%2C%20Rua%20Visconde%20de%20Piraj%C3%A1%20325%2C%20Rio%20de%20Janeiro',
      category: 'gastronomia',
    },
    {
      id: 'feria-nocturna',
      name: 'Feria Nocturna de Copacabana',
      description: 'Mercado nocturno en la orla de Copacabana. Artesanías, comida y música carioca.',
      images: [
        'https://static.wixstatic.com/media/d868ba_d92b5b889a7f49f4ab07430ce0c23923~mv2.jpg/v1/fill/w_568,h_378,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/d868ba_d92b5b889a7f49f4ab07430ce0c23923~mv2.jpg',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Feira%20Hippie%20de%20Ipanema%2C%20Pra%C3%A7a%20General%20Os%C3%B3rio%2C%20Rio%20de%20Janeiro',
      category: 'gastronomia',
    },

    // --- COMPRAS & NOCHE ---
    {
      id: 'havaianas',
      name: 'Tienda Havaianas',
      description: 'La tienda flagship de las chancletas más famosas de Brasil. Personalízalas en el momento.',
      images: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/18/de/48/98/getlstd-property-photo.jpg?w=900&h=500&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/b5/f0/70/caption.jpg?w=900&h=500&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/32/50/9a/2d/caption.jpg?w=900&h=500&s=1',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Espa%C3%A7o%20Havaianas%2C%20Rua%20Garcia%20d%27%C3%81vila%20124%2C%20Ipanema%2C%20Rio%20de%20Janeiro',
      category: 'compras',
    },
    {
      id: 'roxy-show',
      name: 'Roxy Dinner Show',
      description: 'Show de samba, capoeira y danzas brasileñas mientras cenas. La experiencia carioca completa.',
      images: [
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/0f/0d/e9/rio-de-janeiro-e-o-samba.jpg?w=900&h=500&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/31/0f/10/f7/parintins-homenageado.jpg?w=900&h=500&s=1',
        'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/33/0b/d8/5b/caption.jpg?w=900&h=600&s=1',
      ],
      mapsUrl: 'https://www.google.com/maps/search/?api=1&query=Roxy%20Dinner%20Show%2C%20Copacabana%2C%20Rio%20de%20Janeiro',
      category: 'compras',
    },
  ],
  theme: {
    primaryColor: '#009C3B',
    secondaryColor: '#FFDF00',
    accentColor: '#002776',
    bgPattern: asset('pattern.png'),
  },
  center: [-22.9711, -43.1822],
  zoom: 12,
};

export default rio;
