// Datos del viaje. Todo lo editable vive aquí.
// Precios en USD salvo que diga Q (quetzal) o ₡ (colón). Investigación del 9 nov 2026: los marcados "por confirmar"
// salen de buscadores y guías, no de una cotización con fecha exacta.

const TRIP = {
  start: '2026-12-08', end: '2026-12-13', people: 1,
  fx: { crc: 450, gtq: 7.7, note: 'Dólar bajo ₡450 (Monex, 6 nov 2026). Quetzal ~Q7,7 por dólar.' },
  budget: { min: 300000, max: 400000 },
  airport: { id: 'gua', name: 'Aeropuerto La Aurora (GUA)', lat: 14.5833, lng: -90.5275 },
};

// Vuelos directos SJO ⇄ GUA (≈1 h 35). Volaris dejó la ruta el 12 abr 2026: solo Avianca y Copa.
// Horarios de rastreadores (FlightConnections, Airpaz, FlightsFrom): confirmar en la aerolínea para el día exacto.
const FLIGHTS = {
  out: [
    { id: 'av-am', date: '2026-12-08', air: 'Avianca', code: 'AV 640', dep: '05:35', arr: '07:10', note: 'Madrugada: llegás a Antigua antes del almuerzo, pero salís de casa a las 02:30.' },
    { id: 'av-mid', date: '2026-12-08', air: 'Avianca', code: 'AV 628', dep: '10:00', arr: '11:35', note: 'Recomendado: llegás a Antigua ~13:30 con la tarde libre.', rec: true },
    { id: 'av-pm', date: '2026-12-08', air: 'Avianca', code: 'AV 654', dep: '16:15', arr: '17:50', note: 'Llegás a Antigua de noche; el primer día se pierde.' },
    { id: 'cm-pm', date: '2026-12-08', air: 'Copa', code: 'CM 391', dep: '19:55', arr: '21:40', note: 'Última opción del día.' },
  ],
  back: [
    { id: 'cm-am', date: '2026-12-13', air: 'Copa', code: 'CM 392', dep: '06:24', arr: '08:05', note: 'Diario. Salís de Antigua a las 03:30 (Uber 60-75 min a esa hora).', rec: true },
    { id: 'av-am', date: '2026-12-13', air: 'Avianca', code: 'AV 653', dep: '07:00', arr: '08:44', note: 'Algunos días; FlightsFrom no lo muestra en domingo.' },
    { id: 'av-pm', date: '2026-12-13', air: 'Avianca', code: 'AV 651', dep: '21:45', arr: '23:20', note: 'Lun, mar, jue y sáb según FlightsFrom: probablemente no vuela el domingo. Si aparece, el día 6 queda completo.' },
  ],
  price: 'Ida y vuelta en diciembre: Copa publica desde USD 335 (temporada alta). Estimado USD 300–350 con maleta de mano.',
  book: [
    { name: 'Google Flights · 8–13 dic', url: 'https://www.google.com/travel/flights?q=Flights%20to%20GUA%20from%20SJO%20on%202026-12-08%20through%202026-12-13%20one%20adult%20nonstop' },
    { name: 'Kayak Costa Rica · 8–13 dic', url: 'https://www.kayak.co.cr/flights/SJO-GUA/2026-12-08/2026-12-13?sort=price_a&fs=stops=0' },
    { name: 'Skyscanner · 8–13 dic', url: 'https://www.skyscanner.co.cr/transporte/vuelos/sjo/gua/261208/261213/?adultsv2=1&preferdirects=true' },
    { name: 'Avianca (compra directa)', url: 'https://www.avianca.com/es/' },
    { name: 'Copa · SJO → GUA', url: 'https://www.copaair.com/en/flights-from-san-jose-cr-to-guatemala-city' },
  ],
};


// Fotos propias (assets/). pos = object-position para recortes.
const PHOTOS = {
  'fuego-noche': { cap: 'El Fuego en la hora azul, desde el campamento del Acatenango', pos: '50% 60%' },
  'fuego-dia': { cap: 'Explosión del Fuego por la mañana, vista desde el Acatenango', pos: '50% 55%' },
  'fuego-explosion': { cap: 'Columna de ceniza sobre la cresta', pos: '50% 45%' },
  'sendero-bosque': { cap: 'Bosque nuboso en la subida al Acatenango', pos: '50% 60%' },
  'arco-noche': { cap: 'Arco de Santa Catalina reflejado en la 5a Avenida Norte', pos: '50% 45%' },
  'terraza-volcanes': { cap: 'Terraza en Antigua con el Fuego y el Acatenango al fondo', pos: '50% 55%' },
  'catedral-ruinas': { cap: 'Ruinas de la Catedral de San José', pos: '50% 40%' },
  'fachada-agua': { cap: 'Barroco antigüeño con el Volcán de Agua entre las nubes', pos: '40% 60%' },
  'lago-cayuco': { cap: 'Cayuco en el lago Atitlán', pos: '50% 60%' },
  'lancha': { cap: 'Lancha en un muelle del lago', pos: '50% 50%' },
  'rostro-maya': { cap: 'Amanecer sobre el lago desde Rostro Maya', pos: '50% 50%' },
  'desayuno': { cap: 'Desayuno chapín con rosa de Jamaica', pos: '50% 55%' },
};
const IMG = (k) => 'assets/' + k + '.jpg';

const G = (q) => 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q);
const BK = (q, inD, outD) => `https://www.booking.com/searchresults.es.html?ss=${encodeURIComponent(q)}&checkin=${inD}&checkout=${outD}&group_adults=1&no_rooms=1&group_children=0`;
const AB = (q, inD, outD) => `https://www.airbnb.com/s/${encodeURIComponent(q)}/homes?checkin=${inD}&checkout=${outD}&adults=1`;

