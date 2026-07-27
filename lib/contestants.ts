export type Contestant = {
  id: string;
  name: string;
  handle: string;
  photo_url: string;
  bio: string;
  color: string;
};

const og = (slug: string) => `https://www.lacasadelosfamososmexico.tv/api/image/og/us/${slug}`;

export const contestants: Contestant[] = [
  { id: 'facundo', name: 'Facundo', handle: 'Conductor y comediante', photo_url: og('facundo'), bio: 'Irreverente, frontal y con experiencia en realities.', color: '#f5c96d' },
  { id: 'olivia-collins', name: 'Olivia Collins', handle: 'Actriz', photo_url: og('olivia-collins'), bio: 'Trayectoria televisiva y personalidad auténtica.', color: '#f5c96d' },
  { id: 'aaron-mercury', name: 'Aarón Mercury', handle: 'Creador digital', photo_url: og('aaron-mercury'), bio: 'Fandom joven, redes fuertes y energía competitiva.', color: '#41e8ff' },
  { id: 'alexis-ayala', name: 'Alexis Ayala', handle: 'Actor', photo_url: og('habitantes/alexis-ayala'), bio: 'Villano icónico de telenovela, estratega y competitivo.', color: '#f5c96d' },
  { id: 'mar-contreras', name: 'Mar Contreras', handle: 'Actriz y cantante', photo_url: og('mar-contreras'), bio: 'Carisma escénico, emoción y carácter para convivencia.', color: '#ff3fb4' },
  { id: 'aldo-de-nigris', name: 'Aldo De Nigris', handle: 'Creador / TV', photo_url: og('aldo-de-nigris'), bio: 'Apellido reconocido, base regia y narrativa familiar.', color: '#41e8ff' },
  { id: 'dalilah-polanco', name: 'Dalílah Polanco', handle: 'Actriz', photo_url: og('dalilah-polanco'), bio: 'Figura querida, humor seco y gran lectura social.', color: '#ff3fb4' },
  { id: 'priscila-valverde', name: 'Priscila Valverde', handle: 'Modelo', photo_url: og('priscila-valverde'), bio: 'Perfil fresco con presencia visual y margen sorpresa.', color: '#41e8ff' },
  { id: 'adrian-di-monte', name: 'Adrián Di Monte', handle: 'Actor', photo_url: og('adrian-di-monte'), bio: 'Personalidad intensa, polémica y alto potencial de trama.', color: '#f5c96d' },
  { id: 'shiky', name: 'Shiky', handle: 'Conductor', photo_url: og('shiky'), bio: 'Humor, conversación y colmillo para leer cámaras.', color: '#f5c96d' },
  { id: 'mariana-botas', name: 'Mariana Botas', handle: 'Actriz', photo_url: og('mariana-botas'), bio: 'Nostalgia televisiva, simpatía y conexión familiar.', color: '#ff3fb4' },
  { id: 'guana', name: 'El Guana', handle: 'Actor y comediante', photo_url: og('el-guana'), bio: 'Comedia, improvisación y convivencia ligera.', color: '#f5c96d' },
  { id: 'ninel-conde', name: 'Ninel Conde', handle: 'Cantante y actriz', photo_url: og('ninel-conde'), bio: 'Celebridad de alto reconocimiento y fandom amplio.', color: '#ff3fb4' },
  { id: 'elaine-haro', name: 'Elaine Haro', handle: 'Actriz y cantante', photo_url: og('elaine-haro'), bio: 'Energía juvenil, música y presencia en redes.', color: '#41e8ff' },
  { id: 'abelito', name: 'El Abelito', handle: 'Creador digital', photo_url: og('el-abelito'), bio: 'Personalidad viral, humor y narrativa de underdog.', color: '#ff3fb4' },
];

export const researchNote = 'Cast actualizado con los 15 habitantes públicos de La Casa de los Famosos México 2025. Las fotos apuntan a imágenes públicas del sitio oficial/ViX/Las Estrellas; si se requiere uso comercial, validar derechos o reemplazar por assets autorizados.';
