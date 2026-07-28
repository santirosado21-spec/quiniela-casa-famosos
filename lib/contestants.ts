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
  { id: 'aldo-rendon', name: 'Aldo Rendón', handle: 'Fashion Stylist', photo_url: og('aldo-rendon'), bio: 'Stylist mexicano con presencia fuerte en moda y entretenimiento.', color: '#f5c96d' },
  { id: 'mariana-ochoa', name: 'Mariana Ochoa', handle: 'Cantante y actriz', photo_url: og('mariana-ochoa'), bio: 'Integrante de OV7; llega con trayectoria musical, televisiva y de realities.', color: '#ff3fb4' },
  { id: 'luis-chaparro', name: 'Luis Chaparro', handle: 'Creador de contenido', photo_url: og('luis-chaparro'), bio: 'Creador de contenido y periodista con narrativa directa y personalidad digital.', color: '#41e8ff' },
  { id: 'gema-garoa', name: 'Gema Garoa', handle: 'Actriz y conductora', photo_url: og('gema-garoa'), bio: 'Actriz y conductora que suma energía, carisma y experiencia frente a cámara.', color: '#f5c96d' },
  { id: 'yanet-garcia', name: 'Yanet García', handle: 'Actriz y Health Coach', photo_url: og('yanet-garcia'), bio: 'Actriz, health coach y figura digital con gran reconocimiento público.', color: '#ff3fb4' },
  { id: 'memo-schutz', name: 'Memo Schutz', handle: 'Comentarista y conductor', photo_url: og('memo-schutz'), bio: 'Comentarista y conductor con perfil competitivo y experiencia en medios.', color: '#41e8ff' },
  { id: 'brianda-deyanara', name: 'Brianda Deyanara', handle: 'Creadora de contenido', photo_url: og('brianda-deyanara'), bio: 'Creadora de contenido con comunidad digital amplia y estilo extrovertido.', color: '#f5c96d' },
  { id: 'fede-vigevani', name: 'Fede Vigevani', handle: 'Creador de contenido', photo_url: og('fede-vigevani'), bio: 'Creador de contenido con una de las bases digitales más fuertes.', color: '#ff3fb4' },
  { id: 'ese-perez', name: 'Ese Pérez', handle: 'Creador de contenido', photo_url: og('ese-perez'), bio: 'Creador digital con narrativa de sorpresa y potencial de conversación.', color: '#41e8ff' },
  { id: 'arantza-ruiz', name: 'Arantza Ruiz', handle: 'Actriz', photo_url: og('arantza-ruiz'), bio: 'Actriz joven con carrera en pantalla y perfil fresco para la casa.', color: '#f5c96d' },
  { id: 'masad-altamimi', name: 'Masad Altamimi', handle: 'Creador de contenido', photo_url: og('masad-altamimi'), bio: 'Creador de contenido originario de Arabia; perfil diferente dentro del cast.', color: '#ff3fb4' },
  { id: 'flor-vigna', name: 'Flor Vigna', handle: 'Actriz y cantante', photo_url: og('flor-vigna'), bio: 'Argentina con experiencia en música, actuación, deporte y realities.', color: '#41e8ff' },
  { id: 'yahir', name: 'Yahir', handle: 'Cantante', photo_url: og('yahir'), bio: 'Cantante reconocido que entra para mostrar una faceta más personal.', color: '#f5c96d' },
  { id: 'cynthia-klitbo', name: 'Cynthia Klitbo', handle: 'Actriz', photo_url: og('cynthia-klitbo'), bio: 'Villana icónica de telenovelas; perfil fuerte para drama y estrategia.', color: '#ff3fb4' },
  { id: 'moises-penaloza', name: 'Moisés Peñaloza', handle: 'Actor', photo_url: og('moises-penaloza'), bio: 'Actor en ascenso con presencia televisiva y perfil competitivo.', color: '#41e8ff' },
  { id: 'ximena-herrera', name: 'Ximena Herrera', handle: 'Actriz', photo_url: og('ximena-herrera'), bio: 'Actriz con más de dos décadas de carrera y debut en reality 24/7.', color: '#f5c96d' },
  { id: 'karina-torres', name: 'Karina Torres', handle: 'Creadora de contenido', photo_url: og('karina-torres'), bio: 'De La Fiesta de los Famosos a habitante; llega con apoyo del público digital.', color: '#ff3fb4' },
  { id: 'ernesto-laguardia', name: 'Ernesto Laguardia', handle: 'Actor', photo_url: og('ernesto-laguardia'), bio: 'Actor con trayectoria sólida en TV y debut en realities.', color: '#41e8ff' },
];

export const researchNote = 'Cast actualizado con los 18 habitantes confirmados públicamente para La Casa de los Famosos México 2026 según la página oficial de habitantes de LaCasaDeLosFamososMexico.tv consultada el 2026-07-28. Fotos desde endpoints OG oficiales del sitio. Si se requiere uso comercial, validar derechos o reemplazar por assets autorizados.';