// cat → grupo de filtro
const CAT_TAGS = {
  'Café': ['Comida'], Comida: ['Comida'], Mercado: ['Comida', 'Compras'], Chocolate: ['Comida', 'Cultura'],
  Iglesia: ['Cultura', 'Foto'], Ruina: ['Cultura', 'Foto'], Museo: ['Cultura'], Plaza: ['Cultura', 'Foto'], Mirador: ['Foto', 'Naturaleza'],
  Compras: ['Compras'], Textiles: ['Compras', 'Cultura'], Rooftop: ['Noche', 'Foto'], Bar: ['Noche'], Pueblo: ['Cultura', 'Foto'],
  Volcán: ['Naturaleza', 'Foto'], Caminata: ['Naturaleza'], Lago: ['Naturaleza', 'Foto'], Hotel: [], Traslado: [], Spa: [],
};
const ZONES = { Antigua: 'var(--ocre)', Lago: 'var(--anil)', Volcán: 'var(--almagre)', Ruta: 'var(--muted)' };

// id, name, cat, zone, addr, lat, lng, price(Gratis/$/$$/$$$), dur(min), cost(USD), desc, hours, tip, book
// Coordenadas aproximadas al punto de interés.
const PLACES = [
  // ── Antigua ──
  { id: 'arco', photo: 'arco-noche', name: 'Arco de Santa Catalina', cat: 'Plaza', zone: 'Antigua', addr: '5a Avenida Norte', lat: 14.5592, lng: -90.7347, price: 'Gratis', dur: 30, cost: 0, desc: 'El arco amarillo de 1694 con el Volcán de Agua detrás: la postal de Antigua. Unía el convento con su huerta para que las monjas cruzaran sin pisar la calle.', hours: 'Siempre abierto', tip: 'Antes de las 07:30 la calle está vacía y el volcán sin nubes.' },
  { id: 'parque', photo: 'fachada-agua', name: 'Parque Central', cat: 'Plaza', zone: 'Antigua', addr: 'Entre 4a y 5a Calle', lat: 14.5570, lng: -90.7344, price: 'Gratis', dur: 30, cost: 0, desc: 'La plaza mayor con la Fuente de las Sirenas, el Palacio de los Capitanes y la Catedral. En diciembre se llena de luces y del árbol navideño.', hours: 'Siempre abierto', tip: 'Las bancas bajo los árboles son el mejor lugar para ver pasar el pueblo.' },
  { id: 'catedral', photo: 'catedral-ruinas', name: 'Catedral de San José y ruinas', cat: 'Ruina', zone: 'Antigua', addr: '5a Calle Oriente, Parque Central', lat: 14.5566, lng: -90.7338, price: '$', dur: 40, cost: 1.5, desc: 'Fachada blanca sobre el parque y, detrás, las ruinas de la catedral original destruida por los terremotos de 1773, con cúpulas abiertas al cielo.', hours: '09:00–17:00', tip: 'La entrada a las ruinas es por la 5a Calle Oriente, cuesta ~Q10.' },
  { id: 'merced', name: 'Iglesia de La Merced', cat: 'Iglesia', zone: 'Antigua', addr: '1a Calle Poniente y 6a Av Norte', lat: 14.5615, lng: -90.7350, price: 'Gratis', dur: 30, cost: 0, desc: 'El barroco amarillo y blanco más fotografiado de la ciudad, con la fuente de Pescados dentro del claustro. Afuera venden los mejores antojitos de la tarde.', hours: '07:00–19:00', tip: 'A la caída del sol la fachada se pone naranja; prueba los rellenitos en los puestos de enfrente.' },
  { id: 'cruz', name: 'Cerro de la Cruz', cat: 'Mirador', zone: 'Antigua', addr: 'Al norte de la 1a Av Norte', lat: 14.5660, lng: -90.7300, price: 'Gratis', dur: 75, cost: 0, desc: 'Escaleras de 15 min hasta la cruz que mira la cuadrícula colonial con el Volcán de Agua al fondo.', hours: '06:00–17:00', tip: 'Subí con la policía turística de las 10:00 o acompañado; hay patrulla en las mañanas.' },
  { id: 'capuchinas', name: 'Convento de Capuchinas', cat: 'Ruina', zone: 'Antigua', addr: '2a Av Norte y 2a Calle Oriente', lat: 14.5600, lng: -90.7318, price: '$', dur: 50, cost: 5, desc: 'El convento mejor conservado: una torre circular de celdas, claustros con fuentes y la vista desde la azotea.', hours: '09:00–17:00', tip: 'Entrada ~Q40. Subí a la azotea: se ven Agua, Fuego y Acatenango.' },
  { id: 'santodomingo', name: 'Casa Santo Domingo', cat: 'Museo', zone: 'Antigua', addr: '3a Calle Oriente #28', lat: 14.5598, lng: -90.7290, price: '$', dur: 75, cost: 7, desc: 'Antiguo monasterio dominico convertido en hotel-museo: criptas, piezas de plata colonial, arte contemporáneo y jardines con guacamayas.', hours: '09:00–18:00', tip: 'La entrada a los museos (~Q50) incluye varios edificios; el bar del claustro vale la pena de noche.' },
  { id: 'tanque', name: 'Tanque La Unión', cat: 'Plaza', zone: 'Antigua', addr: '2a Av Sur y 4a Calle Oriente', lat: 14.5557, lng: -90.7302, price: 'Gratis', dur: 20, cost: 0, desc: 'Lavaderos públicos coloniales bajo una alameda de palmeras, frente a la fachada de Santa Clara.', hours: 'Siempre abierto', tip: 'Los domingos hay mercado de artesanías alrededor.' },
  { id: 'sanfrancisco', name: 'San Francisco el Grande', cat: 'Iglesia', zone: 'Antigua', addr: '1a Av Sur y 7a Calle Oriente', lat: 14.5532, lng: -90.7310, price: 'Gratis', dur: 35, cost: 0, desc: 'Templo con la tumba del Santo Hermano Pedro y ruinas del convento franciscano.', hours: '08:00–17:00', tip: 'Las ruinas del convento detrás cobran ~Q10 y casi siempre están vacías.' },
  { id: 'mercado', name: 'Mercado municipal y de artesanías', cat: 'Mercado', zone: 'Antigua', addr: 'Calzada de Santa Lucía', lat: 14.5577, lng: -90.7402, price: '$', dur: 75, cost: 15, desc: 'Frutas, flores, comedores y, al lado, el mercado de artesanías con textiles, jade y cerámica. Regatear es normal.', hours: '07:00–18:00', tip: 'Comprá textiles con calma y compara: la diferencia de precio entre puestos es enorme.' },
  { id: 'nimpot', name: 'Nim Po’t', cat: 'Textiles', zone: 'Antigua', addr: '5a Av Norte #29', lat: 14.5604, lng: -90.7350, price: '$$', dur: 45, cost: 20, desc: 'Bodega enorme de huipiles, cortes y máscaras de todo el país, ordenados por pueblo. La mejor clase de textiles sin guía.', hours: '09:00–21:00', tip: 'Fijate en la etiqueta del pueblo de origen: cada diseño es de un municipio.' },
  { id: 'choco', name: 'ChocoMuseo · taller', cat: 'Chocolate', zone: 'Antigua', addr: '4a Calle Oriente', lat: 14.5573, lng: -90.7322, price: '$$', dur: 120, cost: 30, desc: 'Del grano de cacao a tu propia tableta en dos horas, con la historia maya del chocolate.', hours: '10:00–18:30', tip: 'El taller corto es suficiente; reserva el día antes.', book: 'https://www.google.com/search?q=ChocoMuseo+Antigua+Guatemala+workshop' },
  { id: 'condesa', photo: 'desayuno', name: 'Café Condesa', cat: 'Café', zone: 'Antigua', addr: '5a Av Norte, Parque Central', lat: 14.5571, lng: -90.7348, price: '$', dur: 50, cost: 8, desc: 'Desayuno en el patio de una casona sobre el parque. Café de Antigua y pan dulce de la casa.', hours: '07:00–19:00', tip: 'El desayuno chapín (huevos, frijoles, plátano, crema) es la entrada perfecta al país.' },
  { id: 'fernandos', name: 'Fernando’s Kaffee', cat: 'Café', zone: 'Antigua', addr: '7a Av Norte #43', lat: 14.5618, lng: -90.7362, price: '$', dur: 40, cost: 5, desc: 'Tostaduría con patio: café de fincas de Antigua y chocolate hecho ahí mismo.', hours: '07:00–19:00', tip: 'Llevate una libra para la casa; viaja bien en la maleta de mano.' },
  { id: 'tipico', name: 'Rincón Típico', cat: 'Comida', zone: 'Antigua', addr: '3a Av Sur #3', lat: 14.5547, lng: -90.7322, price: '$', dur: 50, cost: 6, desc: 'Carne y pollo a la brasa con papas, guacamol y tortillas hechas a mano. Comida chapina sin adornos.', hours: '11:00–21:00', tip: 'Solo efectivo, en quetzales.' },
  { id: 'cafesky', photo: 'terraza-volcanes', name: 'Café Sky · terraza', cat: 'Rooftop', zone: 'Antigua', addr: '1a Av Sur #15', lat: 14.5547, lng: -90.7313, price: '$$', dur: 75, cost: 15, desc: 'Terraza alta con los tres volcanes de frente. Al atardecer, si hay suerte, el Fuego escupe lava.', hours: '08:00–22:00', tip: 'Llegá 30 min antes de la puesta de sol para agarrar la mesa del borde.' },
  { id: 'tartines', name: 'Cena · La Fonda de la Calle Real', cat: 'Comida', zone: 'Antigua', addr: '5a Av Norte #5', lat: 14.5577, lng: -90.7347, price: '$$', dur: 80, cost: 18, desc: 'Clásico de cocina guatemalteca a media cuadra del parque: pepián, jocón y kak’ik en una casona colonial.', hours: '12:00–22:00', tip: 'Pedí el pepián: es el plato nacional.' },
  { id: 'cuevita', name: 'La Cuevita de los Urquizú', cat: 'Comida', zone: 'Antigua', addr: '2a Calle Oriente #9D', lat: 14.5596, lng: -90.7330, price: '$', dur: 60, cost: 10, desc: 'Ollas de barro con los guisos del día: escogés con el dedo y te sirven. La forma más fácil de probar todo.', hours: '09:00–21:00', tip: 'Llegá antes de las 13:00 o se acaban los mejores.' },
  { id: 'spa', name: 'Masaje post-volcán', cat: 'Spa', zone: 'Antigua', addr: 'Centro', lat: 14.5585, lng: -90.7330, price: '$$', dur: 75, cost: 30, desc: 'Las piernas lo van a pedir después de 1 600 m de desnivel. Hay decenas de spas con masaje de 60 min a precio local.', hours: '10:00–20:00', tip: 'Reservá por WhatsApp la mañana del sábado desde el volcán.' },
  { id: 'ciudadvieja', name: 'Feria de Concepción · Ciudad Vieja', cat: 'Pueblo', zone: 'Antigua', addr: 'Ciudad Vieja, Sacatepéquez', lat: 14.5230, lng: -90.7700, price: 'Gratis', dur: 120, cost: 5, desc: '8 de diciembre: fiesta patronal de la Inmaculada en la primera capital del reino, a 15 min. Procesión, juegos pirotécnicos y comida de feria.', hours: 'Todo el día', tip: 'Tuk-tuk o Uber ~Q40. El programa 2026 se publica cerca de la fecha.' },
  { id: 'hotelant', name: 'Hospedaje en Antigua', cat: 'Hotel', zone: 'Antigua', addr: 'Centro histórico', lat: 14.5580, lng: -90.7335, price: '$$', dur: 30, cost: 0, desc: 'Base en el centro: todo queda a menos de 12 cuadras a pie.', hours: '', tip: 'Pedí guardar la maleta los días del lago y del volcán.' },
  // ── Lago Atitlán ──
  { id: 'sanjuan', name: 'San Juan La Laguna', cat: 'Pueblo', zone: 'Lago', addr: 'San Juan La Laguna, Sololá', lat: 14.6935, lng: -91.2860, price: 'Gratis', dur: 120, cost: 0, desc: 'Pueblo tz’utujil de calles con murales, paraguas de colores y cooperativas de mujeres que tiñen hilo con plantas.', hours: 'Todo el día', tip: 'La calle que sube del muelle es la de los murales y las sombrillas.' },
  { id: 'cooperativa', name: 'Cooperativa textil · tinte natural', cat: 'Textiles', zone: 'Lago', addr: 'Calle principal, San Juan', lat: 14.6928, lng: -91.2852, price: '$', dur: 60, cost: 8, desc: 'Demostración del hilado, tinte con añil, achiote y cáscara de coco, y telar de cintura. Lo que compras va directo a la tejedora.', hours: '08:00–17:00', tip: 'La demostración es gratis o de pocos quetzales; compra algo pequeño para agradecer.' },
  { id: 'kaqasiiwaan', name: 'Mirador Kaqasiiwaan', cat: 'Mirador', zone: 'Lago', addr: 'Sobre San Juan La Laguna', lat: 14.6965, lng: -91.2815, price: '$', dur: 75, cost: 4, desc: 'Escaleras y pasarelas de madera hasta un mirador sobre el lago con los volcanes San Pedro, Tolimán y Atitlán enfrente.', hours: '06:00–17:00', tip: '~Q30. Subí a las 15:30 para tener luz dorada sobre el lago.' },
  { id: 'muellesj', name: 'Atardecer en el muelle', cat: 'Lago', zone: 'Lago', addr: 'Muelle de San Juan', lat: 14.6942, lng: -91.2872, price: 'Gratis', dur: 45, cost: 0, desc: 'El sol se esconde detrás del Cerro Rostro Maya y el lago cambiá de color. Sin hacer nada más.', hours: '', tip: 'Una cerveza Gallo en el muelle y listo.' },
  { id: 'cenalago', name: 'Cena junto al lago', cat: 'Comida', zone: 'Lago', addr: 'San Juan / San Pedro', lat: 14.6930, lng: -91.2800, price: '$', dur: 70, cost: 12, desc: 'Pescado de lago o pepián en los comedores entre San Juan y San Pedro (5 min en tuk-tuk).', hours: '', tip: 'En San Pedro hay más vida nocturna si te quedan ganas.' },
  { id: 'hotellago', name: 'Hospedaje en el lago', cat: 'Hotel', zone: 'Lago', addr: 'San Juan La Laguna', lat: 14.6920, lng: -91.2870, price: '$$', dur: 30, cost: 0, desc: 'Una noche frente al agua para ver el amanecer sobre los volcanes.', hours: '', tip: 'Pedí habitación con vista al lago: la diferencia de precio suele ser pequeña.' },
  { id: 'rostro', photo: 'rostro-maya', name: 'Amanecer en Rostro Maya (opcional)', cat: 'Caminata', zone: 'Lago', addr: 'Cerro Rostro Maya / Indian Nose', lat: 14.7035, lng: -91.2945, price: '$', dur: 180, cost: 15, desc: 'Caminata de 45 min en la oscuridad hasta la cima que ve todo el lago al amanecer. La mejor foto de Atitlán.', hours: 'Salida 04:15', tip: 'Con guía local desde San Juan (~Q120–150 con transporte). Si preferís dormir, el amanecer desde el muelle también es enorme.' },
  { id: 'desayunolago', name: 'Desayuno con vista', cat: 'Café', zone: 'Lago', addr: 'San Juan La Laguna', lat: 14.6938, lng: -91.2858, price: '$', dur: 60, cost: 8, desc: 'Café de los cafetales de San Juan, que se cultiva en las faldas del volcán San Pedro.', hours: '', tip: 'La cooperativa de café ofrece tour corto de la planta a la taza.' },
  { id: 'kayak', photo: 'lago-cayuco', name: 'Kayak en el lago', cat: 'Lago', zone: 'Lago', addr: 'Muelle de San Juan / San Pedro', lat: 14.6905, lng: -91.2780, price: '$', dur: 60, cost: 8, desc: 'El lago está como espejo antes de las 11:00, cuando entra el viento Xocomil.', hours: '07:00–11:00', tip: 'Q50–75 la hora. Remá temprano; después del mediodía hay oleaje.' },
  { id: 'lanchapana', photo: 'lancha', name: 'Lancha San Juan → Panajachel', cat: 'Traslado', zone: 'Lago', addr: 'Muelle de San Juan', lat: 14.6942, lng: -91.2872, price: '$', dur: 35, cost: 4, desc: 'Lancha pública cruzando el lago (~Q25–35). Salen cuando se llenan, cada 20–30 min.', hours: '06:30–17:00', tip: 'Sentate atrás si no querés mojarte.' },
  { id: 'pana', name: 'Calle Santander · Panajachel', cat: 'Compras', zone: 'Lago', addr: 'Panajachel', lat: 14.7405, lng: -91.1585, price: '$', dur: 45, cost: 5, desc: 'La calle comercial de Pana, del muelle a la parada de shuttles: textiles, comedores y helados.', hours: '', tip: 'Almuerza aquí antes del shuttle.' },
  // ── Volcán ──
  { id: 'soledad', name: 'La Soledad · inicio del sendero', cat: 'Caminata', zone: 'Volcán', addr: 'Aldea La Soledad, Acatenango', lat: 14.4995, lng: -90.8540, price: '$', dur: 20, cost: 7, desc: 'Punto de partida a ~2 400 m. Aquí se paga la entrada al parque (Q50) y se alquilan bastones.', hours: '', tip: 'Comprá agua extra aquí: el campamento no tiene.' },
  { id: 'subida', photo: 'sendero-bosque', name: 'Subida al campamento', cat: 'Caminata', zone: 'Volcán', addr: 'Sendero Acatenango', lat: 14.5010, lng: -90.8660, price: 'Gratis', dur: 330, cost: 0, desc: 'Cuatro zonas: cultivos, bosque nuboso, bosque alto y la ladera frente al Fuego. Unos 1 100 m de desnivel en 5–6 h con paradas.', hours: '', tip: 'Andá a tu ritmo: los guías esperan. Llevá snacks dulces y salados.' },
  { id: 'campamento', photo: 'fuego-noche', name: 'Campamento frente al Fuego', cat: 'Volcán', zone: 'Volcán', addr: 'Acatenango ~3 600 m', lat: 14.4985, lng: -90.8735, price: 'Gratis', dur: 840, cost: 0, desc: 'El Fuego erupciona cada 10–20 min a menos de 2 km. De noche se ve la lava rodar por la ladera.', hours: '', tip: 'Abrigate antes de que se ponga el sol: la temperatura cae de golpe.' },
  { id: 'cima', photo: 'fuego-explosion', name: 'Cima del Acatenango · amanecer', cat: 'Volcán', zone: 'Volcán', addr: 'Cumbre 3 976 m', lat: 14.5009, lng: -90.8764, price: 'Gratis', dur: 90, cost: 0, desc: 'Subida de 1–1,5 h en la oscuridad para ver salir el sol detrás del Volcán de Agua, con el Fuego a tus pies y la sombra del Acatenango sobre las nubes.', hours: 'Salida 04:00', tip: 'Es la parte más dura: arena volcánica suelta y viento. Guantes, gorro y frontal.' },
  { id: 'desayunocamp', photo: 'fuego-dia', name: 'Desayuno y Fuego de día', cat: 'Volcán', zone: 'Volcán', addr: 'Campamento Acatenango', lat: 14.4985, lng: -90.8735, price: 'Gratis', dur: 75, cost: 0, desc: 'Café caliente en el campamento mientras el Fuego sigue explotando con la luz de la mañana.', hours: '', tip: 'Empacá el sleeping bag antes de desayunar para salir a tiempo.' },
  { id: 'bajada', name: 'Bajada a La Soledad', cat: 'Caminata', zone: 'Volcán', addr: 'Sendero Acatenango', lat: 14.5010, lng: -90.8600, price: 'Gratis', dur: 180, cost: 0, desc: 'Bajada rápida (2,5–3 h) por el mismo sendero, con las rodillas como protagonistas.', hours: '', tip: 'Los bastones salvan las rodillas en la bajada.' },
  // ── Traslados ──
  { id: 'gua', name: 'Aeropuerto La Aurora (GUA)', cat: 'Traslado', zone: 'Ruta', addr: 'Zona 13, Ciudad de Guatemala', lat: 14.5833, lng: -90.5275, price: '$$', dur: 30, cost: 0, desc: 'Migración y aduana. El Uber se pide en el nivel 2 del parqueo, no en la acera.', hours: '', tip: 'Sacá quetzales en el cajero dentro de la terminal (5B o BI).' },
  { id: 'uberin', name: 'Uber aeropuerto → Antigua', cat: 'Traslado', zone: 'Ruta', addr: 'CA-1 / RN-10', lat: 14.5833, lng: -90.5275, price: '$$', dur: 85, cost: 42, desc: '~45 km, 60–90 min según tráfico. UberX ~Q320; sube con lluvia o en hora pico.', hours: '', tip: 'Alternativa: shuttle compartido ~$12–15.' },
  { id: 'shuttlesj', name: 'Shuttle Antigua → San Juan La Laguna', cat: 'Traslado', zone: 'Ruta', addr: 'Recogida en el hotel', lat: 14.5580, lng: -90.7335, price: '$', dur: 210, cost: 22, desc: 'Shuttle compartido directo al lado oeste del lago (~3–3,5 h con la parada técnica).', hours: 'Salida ~08:00', tip: 'Llevá una chaqueta: el altiplano de Sololá es frío por la mañana.', book: 'https://turisteando.wetravel.com/trips/shuttle-from-antigua-guatemala-to-san-juan-la-laguna-turisteando-8726964966' },
  { id: 'shuttleant', name: 'Shuttle Panajachel → Antigua', cat: 'Traslado', zone: 'Ruta', addr: 'Calle Santander, Panajachel', lat: 14.7405, lng: -91.1585, price: '$', dur: 180, cost: 15, desc: 'Shuttle compartido de vuelta a Antigua (~2,5–3 h).', hours: 'Salidas ~11:00 y 14:00', tip: 'Confirmá la hora la noche anterior por WhatsApp.', book: 'https://turisteando.wetravel.com/trips/shuttle-from-panajachel-to-antigua-guatemala-turisteando-2023217442' },
  { id: 'tourbus', name: 'Transporte del tour a La Soledad', cat: 'Traslado', zone: 'Ruta', addr: 'Recogida en Antigua', lat: 14.5580, lng: -90.7335, price: 'Gratis', dur: 60, cost: 0, desc: 'El operador recoge en su oficina o en tu hotel (~1 h a La Soledad).', hours: '', tip: 'Desayuná fuerte antes.' },
  { id: 'tourback', name: 'Regreso del tour a Antigua', cat: 'Traslado', zone: 'Ruta', addr: 'La Soledad → Antigua', lat: 14.4995, lng: -90.8540, price: 'Gratis', dur: 60, cost: 0, desc: 'Llegada a Antigua ~13:00–14:00.', hours: '', tip: '' },
  { id: 'uberout', name: 'Uber Antigua → aeropuerto', cat: 'Traslado', zone: 'Ruta', addr: 'Antigua → GUA', lat: 14.5580, lng: -90.7335, price: '$$', dur: 70, cost: 42, desc: 'De madrugada no hay tráfico: 60–70 min.', hours: '', tip: 'Pedilo 10 min antes; a las 03:30 hay pocos conductores. Plan B: pedir al hotel un taxi de confianza la noche anterior.' },
];
const BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]));

