export type Contestant = {
  id: string;
  name: string;
  handle: string;
  photo_url: string;
  bio: string;
  color: string;
};

const og = (slug: string) => `https://www.lacasadelosfamososmexico.tv/api/image/og/us/habitantes/${slug}`;

export const contestants: Contestant[] = [
  { id: 'ernesto-laguardia', name: 'Ernesto Laguardia', handle: 'Actor y conductor', photo_url: og('ernesto-laguardia'), bio: 'Primer habitante confirmado; trayectoria sólida en TV y debut en realities.', color: '#f5c96d' },
  { id: 'karina-torres', name: 'Karina Torres', handle: 'Conductora / creadora', photo_url: og('karina-torres'), bio: 'De La Fiesta de los Famosos a habitante; llega con apoyo del público digital.', color: '#ff3fb4' },
  { id: 'ximena-herrera', name: 'Ximena Herrera', handle: 'Actriz', photo_url: og('ximena-herrera'), bio: 'Actriz con más de dos décadas de carrera y debut en reality 24/7.', color: '#41e8ff' },
  { id: 'aldo-rendon', name: 'Aldo Rendón', handle: 'Stylist mexicano', photo_url: og('aldo-rendon'), bio: 'Stylist viral con respaldo de figuras de moda y entretenimiento.', color: '#f5c96d' },
  { id: 'moises-penaloza', name: 'Moisés Peñaloza', handle: 'Actor', photo_url: og('moises-penaloza'), bio: 'Actor en ascenso, quinto confirmado de la cuarta temporada.', color: '#41e8ff' },
  { id: 'cynthia-klitbo', name: 'Cynthia Klitbo', handle: 'Actriz', photo_url: og('cynthia-klitbo'), bio: 'Villana icónica de telenovelas; perfil fuerte para drama y estrategia.', color: '#ff3fb4' },
  { id: 'yahir', name: 'Yahir Othón', handle: 'Cantante y actor', photo_url: og('yahir'), bio: 'Cantante reconocido que entra para mostrar una faceta más personal.', color: '#f5c96d' },
  { id: 'flor-vigna', name: 'Flor Vigna', handle: 'Cantante / actriz / creadora', photo_url: og('flor-vigna'), bio: 'Argentina con experiencia en música, actuación, deporte y realities.', color: '#ff3fb4' },
  { id: 'masad-altamimi', name: 'Masad Altamimi', handle: 'Influencer', photo_url: og('masad-altamimi'), bio: 'Influencer originario de Arabia; noveno habitante confirmado.', color: '#41e8ff' },
  { id: 'arantza-ruiz', name: 'Arantza Ruiz', handle: 'Actriz', photo_url: og('arantza-ruiz'), bio: 'Actriz joven, décima habitante confirmada tras pistas que causaron revuelo.', color: '#ff3fb4' },
  { id: 'ese-perez', name: 'Ese Pérez', handle: 'Influencer', photo_url: og('ese-perez'), bio: 'Onceavo habitante revelado; creador digital con narrativa de sorpresa.', color: '#41e8ff' },
  { id: 'fede-vigevani', name: 'Fede Vigevani', handle: 'Creador digital', photo_url: og('fede-vigevani'), bio: 'Doceavo habitante confirmado; una de las bases digitales más fuertes.', color: '#f5c96d' },
];

export const researchNote = 'Cast actualizado con los 12 habitantes confirmados públicamente para La Casa de los Famosos México 2026 según páginas oficiales de Las Estrellas y LaCasaDeLosFamososMexico.tv consultadas el 2026-07-27. Fotos desde endpoints OG oficiales del sitio. Si se requiere uso comercial, validar derechos o reemplazar por assets autorizados.';