// Días. acts: [placeId, 'HH:MM']. where: zona del día (para el sol y el mapa). night: dónde se duerme.
const DAYS = [
  { date: '2026-12-08', title: 'Llegada · Antigua colonial', photo: 'arco-noche', where: 'Antigua', night: 'Antigua', kind: 'LLEGADA',
    acts: [['gua', '11:35'], ['uberin', '12:10'], ['hotelant', '13:35'], ['cuevita', '14:10'], ['arco', '15:20'], ['merced', '16:00'], ['cafesky', '16:55'], ['parque', '18:20'], ['ciudadvieja', '19:00']],
    note: 'AV 628 aterriza 11:35. El 8 de diciembre es la fiesta de la Inmaculada Concepción: procesiones y feria en Ciudad Vieja, a 15 min.',
    why: 'Llegás con hambre: guisos de barro en La Cuevita, el Arco y La Merced a pie, y la terraza de Café Sky justo para el atardecer sobre los tres volcanes.' },
  { date: '2026-12-09', title: 'Hacia el lago · San Juan La Laguna', photo: 'lago-cayuco', where: 'Lago', night: 'Lago', kind: 'LAGO',
    acts: [['condesa', '06:50'], ['shuttlesj', '08:00'], ['hotellago', '11:40'], ['sanjuan', '12:20'], ['cooperativa', '14:20'], ['kaqasiiwaan', '15:30'], ['muellesj', '17:05'], ['cenalago', '18:15']],
    note: 'Dejá la maleta grande en el hotel de Antigua y viaja solo con la mochila del volcán.',
    why: 'Shuttle directo al lado tranquilo del lago, sin lanchas con maleta. Murales y tintes naturales al mediodía y el mirador cuando la luz se vuelve dorada.' },
  { date: '2026-12-10', title: 'Mañana en el lago · vuelta a Antigua', photo: 'lancha', where: 'Lago', night: 'Antigua', kind: 'LAGO → ANTIGUA',
    acts: [['desayunolago', '07:15'], ['kayak', '08:30'], ['lanchapana', '10:00'], ['pana', '10:45'], ['shuttleant', '11:45'], ['hotelant', '15:00'], ['nimpot', '15:45'], ['tartines', '18:30']],
    note: 'Opcional para madrugadores: amanecer en Rostro Maya (salida 04:15). Mañana es el volcán: cena temprano y duerme.',
    why: 'Kayak con el lago como espejo antes del viento, lancha cruzando a Pana y en la tarde Nim Po’t para entender los textiles antes de comprar. Recogé el equipo alquilado.' },
  { date: '2026-12-11', title: 'Acatenango · noche frente al Fuego', photo: 'fuego-noche', where: 'Volcán', night: 'Volcán', kind: 'VOLCÁN',
    acts: [['fernandos', '07:00'], ['tourbus', '08:00'], ['soledad', '09:00'], ['subida', '09:20'], ['campamento', '14:50']],
    note: 'Revisá la alerta del Fuego en CONRED / INSIVUMEH el día antes. Con alerta naranja o roja se cierra la ruta.',
    why: 'Salís con energía tras dos días suaves y a 1 500 m de altura. Llegás al campamento con tiempo de ver el atardecer y la lava de noche.' },
  { date: '2026-12-12', title: 'Cima al amanecer · bajada y descanso', photo: 'fuego-dia', where: 'Volcán', night: 'Antigua', kind: 'CIMA',
    acts: [['cima', '04:00'], ['desayunocamp', '06:30'], ['bajada', '08:00'], ['tourback', '12:00'], ['hotelant', '13:00'], ['tipico', '13:40'], ['spa', '15:00'], ['parque', '17:00'], ['santodomingo', '18:00']],
    note: 'La cima del Acatenango (3 976 m) va incluida en el tour. Dormí temprano si el vuelo de regreso es de madrugada.',
    why: 'La recompensa del viaje a las 06:10 y de vuelta a Antigua para almorzar. Masaje, plaza navideña y la noche tranquila en Casa Santo Domingo.' },
  { date: '2026-12-13', title: 'Salida · Antigua → SJO', photo: 'fachada-agua', where: 'Antigua', night: '—', kind: 'SALIDA',
    acts: [['uberout', '03:30'], ['gua', '04:40']],
    actsEvening: [['arco', '07:00'], ['condesa', '07:40'], ['tanque', '09:00'], ['mercado', '09:30'], ['capuchinas', '11:15'], ['cruz', '12:30'], ['tipico', '14:00'], ['fernandos', '15:15'], ['uberout', '17:30'], ['gua', '18:45']],
    note: 'Con CM 392 (06:24) salís del hotel a las 03:30. Si conseguís un vuelo de la tarde/noche, en Resumen cambiá el regreso y el día se llena solo.',
    why: 'El día depende del vuelo de regreso. Con vuelo de noche: el Arco vacío a primera hora, mercado, Capuchinas y el Cerro de la Cruz para la última vista.' },
];

// Hospedaje por noche (links con las fechas ya puestas).
const STAYS = [
  { night: '2026-12-08', out: '2026-12-09', zone: 'Antigua', label: 'Mar 8 · Antigua',
    picks: [
      { name: 'Ojala Antigua', kind: 'Boutique económico · desayuno', price: 'Menos de $100', url: BK('Ojala Antigua Guatemala', '2026-12-08', '2026-12-09') },
      { name: 'Hotel La Catedral', kind: 'Casona colonial boutique', price: '~$100', url: BK('Hotel La Catedral Antigua Guatemala', '2026-12-08', '2026-12-09') },
    ] },
  { night: '2026-12-09', out: '2026-12-10', zone: 'Lago', label: 'Mié 9 · San Juan La Laguna',
    picks: [
      { name: 'Hotel Casa Ki’iil', kind: 'Boutique en San Juan', price: '~$95', url: BK('Casa Kiiil San Juan La Laguna', '2026-12-09', '2026-12-10') },
      { name: 'Hotel Mercy', kind: 'Sencillo, junto al muelle', price: '~$46', url: BK('Hotel Mercy San Juan La Laguna', '2026-12-09', '2026-12-10') },
      { name: 'Lush Atitlán (San Marcos)', kind: 'Boutique con comida incluida', price: '$80–140', url: BK('Lush Atitlan San Marcos La Laguna', '2026-12-09', '2026-12-10') },
    ] },
  { night: '2026-12-10', out: '2026-12-11', zone: 'Antigua', label: 'Jue 10 · Antigua',
    picks: [{ name: 'Mismo hospedaje del día 8', kind: 'Guarda la maleta ahí', price: '', url: BK('Antigua Guatemala', '2026-12-10', '2026-12-11') }] },
  { night: '2026-12-11', out: '2026-12-12', zone: 'Volcán', label: 'Vie 11 · Acatenango', picks: [{ name: 'Incluido en el tour', kind: 'Cabaña o tienda en el campamento', price: '', url: '' }], included: true },
  { night: '2026-12-12', out: '2026-12-13', zone: 'Antigua', label: 'Sáb 12 · Antigua',
    picks: [{ name: 'Boutique para cerrar', kind: 'Una noche especial después del volcán', price: '$100–150', url: BK('Antigua Guatemala boutique', '2026-12-12', '2026-12-13') }] },
];
const STAY_SEARCH = [
  { name: 'Airbnb Antigua · noche del 8 dic (cambiá fechas para 10 y 12)', url: AB('Antigua-Guatemala--Guatemala', '2026-12-08', '2026-12-09') },
  { name: 'Booking Antigua · todas las noches', url: BK('Antigua Guatemala', '2026-12-08', '2026-12-13') },
  { name: 'Airbnb San Juan La Laguna · 9–10 dic', url: AB('San-Juan-La-Laguna--Guatemala', '2026-12-09', '2026-12-10') },
];

// Acatenango: operadores con precio de referencia (buscadores, mayo–nov 2026). La cima del Acatenango va incluida.
const VOLCANO = {
  facts: [['Cima', '3 976 m'], ['Desnivel', '~1 600 m'], ['Subida', '5–6 h'], ['Noche', '0 a −5 °C'], ['Entrada', 'Q50'], ['Fuego', '5–9 explosiones/h']],
  ops: [
    { name: 'Adrenalina Tours', price: '$95', note: 'Precio de entrada al rango; grupos grandes.', url: 'https://www.wetravel.com/trips/acatenango-hike-overnight-adrenalina-tours-45542262' },
    { name: 'Wicho & Charlie’s', price: '$100–130', note: 'Guías locales; mira las fechas de diciembre en su perfil.', url: 'https://www.wetravel.com/trips/acatenango-volcano-hike-2-day-tour-june-july-wicho-charlie-s-6979444993' },
    { name: 'OX Expeditions', price: '~$159', note: 'De los más reseñados; cabañas y comida buena.', url: 'https://www.google.com/search?q=OX+Expeditions+Acatenango+overnight' },
    { name: 'Old Town Outfitters', price: '$159–280', note: 'Premium, grupos chicos; caro para viajar solo.', url: 'https://www.google.com/search?q=Old+Town+Outfitters+Acatenango' },
    { name: 'Comparar en GetYourGuide', price: '', note: 'Reseñas recientes y cancelación gratis.', url: 'https://www.getyourguide.com/s/?q=Acatenango&date_from=2026-12-11&date_to=2026-12-12' },
  ],
  ask: ['Tamaño máximo del grupo', '¿Cabaña o tienda? ¿Sleeping bag para −5 °C?', 'Qué pasa si cierran por alerta: ¿reembolso o cambio de fecha?', '¿Incluye la entrada Q50 y las comidas (3)?', 'Hora de recogida y lugar'],
  gear: [
    ['Mochila 30–40 L', 'Llevar'], ['Chaqueta de plumas o sintética', 'Alquilar'], ['Rompevientos impermeable', 'Llevar'], ['Gorro, guantes y buff', 'Alquilar'],
    ['Pantalón térmico + pantalón de montaña', 'Llevar'], ['2 pares de medias gruesas', 'Llevar'], ['Zapatos de montaña con suela', 'Llevar'],
    ['Linterna frontal + baterías', 'Alquilar'], ['Bastones', 'Alquilar'], ['3–4 L de agua', 'Comprar'], ['Snacks dulces y salados', 'Comprar'],
    ['Bloqueador y gafas de sol', 'Llevar'], ['Papel higiénico y bolsa de basura', 'Llevar'], ['Efectivo para la cresta, propinas y porteador (Q)', 'Llevar'],
    ['Power bank', 'Llevar'], ['Ibuprofeno y curitas', 'Llevar'],
  ],
  status: [
    { name: 'CONRED · boletines', url: 'https://conred.gob.gt/' },
    { name: 'INSIVUMEH · vulcanología', url: 'https://insivumeh.gob.gt/' },
    { name: 'Pronóstico en la montaña', url: 'https://www.mountain-forecast.com/peaks/Acatenango/forecasts/3976' },
  ],
};

// Presupuesto. Dos escenarios en USD; total en colones con TRIP.fx.crc.
const BUDGET = [
  { k: 'Vuelo SJO ⇄ GUA', lean: 300, comfy: 350, note: 'Diciembre es temporada alta: ~$300–350.' },
  { k: 'Aeropuerto ⇄ Antigua', lean: 30, comfy: 84, note: 'Shuttle compartido ($15 c/u) o Uber ($42 c/u).' },
  { k: 'Lago: shuttle, lancha y shuttle', lean: 41, comfy: 41, note: '$22 + Q30 + $15.' },
  { k: 'Acatenango con cima', lean: 112, comfy: 175, note: 'Tour $95–159 + entrada Q50 + alquiler de equipo.' },
  { k: 'Antigua · 3 noches', lean: 165, comfy: 330, note: 'Airbnb ~$55 o boutique ~$110.' },
  { k: 'Lago · 1 noche', lean: 46, comfy: 95, note: 'Hotel Mercy o Casa Ki’iil.' },
  { k: 'Comida · 6 días', lean: 125, comfy: 180, note: '$20–30 diarios; comedores vs. restaurantes.' },
  { k: 'Entradas, propinas, SIM', lean: 35, comfy: 55, note: 'Capuchinas, Santo Domingo, Kaqasiiwaan, guía, eSIM.' },
  { k: 'Imprevistos', lean: 20, comfy: 40, note: '' },
];

const FILTERS = [
  ['EXPERIENCIA', ['Comida', 'Cultura', 'Compras', 'Foto', 'Naturaleza', 'Noche']],
  ['ZONA', ['Antigua', 'Lago', 'Volcán']],
  ['PRECIO', ['Gratis', '$', '$$']],
];

// Spots de foto: placeId, kind, tags, stars, when (clave de sol o hora fija), where (para calcular el sol)
const PHOTO_FILTERS = ['Amanecer', 'Atardecer', 'Hora azul', 'Noche', 'Arquitectura', 'Volcanes', 'Lago', 'Calle'];
const PHOTO_SPOTS = [
  { id: 'cima', kind: 'AMANECER · SOMBRA DEL VOLCÁN', tags: ['Amanecer', 'Volcanes'], stars: 5, when: 'sunrise', where: 'Volcán', day: 4, tip: 'Girá la espalda al sol: la sombra triangular del Acatenango se proyecta sobre las nubes.' },
  { id: 'campamento', kind: 'NOCHE · LAVA DEL FUEGO', tags: ['Noche', 'Volcanes'], stars: 5, when: 'blue', where: 'Volcán', day: 3, tip: 'Trípode o piedra, 10–20 s a ISO 800–1600. Esperá la explosión con el obturador abierto.' },
  { id: 'arco', kind: 'AMANECER · ARCO Y VOLCÁN', tags: ['Amanecer', 'Arquitectura', 'Calle', 'Volcanes'], stars: 5, when: 'sunrise', where: 'Antigua', day: 5, tip: 'Desde la 5a Av Norte a la altura de La Merced: el arco enmarca el Agua con la calle vacía.' },
  { id: 'cafesky', kind: 'ATARDECER · TRES VOLCANES', tags: ['Atardecer', 'Volcanes'], stars: 4, when: 'sunset', where: 'Antigua', day: 0, tip: 'El Fuego queda al suroeste: a la hora azul se ve el resplandor rojo.' },
  { id: 'merced', kind: 'HORA DORADA · BARROCO', tags: ['Atardecer', 'Arquitectura'], stars: 4, when: 'golden', where: 'Antigua', day: 0, tip: 'La fachada mira al oeste: se enciende de naranja.' },
  { id: 'kaqasiiwaan', kind: 'HORA DORADA · LAGO', tags: ['Atardecer', 'Lago', 'Volcanes'], stars: 5, when: 'golden', where: 'Lago', day: 1, tip: 'Los volcanes San Pedro y Tolimán quedan de frente con la luz lateral.' },
  { id: 'muellesj', kind: 'ATARDECER · AGUA', tags: ['Atardecer', 'Lago'], stars: 4, when: 'sunset', where: 'Lago', day: 1, tip: 'Las lanchas recortadas a contraluz.' },
  { id: 'rostro', kind: 'AMANECER · TODO EL LAGO', tags: ['Amanecer', 'Lago', 'Volcanes'], stars: 5, when: 'sunrise', where: 'Lago', day: 2, tip: 'El sol sale entre Tolimán y Atitlán con niebla sobre el agua.' },
  { id: 'kayak', kind: 'MAÑANA · LAGO ESPEJO', tags: ['Lago'], stars: 4, when: '08:00', where: 'Lago', day: 2, tip: 'Antes del viento: reflejo perfecto de los volcanes.' },
  { id: 'sanjuan', kind: 'CALLE · MURALES Y SOMBRILLAS', tags: ['Calle'], stars: 4, when: '12:30', where: 'Lago', day: 1, tip: 'A mediodía la luz entra por las sombrillas y colorea el piso.' },
  { id: 'cruz', kind: 'MAÑANA · CUADRÍCULA COLONIAL', tags: ['Arquitectura', 'Volcanes'], stars: 4, when: '08:30', where: 'Antigua', day: 5, tip: 'Temprano el Agua está despejado; después del mediodía se nubla.' },
  { id: 'capuchinas', kind: 'ARQUITECTURA · CLAUSTRO', tags: ['Arquitectura'], stars: 3, when: '11:00', where: 'Antigua', day: 5, tip: 'La torre de celdas circular desde el patio interior.' },
  { id: 'parque', kind: 'HORA AZUL · LUCES DE NAVIDAD', tags: ['Hora azul', 'Noche', 'Arquitectura'], stars: 4, when: 'blue', where: 'Antigua', day: 4, tip: 'Catedral iluminada y el árbol navideño del parque.' },
  { id: 'santodomingo', kind: 'NOCHE · VELAS', tags: ['Noche', 'Arquitectura'], stars: 3, when: '19:00', where: 'Antigua', day: 4, tip: 'Los claustros con velas encendidas.' },
];
// Lat/lng para el cálculo de sol por zona.
const SUN_AT = { Antigua: [14.557, -90.734], Lago: [14.694, -91.286], Volcán: [14.501, -90.876] };

const TOP = [
  { id: 'cima', why: 'Ver salir el sol a 3 976 m con el Fuego erupcionando debajo y la sombra del volcán sobre las nubes. La razón del viaje.' },
  { id: 'campamento', why: 'Una noche entera mirando lava. Nadie lo cree hasta que lo ve.' },
  { id: 'rostro', why: 'El lago entero al amanecer, con los volcanes saliendo de la niebla. Opcional, pero es la mejor foto de Atitlán.' },
  { id: 'arco', why: 'La postal de Guatemala: de noche, después de la lluvia, se refleja en los charcos de la 5a Avenida.' },
  { id: 'catedral', why: 'Cúpulas abiertas al cielo desde los terremotos de 1773, a media cuadra del Parque Central.' },
];

const PRACTICAL = [
  ['Documentos', 'Pasaporte vigente (idealmente 6 meses). Costarricenses no necesitan visa: 90 días de turismo.'],
  ['Dinero', 'Quetzales en efectivo para mercados, tuk-tuks, lanchas y propinas. Cajeros 5B o BI. Tarjeta en hoteles y restaurantes.'],
  ['Teléfono', 'eSIM o SIM Tigo / Claro en el aeropuerto. Uber y WhatsApp funcionan bien en Antigua.'],
  ['Clima', 'Época seca: días de 22–25 °C, noches de 10–12 °C en Antigua y bajo cero en la cima. Capas siempre.'],
  ['Altura', 'Antigua 1 530 m, lago 1 560 m, cima 3 976 m. Los días 1–3 sirven de aclimatación.'],
  ['Seguridad', 'Antigua es tranquila de día y de noche en el centro. El Cerro de la Cruz, con la patrulla turística. En el lago, lanchas antes de las 17:00.'],
  ['Emergencias', 'CONRED 119 · PROATUR (asistencia al turista) 1500.'],
];
