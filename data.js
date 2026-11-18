// Datos del viaje. Todo lo editable vive aquí.
// Precios en USD salvo que diga Q (quetzal) o ₡ (colón). Investigación del 9 nov 2026: los marcados "por confirmar"
// salen de buscadores y guías, no de una cotización con fecha exacta.

const TRIP = {
  start: '2026-12-01', end: '2026-12-06', people: 1,
  fx: { crc: 450, gtq: 7.7, note: 'Dólar bajo ₡450 (Monex, 6 nov 2026). Quetzal ~Q7,7 por dólar.' },
  budget: { min: 300000, max: 400000 },
  airport: { id: 'gua', name: 'Aeropuerto La Aurora (GUA)', lat: 14.5833, lng: -90.5275 },
};

// Vuelos directos SJO ⇄ GUA (≈1 h 35). Volaris dejó la ruta el 12 abr 2026: solo Avianca y Copa.
// Horarios de rastreadores (FlightConnections, Airpaz, FlightsFrom): confirmar en la aerolínea para el día exacto.
const FLIGHTS = {
  out: [
    { id: 'av-am', date: '2026-12-01', air: 'Avianca', code: 'AV 640', dep: '05:35', arr: '07:10', note: 'Madrugada: llegás a Antigua antes del almuerzo, pero salís de casa a las 02:30.' },
    { id: 'av-mid', date: '2026-12-01', air: 'Avianca', code: 'AV 628', dep: '10:00', arr: '11:30', note: 'Comprado. Sale de la Terminal M de SJO; tarifa light: artículo personal + equipaje de mano de 10 kg.', rec: true, booked: true },
    { id: 'av-pm', date: '2026-12-01', air: 'Avianca', code: 'AV 654', dep: '16:15', arr: '17:50', note: 'Llegás a Antigua de noche; el primer día se pierde.' },
    { id: 'cm-pm', date: '2026-12-01', air: 'Copa', code: 'CM 391', dep: '19:55', arr: '21:40', note: 'Última opción del día.' },
  ],
  back: [
    { id: 'av-629', date: '2026-12-06', air: 'Avianca', code: 'AV 629', dep: '12:25', arr: '13:55', note: 'Comprado. Llega a la Terminal M de SJO; tarifa light.', booked: true },
    { id: 'cm-am', date: '2026-12-06', air: 'Copa', code: 'CM 392', dep: '06:24', arr: '08:05', note: 'Diario. Salís de Antigua a las 03:30 (Uber 60-75 min a esa hora).', rec: true },
    { id: 'av-am', date: '2026-12-06', air: 'Avianca', code: 'AV 653', dep: '07:00', arr: '08:44', note: 'Algunos días; FlightsFrom no lo muestra en domingo.' },
    { id: 'av-pm', date: '2026-12-06', air: 'Avianca', code: 'AV 651', dep: '21:45', arr: '23:20', note: 'Lun, mar, jue y sáb según FlightsFrom: probablemente no vuela el domingo. Si aparece, el día 6 queda completo.' },
  ],
  price: 'Ida y vuelta comprados con Avianca, tarifa light (artículo personal + mano de 10 kg).',
  book: [
    { name: 'Google Flights · 1–6 dic', url: 'https://www.google.com/travel/flights?q=Flights%20to%20GUA%20from%20SJO%20on%202026-12-01%20through%202026-12-06%20one%20adult%20nonstop' },
    { name: 'Kayak Costa Rica · 1–6 dic', url: 'https://www.kayak.co.cr/flights/SJO-GUA/2026-12-01/2026-12-06?sort=price_a&fs=stops=0' },
    { name: 'Skyscanner · 1–6 dic', url: 'https://www.skyscanner.co.cr/transporte/vuelos/sjo/gua/261201/261206/?adultsv2=1&preferdirects=true' },
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
  'avion-volcanes': { cap: 'Despegando de La Aurora: Agua, Fuego y Acatenango desde la ventana', pos: '50% 65%' },
  // Wikimedia Commons (licencia libre; se cargan desde Commons con el crédito en Resumen).
  'wm-merced': { cap: 'Iglesia de La Merced', pos: '50% 50%', wm: 'La Merced Church Antigua Guatemala 2.jpg', by: 'Rambling Traveler', lic: 'CC BY-SA 3.0' },
  'wm-cruz': { cap: 'Cerro de la Cruz', pos: '50% 50%', wm: 'Cerro de la Cruz, Antigua Guatemala 01.jpg', by: 'Simon Burchell', lic: 'CC BY-SA 4.0' },
  'wm-capuchinas': { cap: 'Convento de Capuchinas', pos: '50% 50%', wm: 'Convento Capuchinas, Antigua, Guatemala (55046690732).jpg', by: 'lamblukas', lic: 'CC BY 4.0' },
  'wm-santodomingo': { cap: 'Jardines de Casa Santo Domingo', pos: '50% 50%', wm: 'Garden View - Hotel Casa de Santo Domingo - Antigua Guatemala - Sacatepequez - Guatemala (15919423265).jpg', by: 'Adam Jones', lic: 'CC BY-SA 2.0' },
  'wm-tanque': { cap: 'Tanque La Unión', pos: '50% 50%', wm: 'Tanque de la Union (3) (39469981945).jpg', by: 'Hans Birger Nilsen', lic: 'CC BY-SA 2.0' },
  'wm-sanfrancisco': { cap: 'Iglesia de San Francisco el Grande', pos: '50% 50%', wm: 'San Francisco Church (Antigua Guatemala).jpg', by: 'Walter Rodriguez', lic: 'CC BY 2.0' },
  'wm-mercado': { cap: 'Mercado de Antigua', pos: '50% 50%', wm: 'Antigua Guatemala Mercado Feb 2020 - 04.jpg', by: 'Bruno Rijsman', lic: 'CC BY-SA 2.0' },
  'wm-huipil': { cap: 'Huipil tejido con algodón café', pos: '50% 50%', wm: 'Huipil with brown cotton.jpg', by: 'Chiome-gold', lic: 'CC0' },
  'wm-sanjuan': { cap: 'Calle principal de San Juan La Laguna', pos: '50% 50%', wm: 'Main street, San Juan la Laguna Guatemala.jpg', by: 'young shanahan', lic: 'CC BY 2.0' },
  'wm-kaqasiiwaan': { cap: 'El lago desde el Mirador Kaqasiiwaan', pos: '50% 50%', wm: 'Lake views from Mirador Kaqasiiwaan.jpg', by: 'Bex Walton', lic: 'CC BY 4.0' },
  'wm-telar': { cap: 'Tejedora tz’utujil en telar de cintura', pos: '50% 50%', wm: 'Tzutujil.weaving.jpg', by: 'Chelalinda', lic: 'CC BY-SA 4.0' },
  'wm-desayunosj': { cap: 'Desayuno típico en San Juan La Laguna', pos: '50% 50%', wm: 'Typical Guatemalan breakfast - San Juan la Laguna, Guatemala.jpg', by: 'young shanahan', lic: 'CC BY 2.0' },
  'wm-sanjuanaire': { cap: 'San Juan La Laguna desde el aire', pos: '50% 50%', wm: 'San Juan la laguna.jpg', by: 'Toby Argüelles', lic: 'CC BY-SA 2.0' },
  'wm-pana': { cap: 'Calle Santander, Panajachel', pos: '50% 50%', wm: 'Panajachel calle santandar guat.JPG', by: 'chensiyuan', lic: 'CC BY-SA 4.0' },
  'wm-ciudadvieja': { cap: 'Ciudad Vieja, Sacatepéquez', pos: '50% 50%', wm: 'Ciudad Vieja, Sacatepéquez 01.jpg', by: 'Simon Burchell', lic: 'CC BY-SA 4.0' },
};
const COMMONS = (f) => 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(f);
const IMG = (k) => PHOTOS[k].wm ? COMMONS(PHOTOS[k].wm) + '?width=1280' : 'assets/' + k + '.jpg';
Object.values(PHOTOS).forEach((p) => { if (p.wm) p.src = 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(p.wm.replace(/ /g, '_')); });

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
  { id: 'merced', photo: 'wm-merced', name: 'Iglesia de La Merced', cat: 'Iglesia', zone: 'Antigua', addr: '1a Calle Poniente y 6a Av Norte', lat: 14.5615, lng: -90.7350, price: 'Gratis', dur: 30, cost: 0, desc: 'El barroco amarillo y blanco más fotografiado de la ciudad, con la fuente de Pescados dentro del claustro. Afuera venden los mejores antojitos de la tarde.', hours: '07:00–19:00', tip: 'A la caída del sol la fachada se pone naranja; prueba los rellenitos en los puestos de enfrente.' },
  { id: 'cruz', photo: 'wm-cruz', name: 'Cerro de la Cruz', cat: 'Mirador', zone: 'Antigua', addr: 'Al norte de la 1a Av Norte', lat: 14.5660, lng: -90.7300, price: 'Gratis', dur: 75, cost: 0, desc: 'Escaleras de 15 min hasta la cruz que mira la cuadrícula colonial con el Volcán de Agua al fondo.', hours: '06:00–17:00', tip: 'Subí con la policía turística de las 10:00 o acompañado; hay patrulla en las mañanas.' },
  { id: 'capuchinas', photo: 'wm-capuchinas', name: 'Convento de Capuchinas', cat: 'Ruina', zone: 'Antigua', addr: '2a Av Norte y 2a Calle Oriente', lat: 14.5600, lng: -90.7318, price: '$', dur: 50, cost: 5, desc: 'El convento mejor conservado: una torre circular de celdas, claustros con fuentes y la vista desde la azotea.', hours: '09:00–17:00', tip: 'Entrada ~Q40. Subí a la azotea: se ven Agua, Fuego y Acatenango.' },
  { id: 'santodomingo', photo: 'wm-santodomingo', name: 'Casa Santo Domingo', cat: 'Museo', zone: 'Antigua', addr: '3a Calle Oriente #28', lat: 14.5598, lng: -90.7290, price: '$', dur: 75, cost: 7, desc: 'Antiguo monasterio dominico convertido en hotel-museo: criptas, piezas de plata colonial, arte contemporáneo y jardines con guacamayas.', hours: '09:00–18:00', tip: 'La entrada a los museos (~Q50) incluye varios edificios; el bar del claustro vale la pena de noche.' },
  { id: 'tanque', photo: 'wm-tanque', name: 'Tanque La Unión', cat: 'Plaza', zone: 'Antigua', addr: '2a Av Sur y 4a Calle Oriente', lat: 14.5557, lng: -90.7302, price: 'Gratis', dur: 20, cost: 0, desc: 'Lavaderos públicos coloniales bajo una alameda de palmeras, frente a la fachada de Santa Clara.', hours: 'Siempre abierto', tip: 'Los domingos hay mercado de artesanías alrededor.' },
  { id: 'sanfrancisco', photo: 'wm-sanfrancisco', name: 'San Francisco el Grande', cat: 'Iglesia', zone: 'Antigua', addr: '1a Av Sur y 7a Calle Oriente', lat: 14.5532, lng: -90.7310, price: 'Gratis', dur: 35, cost: 0, desc: 'Templo con la tumba del Santo Hermano Pedro y ruinas del convento franciscano.', hours: '08:00–17:00', tip: 'Las ruinas del convento detrás cobran ~Q10 y casi siempre están vacías.' },
  { id: 'mercado', photo: 'wm-mercado', name: 'Mercado municipal y de artesanías', cat: 'Mercado', zone: 'Antigua', addr: 'Calzada de Santa Lucía', lat: 14.5577, lng: -90.7402, price: '$', dur: 75, cost: 15, desc: 'Frutas, flores, comedores y, al lado, el mercado de artesanías con textiles, jade y cerámica. Regatear es normal.', hours: '07:00–18:00', tip: 'Comprá textiles con calma y compara: la diferencia de precio entre puestos es enorme.' },
  { id: 'nimpot', photo: 'wm-huipil', name: 'Nim Po’t', cat: 'Textiles', zone: 'Antigua', addr: '5a Av Norte #29', lat: 14.5604, lng: -90.7350, price: '$$', dur: 45, cost: 20, desc: 'Bodega enorme de huipiles, cortes y máscaras de todo el país, ordenados por pueblo. La mejor clase de textiles sin guía.', hours: '09:00–21:00', tip: 'Fijate en la etiqueta del pueblo de origen: cada diseño es de un municipio.' },
  { id: 'choco', name: 'ChocoMuseo · taller', cat: 'Chocolate', zone: 'Antigua', addr: '4a Calle Oriente', lat: 14.5573, lng: -90.7322, price: '$$', dur: 120, cost: 30, desc: 'Del grano de cacao a tu propia tableta en dos horas, con la historia maya del chocolate.', hours: '10:00–18:30', tip: 'El taller corto es suficiente; reserva el día antes.', book: 'https://www.google.com/search?q=ChocoMuseo+Antigua+Guatemala+workshop' },
  { id: 'condesa', photo: 'desayuno', name: 'Café Condesa', cat: 'Café', zone: 'Antigua', addr: '5a Av Norte, Parque Central', lat: 14.5571, lng: -90.7348, price: '$', dur: 50, cost: 8, desc: 'Desayuno en el patio de una casona sobre el parque. Café de Antigua y pan dulce de la casa.', hours: '07:00–19:00', tip: 'El desayuno chapín (huevos, frijoles, plátano, crema) es la entrada perfecta al país.' },
  { id: 'fernandos', name: 'Fernando’s Kaffee', cat: 'Café', zone: 'Antigua', addr: '7a Av Norte #43', lat: 14.5618, lng: -90.7362, price: '$', dur: 40, cost: 5, desc: 'Tostaduría con patio: café de fincas de Antigua y chocolate hecho ahí mismo.', hours: '07:00–19:00', tip: 'Llevate una libra para la casa; viaja bien en la maleta de mano.' },
  { id: 'tipico', name: 'Rincón Típico', cat: 'Comida', zone: 'Antigua', addr: '3a Av Sur #3', lat: 14.5547, lng: -90.7322, price: '$', dur: 50, cost: 6, desc: 'Carne y pollo a la brasa con papas, guacamol y tortillas hechas a mano. Comida chapina sin adornos.', hours: '11:00–21:00', tip: 'Solo efectivo, en quetzales.' },
  { id: 'cafesky', photo: 'terraza-volcanes', name: 'Café Sky · terraza', cat: 'Rooftop', zone: 'Antigua', addr: '1a Av Sur #15', lat: 14.5547, lng: -90.7313, price: '$$', dur: 75, cost: 15, desc: 'Terraza alta con los tres volcanes de frente. Al atardecer, si hay suerte, el Fuego escupe lava.', hours: '08:00–22:00', tip: 'Llegá 30 min antes de la puesta de sol para agarrar la mesa del borde.' },
  { id: 'tartines', name: 'Cena · La Fonda de la Calle Real', cat: 'Comida', zone: 'Antigua', addr: '5a Av Norte #5', lat: 14.5577, lng: -90.7347, price: '$$', dur: 80, cost: 18, desc: 'Clásico de cocina guatemalteca a media cuadra del parque: pepián, jocón y kak’ik en una casona colonial.', hours: '12:00–22:00', tip: 'Pedí el pepián: es el plato nacional.' },
  { id: 'cuevita', name: 'La Cuevita de los Urquizú', cat: 'Comida', zone: 'Antigua', addr: '2a Calle Oriente #9D', lat: 14.5596, lng: -90.7330, price: '$', dur: 60, cost: 10, desc: 'Ollas de barro con los guisos del día: escogés con el dedo y te sirven. La forma más fácil de probar todo.', hours: '09:00–21:00', tip: 'Llegá antes de las 13:00 o se acaban los mejores.' },
  { id: 'spa', name: 'Masaje post-volcán', cat: 'Spa', zone: 'Antigua', addr: 'Centro', lat: 14.5585, lng: -90.7330, price: '$$', dur: 75, cost: 30, desc: 'Las piernas lo van a pedir después de 1 600 m de desnivel. Hay decenas de spas con masaje de 60 min a precio local.', hours: '10:00–20:00', tip: 'Reservá por WhatsApp la mañana del sábado desde el volcán.' },
  { id: 'ciudadvieja', photo: 'wm-ciudadvieja', name: 'Ciudad Vieja', cat: 'Pueblo', zone: 'Antigua', addr: 'Ciudad Vieja, Sacatepéquez', lat: 14.5230, lng: -90.7700, price: 'Gratis', dur: 90, cost: 5, desc: 'La primera capital del reino, a 15 min de Antigua al pie del Volcán de Agua, arrasada por un deslave en 1541. Iglesia colonial y plaza de pueblo sin turistas.', hours: 'Todo el día', tip: 'Tuk-tuk o Uber ~Q40. Buen plan para una tarde libre.' },
  { id: 'casablanca', name: 'Airbnb Casablanca', cat: 'Hotel', zone: 'Antigua', addr: '5a Calle Poniente y Alameda de Santa Lucía', lat: 14.5566, lng: -90.7386, price: '$$', dur: 30, cost: 0, desc: 'Tu base en Antigua del martes 1 al viernes 4: a 4 cuadras del Parque Central y a una del mercado. Las noches del 1, 2 y 3 están pagadas, así que tus cosas se quedan ahí mientras dormís en el volcán.', hours: 'Check-in mar 1 · check-out vie 4', tip: 'Confirmá con el anfitrión la hora de check-in (llegás ~13:30) y si podés dejar la maleta después del check-out del viernes.' },
  { id: 'hotelant', name: 'Hospedaje en Antigua (sáb 5)', cat: 'Hotel', zone: 'Antigua', addr: 'Centro histórico', lat: 14.5580, lng: -90.7335, price: '$$', dur: 30, cost: 0, desc: 'Base en el centro: todo queda a menos de 12 cuadras a pie.', hours: '', tip: 'Pedí guardar la maleta los días del lago y del volcán.' },
  // ── Lago Atitlán ──
  { id: 'sanjuan', photo: 'wm-sanjuan', name: 'San Juan La Laguna', cat: 'Pueblo', zone: 'Lago', addr: 'San Juan La Laguna, Sololá', lat: 14.6935, lng: -91.2860, price: 'Gratis', dur: 120, cost: 0, desc: 'Pueblo tz’utujil de calles con murales, paraguas de colores y cooperativas de mujeres que tiñen hilo con plantas.', hours: 'Todo el día', tip: 'La calle que sube del muelle es la de los murales y las sombrillas.' },
  { id: 'cooperativa', photo: 'wm-telar', name: 'Cooperativa textil · tinte natural', cat: 'Textiles', zone: 'Lago', addr: 'Calle principal, San Juan', lat: 14.6928, lng: -91.2852, price: '$', dur: 60, cost: 8, desc: 'Demostración del hilado, tinte con añil, achiote y cáscara de coco, y telar de cintura. Lo que compras va directo a la tejedora.', hours: '08:00–17:00', tip: 'La demostración es gratis o de pocos quetzales; compra algo pequeño para agradecer.' },
  { id: 'kaqasiiwaan', photo: 'wm-kaqasiiwaan', name: 'Mirador Kaqasiiwaan', cat: 'Mirador', zone: 'Lago', addr: 'Sobre San Juan La Laguna', lat: 14.6965, lng: -91.2815, price: '$', dur: 75, cost: 4, desc: 'Escaleras y pasarelas de madera hasta un mirador sobre el lago con los volcanes San Pedro, Tolimán y Atitlán enfrente.', hours: '06:00–17:00', tip: '~Q30. Subí a las 15:30 para tener luz dorada sobre el lago.' },
  { id: 'muellesj', photo: 'wm-sanjuanaire', name: 'Atardecer en el muelle', cat: 'Lago', zone: 'Lago', addr: 'Muelle de San Juan', lat: 14.6942, lng: -91.2872, price: 'Gratis', dur: 45, cost: 0, desc: 'El sol se esconde detrás del Cerro Rostro Maya y el lago cambiá de color. Sin hacer nada más.', hours: '', tip: 'Una cerveza Gallo en el muelle y listo.' },
  { id: 'cenalago', name: 'Cena junto al lago', cat: 'Comida', zone: 'Lago', addr: 'San Juan / San Pedro', lat: 14.6930, lng: -91.2800, price: '$', dur: 70, cost: 12, desc: 'Pescado de lago o pepián en los comedores entre San Juan y San Pedro (5 min en tuk-tuk).', hours: '', tip: 'En San Pedro hay más vida nocturna si te quedan ganas.' },
  { id: 'hotellago', name: 'Airbnb en San Pablo La Laguna', cat: 'Hotel', zone: 'Lago', addr: 'San Pablo La Laguna, Sololá', lat: 14.7115, lng: -91.2735, price: '$$', dur: 30, cost: 0, desc: 'Tu base en el lago del viernes 4 al domingo 6 (pagado, ₡41 000). San Pablo queda entre San Juan y San Marcos: 5–10 min en tuk-tuk a cada uno.', hours: 'Check-in vie 4 · check-out dom 6', tip: 'Pedile al anfitrión que te coordine un tuk-tuk de confianza para el domingo a las 04:30 (el shuttle sale 05:00 de San Pedro), o preguntale al shuttle si recoge en San Pablo.' },
  { id: 'rostro', photo: 'rostro-maya', name: 'Amanecer en Rostro Maya (opcional)', cat: 'Caminata', zone: 'Lago', addr: 'Cerro Rostro Maya / Indian Nose', lat: 14.7035, lng: -91.2945, price: '$', dur: 180, cost: 15, desc: 'Caminata de 45 min en la oscuridad hasta la cima que ve todo el lago al amanecer. La mejor foto de Atitlán.', hours: 'Salida 04:15', tip: 'Con guía local desde San Juan o San Pedro (~Q120–150 con transporte). Es opcional: si preferís dormir, el amanecer desde el muelle también es enorme.' },
  { id: 'desayunolago', photo: 'wm-desayunosj', name: 'Desayuno con vista', cat: 'Café', zone: 'Lago', addr: 'San Juan La Laguna', lat: 14.6938, lng: -91.2858, price: '$', dur: 60, cost: 8, desc: 'Café de los cafetales de San Juan, que se cultiva en las faldas del volcán San Pedro.', hours: '', tip: 'La cooperativa de café ofrece tour corto de la planta a la taza.' },
  { id: 'kayak', photo: 'lago-cayuco', name: 'Kayak en el lago', cat: 'Lago', zone: 'Lago', addr: 'Muelle de San Juan / San Pedro', lat: 14.6905, lng: -91.2780, price: '$', dur: 60, cost: 8, desc: 'El lago está como espejo antes de las 11:00, cuando entra el viento Xocomil.', hours: '07:00–11:00', tip: 'Q50–75 la hora. Remá temprano; después del mediodía hay oleaje.' },
  { id: 'lanchapana', photo: 'lancha', name: 'Lancha San Juan → Panajachel', cat: 'Traslado', zone: 'Lago', addr: 'Muelle de San Juan', lat: 14.6942, lng: -91.2872, price: '$', dur: 35, cost: 4, desc: 'Lancha pública cruzando el lago (~Q25–35). Salen cuando se llenan, cada 20–30 min.', hours: '06:30–17:00', tip: 'Sentate atrás si no querés mojarte.' },
  { id: 'pana', photo: 'wm-pana', name: 'Calle Santander · Panajachel', cat: 'Compras', zone: 'Lago', addr: 'Panajachel', lat: 14.7405, lng: -91.1585, price: '$', dur: 45, cost: 5, desc: 'La calle comercial de Pana, del muelle a la parada de shuttles: textiles, comedores y helados.', hours: '', tip: 'Almuerza aquí antes del shuttle.' },
  // ── Volcán ──
  { id: 'soledad', name: 'La Soledad · inicio del sendero', cat: 'Caminata', zone: 'Volcán', addr: 'Aldea La Soledad, Acatenango', lat: 14.4995, lng: -90.8540, price: 'Gratis', dur: 20, cost: 0, desc: 'Inicio de la caminata a ~2 400 m. La entrada al parque va incluida en el tour de Adrenalina.', hours: '~09:00', tip: 'Comprá aquí agua si te falta: llevá 3–4 L, el agua no va incluida y en el campamento no hay.' },
  { id: 'subida', photo: 'sendero-bosque', name: 'Subida al campamento', cat: 'Caminata', zone: 'Volcán', addr: 'Sendero Acatenango', lat: 14.5010, lng: -90.8660, price: 'Gratis', dur: 280, cost: 0, desc: 'Unos 1 200 m de desnivel en ~5 h por cultivos, bosque nuboso y bosque alto, con almuerzo en el camino (incluido).', hours: '09:00–14:00', tip: 'Ve a tu ritmo: los guías esperan. Llevá snacks dulces y salados.' },
  { id: 'campamento', photo: 'fuego-noche', name: 'Campamento frente al Fuego', cat: 'Volcán', zone: 'Volcán', addr: 'Acatenango ~3 600 m', lat: 14.4985, lng: -90.8735, price: 'Gratis', dur: 825, cost: 0, desc: 'Llegada ~14:00 a las cabañas compartidas de Adrenalina (con sleeping bag). Cena viendo erupcionar el Fuego con el atardecer de fondo; de noche la lava rueda por la ladera.', hours: '~14:00', tip: 'Abrigate antes de que se ponga el sol: la temperatura cae de golpe. Este tour no incluye la caminata a la cresta del Fuego.' },
  { id: 'cima', photo: 'fuego-explosion', name: 'Cima del Acatenango · amanecer', cat: 'Volcán', zone: 'Volcán', addr: 'Cumbre 3 976 m', lat: 14.5009, lng: -90.8764, price: 'Gratis', dur: 120, cost: 0, desc: 'Despertador a las 03:45 y salida 04:30 para la cumbre. Llegás ~06:00 para ver salir el sol detrás del Volcán de Agua, con el Fuego a tus pies.', hours: 'Salida 04:30', tip: 'Es la parte más dura: arena volcánica suelta y viento. Guantes, gorro y frontal.' },
  { id: 'desayunocamp', photo: 'fuego-dia', name: 'Desayuno en el campamento', cat: 'Volcán', zone: 'Volcán', addr: 'Campamento Acatenango', lat: 14.4985, lng: -90.8735, price: 'Gratis', dur: 60, cost: 0, desc: 'Bajás de la cima al campamento para el desayuno (incluido) mientras el Fuego sigue explotando con la luz de la mañana.', hours: '~07:00', tip: 'Empacá todo antes de desayunar para salir a tiempo.' },
  { id: 'bajada', name: 'Bajada a La Soledad', cat: 'Caminata', zone: 'Volcán', addr: 'Sendero Acatenango', lat: 14.5010, lng: -90.8600, price: 'Gratis', dur: 180, cost: 0, desc: 'Bajada por el mismo sendero (~3 h), con las rodillas como protagonistas.', hours: '~08:00–11:00', tip: 'Sin bastones, la bajada cansa las rodillas: en La Soledad venden palos de madera por pocos quetzales.' },
  // ── Traslados ──
  { id: 'gua', name: 'Aeropuerto La Aurora (GUA)', cat: 'Traslado', zone: 'Ruta', addr: 'Zona 13, Ciudad de Guatemala', lat: 14.5833, lng: -90.5275, price: '$$', dur: 30, cost: 0, desc: 'Migración y aduana. El Uber se pide en el nivel 2 del parqueo, no en la acera.', hours: '', tip: 'Sacá quetzales en el cajero dentro de la terminal (5B o BI).' },
  { id: 'uberin', name: 'Transporte privado aeropuerto → Antigua', cat: 'Traslado', zone: 'Ruta', addr: 'La Aurora → Airbnb Casablanca', lat: 14.5833, lng: -90.5275, price: '$$', dur: 85, cost: 55, desc: 'Pagado ($55): te esperan a la salida del aeropuerto y te dejan en el Airbnb Casablanca. ~45 km, 60–90 min según tráfico.', hours: '', tip: 'Guardá el número del conductor en WhatsApp y avisale cuando aterrices.' },
  { id: 'shuttlesj', name: 'Shuttle Antigua → San Juan La Laguna', cat: 'Traslado', zone: 'Ruta', addr: 'Recogida en el hotel', lat: 14.5580, lng: -90.7335, price: '$', dur: 210, cost: 22, desc: 'Shuttle compartido directo al lado oeste del lago (~3–3,5 h con la parada técnica).', hours: 'Salida ~08:00', tip: 'Llevá una chaqueta: el altiplano de Sololá es frío por la mañana.', book: 'https://turisteando.wetravel.com/trips/shuttle-from-antigua-guatemala-to-san-juan-la-laguna-turisteando-8726964966' },
  { id: 'lanchasm', name: 'Tuk-tuk San Pablo → San Marcos', cat: 'Traslado', zone: 'Lago', addr: 'San Pablo La Laguna', lat: 14.7115, lng: -91.2735, price: '$', dur: 10, cost: 2, desc: 'Del Airbnb a San Marcos en tuk-tuk (~Q10–15, 5–10 min).', hours: '', tip: 'Acordá el precio antes de subir.' },
  { id: 'tzankujil', name: 'Cerro Tzankujil · nadar y saltar', cat: 'Lago', zone: 'Lago', addr: 'Reserva Natural Cerro Tzankujil, San Marcos La Laguna', lat: 14.7228, lng: -91.2614, price: '$', dur: 120, cost: 3, desc: 'Reserva natural en una península de San Marcos con senderos, rocas para meterse al lago y una plataforma de madera para saltar al agua desde unos 10 m. El agua es fresca y clarísima en la mañana.', hours: '~08:00–17:00', tip: 'Entrada ~Q20 en efectivo (confirmalo en la puerta). Llevá traje de baño, toalla y sandalias; probá primero desde las rocas bajas y saltá con los pies por delante.' },
  { id: 'sanmarcos', name: 'San Marcos La Laguna', cat: 'Pueblo', zone: 'Lago', addr: 'San Marcos La Laguna, Sololá', lat: 14.7240, lng: -91.2600, price: 'Gratis', dur: 30, cost: 0, desc: 'El pueblo más tranquilo del lago: callejones entre árboles, cafés y centros de yoga.', hours: '', tip: 'Buen lugar para un jugo o un café antes de seguir.' },
  { id: 'lanchasp', name: 'Lancha San Marcos → San Pedro → Santiago', cat: 'Traslado', zone: 'Lago', addr: 'Muelle de San Marcos', lat: 14.7215, lng: -91.2590, price: '$', dur: 50, cost: 5, desc: 'Lancha a San Pedro (~Q10) y desde ahí la que cruza a Santiago Atitlán (~Q25), unos 25 min.', hours: '', tip: 'En San Pedro las lanchas a Santiago salen del muelle principal, no del de San Juan.' },
  { id: 'santiago', name: 'Santiago Atitlán', cat: 'Pueblo', zone: 'Lago', addr: 'Santiago Atitlán, Sololá', lat: 14.6386, lng: -91.2290, price: '$', dur: 135, cost: 12, desc: 'El pueblo tz’utujil más grande, entre los volcanes Tolimán y San Pedro: mercado, la iglesia colonial y la casa donde cada año vive Maximón, el santo al que le dejan cigarros y licor.', hours: 'Todo el día', tip: 'Para ver a Maximón pedile a un niño o a un tuk-tuk que te lleve (cambia de casa cada año); dejá una ofrenda de Q10–20. Almorzá cerca del muelle.' },
  { id: 'lanchast', name: 'Lancha Santiago → San Pedro', cat: 'Traslado', zone: 'Lago', addr: 'Muelle de Santiago Atitlán', lat: 14.6420, lng: -91.2300, price: '$', dur: 30, cost: 3, desc: 'Vuelta a San Pedro en lancha pública (~Q25).', hours: 'Últimas ~17:00', tip: 'No te quedés después de las 16:30: las últimas lanchas salen temprano.' },
  { id: 'sanpedro', name: 'San Pedro La Laguna', cat: 'Pueblo', zone: 'Lago', addr: 'San Pedro La Laguna, Sololá', lat: 14.6930, lng: -91.2720, price: 'Gratis', dur: 90, cost: 0, desc: 'El pueblo más movido del lago, al pie del volcán San Pedro: callecitas en subida, murales, cafés, bares y el atardecer desde la orilla.', hours: '', tip: 'De aquí sale el shuttle de las 05:00 al aeropuerto: ubicá esta tarde el punto de salida.' },
  { id: 'shuttlegua', name: 'Shuttle San Pedro → aeropuerto', cat: 'Traslado', zone: 'Ruta', addr: 'San Pedro La Laguna → La Aurora', lat: 14.6930, lng: -91.2720, price: '$$', dur: 270, cost: 45, desc: 'Shuttle compartido de las 05:00 vía Antigua hasta el aeropuerto (~4–4,5 h, ~$45). Llegás ~09:30 para el vuelo de las 12:25.', hours: 'Salida 05:00', tip: 'Reservalo con anticipación y pedí que te recojan en tu hotel. Si te quedás en San Juan, coordiná el tuk-tuk de las 04:40 con el hotel la noche anterior.', book: 'https://livinginguatemala.com/transport/lake-atitlan-to-guatemala-city-airport/' },
  { id: 'shuttleant', name: 'Shuttle Panajachel → Antigua', cat: 'Traslado', zone: 'Ruta', addr: 'Calle Santander, Panajachel', lat: 14.7405, lng: -91.1585, price: '$', dur: 180, cost: 15, desc: 'Shuttle compartido de vuelta a Antigua (~2,5–3 h).', hours: 'Salidas ~11:00 y 14:00', tip: 'Confirmá la hora la noche anterior por WhatsApp.', book: 'https://turisteando.wetravel.com/trips/shuttle-from-panajachel-to-antigua-guatemala-turisteando-2023217442' },
  { id: 'tourbus', name: 'Recogida de Adrenalina Tours', cat: 'Traslado', zone: 'Ruta', addr: 'En tu hospedaje (Airbnb Casablanca)', lat: 14.5566, lng: -90.7386, price: 'Gratis', dur: 120, cost: 0, desc: 'Transporte privado del tour desde tu hospedaje hasta La Soledad (~1 h 30 con la parada). El desayuno de hoy no va incluido.', hours: 'Recogida 07:00', tip: 'WeTravel dice 07:00 y la web de Adrenalina 08:00: confirmalo por WhatsApp el martes.' },
  { id: 'tourback', name: 'Regreso a Antigua con Adrenalina', cat: 'Traslado', zone: 'Ruta', addr: 'La Soledad → Antigua', lat: 14.4995, lng: -90.8540, price: 'Gratis', dur: 90, cost: 0, desc: 'Te dejan en Antigua entre las 12:00 y las 13:00.', hours: '', tip: '' },
  { id: 'uberout', name: 'Uber Antigua → aeropuerto', cat: 'Traslado', zone: 'Ruta', addr: 'Antigua → GUA', lat: 14.5580, lng: -90.7335, price: '$$', dur: 70, cost: 42, desc: 'De madrugada no hay tráfico: 60–70 min.', hours: '', tip: 'Pedilo 10 min antes; a las 03:30 hay pocos conductores. Plan B: pedir al hotel un taxi de confianza la noche anterior.' },
];
const BY_ID = Object.fromEntries(PLACES.map((p) => [p.id, p]));

// Días. acts: [placeId, 'HH:MM']. where: zona del día (para el sol y el mapa). night: dónde se duerme.
const DAYS = [
  { date: '2026-12-01', title: 'Llegada · Antigua colonial', photo: 'arco-noche', where: 'Antigua', night: 'Antigua', kind: 'LLEGADA',
    acts: [['gua', '11:30'], ['uberin', '12:05'], ['casablanca', '13:30'], ['cuevita', '14:00'], ['cruz', '15:10'], ['arco', '16:35'], ['cafesky', '17:10'], ['parque', '18:35'], ['tipico', '19:00']],
    note: 'AV 628 aterriza 11:30 y te recoge el transporte privado. Mañana a las 07:00 te recogen para el volcán: dejá lista esta noche la mochila con la ropa de frío. Tomá mucha agua y evitá el alcohol para aclimatarte.',
    why: 'Llegás con hambre: guisos de barro en La Cuevita, el Cerro de la Cruz (15 min de escaleras) para ver Antigua con el Volcán de Agua, el Arco y la terraza de Café Sky justo para el atardecer sobre los volcanes que vas a subir mañana. Subir al cerro también ayuda a aclimatarse.' },
  { date: '2026-12-02', title: 'Acatenango · noche frente al Fuego', photo: 'fuego-noche', where: 'Volcán', night: 'Volcán', kind: 'VOLCÁN',
    acts: [['tourbus', '07:00'], ['soledad', '09:00'], ['subida', '09:20'], ['campamento', '14:00']],
    note: 'Tour pagado con Adrenalina Tours (WeTravel, $95). Te recogen en el Airbnb a las 07:00: confirmalo por WhatsApp. El desayuno y el agua no van incluidos: comprá el martes algo para desayunar en el Airbnb y llevá 3–4 L. Solo tuviste una tarde para aclimatarte: subí a tu ritmo y avisá al guía si te duele la cabeza. Revisá la alerta del Fuego en CONRED / INSIVUMEH el martes; con alerta naranja o roja se cierra la ruta.',
    why: 'El volcán va primero, con las piernas frescas y antes de cualquier cansancio. Llegás al campamento con tiempo de ver el atardecer y la lava de noche.' },
  { date: '2026-12-03', title: 'Cima al amanecer · bajada y descanso', photo: 'fuego-dia', where: 'Volcán', night: 'Antigua', kind: 'CIMA',
    acts: [['cima', '04:30'], ['desayunocamp', '07:00'], ['bajada', '08:00'], ['tourback', '11:15'], ['casablanca', '13:00'], ['tipico', '13:40'], ['spa', '15:00'], ['merced', '16:30'], ['parque', '17:10'], ['santodomingo', '17:45'], ['tartines', '19:15']],
    note: 'Despertador a las 03:45 y salida a la cima a las 04:30 (incluida en el tour). Dormí temprano: mañana a las 08:00 sale el shuttle al lago.',
    why: 'La recompensa del viaje al amanecer y de vuelta a Antigua para almorzar. Masaje, La Merced con la última luz, el Parque Central, Casa Santo Domingo y cena chapina en La Fonda de la Calle Real.' },
  { date: '2026-12-04', title: 'Hacia el lago · San Juan La Laguna', photo: 'lago-cayuco', where: 'Lago', night: 'Lago', kind: 'LAGO',
    acts: [['condesa', '06:50'], ['shuttlesj', '08:00'], ['hotellago', '11:40'], ['sanjuan', '12:20'], ['cooperativa', '14:20'], ['kaqasiiwaan', '15:30'], ['muellesj', '17:05'], ['cenalago', '18:15']],
    note: 'Check-out del Airbnb Casablanca antes del shuttle de las 08:00. Pedile al shuttle que te deje en San Pablo La Laguna (o bajate en San Juan y tomá un tuk-tuk de 5 min). Llevate todo: el domingo salís del lago directo al aeropuerto.',
    why: 'Después del volcán, un día suave. Shuttle directo a San Juan, murales y tintes naturales al mediodía y el mirador Kaqasiiwaan cuando la luz se vuelve dorada.' },
  { date: '2026-12-05', title: 'Pueblos del lago · nadar y saltar', photo: 'rostro-maya', where: 'Lago', night: 'Lago', kind: 'LAGO',
    acts: [['desayunolago', '07:45'], ['lanchasm', '08:55'], ['tzankujil', '09:10'], ['sanmarcos', '11:15'], ['lanchasp', '11:50'], ['santiago', '12:45'], ['lanchast', '15:10'], ['sanpedro', '15:45'], ['cenalago', '18:00']],
    note: 'Opcional: amanecer en Rostro Maya (la "cabeza maya"), salida ~04:15 con guía (pedí que te recojan en San Pablo) y vuelta ~07:30. Después de cenar en San Pedro, tuk-tuk de vuelta a San Pablo (~15 min, Q25–30 de noche) y a dormir temprano: el shuttle sale a las 05:00.',
    why: 'Al lago te metés en la mañana, cuando el agua está quieta: Cerro Tzankujil en San Marcos, con la plataforma para saltar. Después cruzás a Santiago Atitlán para el mercado y Maximón, y terminás en San Pedro viendo el atardecer cerca de donde sale el shuttle mañana.' },
  { date: '2026-12-06', title: 'Salida · Atitlán → aeropuerto → SJO', photo: 'avion-volcanes', where: 'Lago', night: '—', kind: 'SALIDA', fixed: true,
    acts: [['shuttlegua', '05:00'], ['gua', '09:30']],
    note: 'Tuk-tuk 04:30 de San Pablo a San Pedro y shuttle compartido de las 05:00, vía Antigua (~4–4,5 h). AV 629 sale a las 12:25 y aterriza en SJO a las 13:55: llegás con casi 3 h de margen.',
    why: 'Salir temprano es la única forma segura desde el lago: el shuttle de las 08:30 llegaría muy justo para un vuelo de las 12:25.' },
];

// Hospedaje por noche (links con las fechas ya puestas).
const STAYS = [
  { night: '2026-12-01', out: '2026-12-02', zone: 'Antigua', label: 'Mar 1 · Antigua', booked: true,
    picks: [{ name: 'Airbnb Casablanca', kind: '5a Calle Poniente y Alameda de Santa Lucía · check-in', price: 'Pagado', url: '' }] },
  { night: '2026-12-02', out: '2026-12-03', zone: 'Volcán', label: 'Mié 2 · Acatenango', picks: [{ name: 'Incluido en el tour', kind: 'Cabaña compartida de Adrenalina; tu Airbnb sigue pagado esta noche', price: '', url: '' }], included: true },
  { night: '2026-12-03', out: '2026-12-04', zone: 'Antigua', label: 'Jue 3 · Antigua', booked: true,
    picks: [{ name: 'Airbnb Casablanca', kind: 'Misma reserva · check-out el viernes 4', price: 'Pagado', url: '' }] },
  { night: '2026-12-04', out: '2026-12-06', zone: 'Lago', label: 'Vie 4 y sáb 5 · San Pablo La Laguna', booked: true,
    picks: [{ name: 'Airbnb en San Pablo La Laguna', kind: '2 noches · check-out el domingo 6 de madrugada', price: 'Pagado', url: '' }] },
];
const STAY_SEARCH = [
      ];

// Acatenango: operadores con precio de referencia (buscadores, mayo–nov 2026). La cima del Acatenango va incluida.
const VOLCANO = {
  facts: [['Cima', '3 976 m'], ['Desnivel', '~1 600 m'], ['Subida', '5–6 h'], ['Noche', '0 a −5 °C'], ['Entrada', 'Incluida'], ['Fuego', '5–9 explosiones/h']],
  ops: [
    { name: 'Adrenalina Tours', price: '$95', booked: true, note: 'Reservado para el 2–3 de diciembre por WeTravel.', url: 'https://www.wetravel.com/trips/acatenango-hike-overnight-adrenalina-tours-45542262' },
    { name: 'Wicho & Charlie’s', price: '$100–130', note: 'Guías locales; mira las fechas de diciembre en su perfil.', url: 'https://www.wetravel.com/trips/acatenango-volcano-hike-2-day-tour-june-july-wicho-charlie-s-6979444993' },
    { name: 'OX Expeditions', price: '~$159', note: 'De los más reseñados; cabañas y comida buena.', url: 'https://www.google.com/search?q=OX+Expeditions+Acatenango+overnight' },
    { name: 'Old Town Outfitters', price: '$159–280', note: 'Premium, grupos chicos; caro para viajar solo.', url: 'https://www.google.com/search?q=Old+Town+Outfitters+Acatenango' },
    { name: 'Comparar en GetYourGuide', price: '', note: 'Reseñas recientes y cancelación gratis.', url: 'https://www.getyourguide.com/s/?q=Acatenango&date_from=2026-12-04&date_to=2026-12-05' },
  ],
  ask: ['Hora exacta de recogida (WeTravel dice 07:00, su web 08:00)', 'Si la recogida es en el Airbnb Casablanca', 'Qué pasa si cierran por alerta del Fuego: ¿cambio de fecha o reembolso?', 'Tamaño del grupo'],
  tour: {
    name: 'Adrenalina Tours', price: '$95', via: 'WeTravel',
    included: ['Transporte privado ida y vuelta desde Antigua', 'Guías certificados', 'Almuerzo y cena del día 1', 'Desayuno y snacks del día 2', 'Cabañas compartidas con sleeping bag', 'Entrada al parque', 'Botiquín básico'],
    excluded: ['Desayuno del día 1', 'Agua (llevá 3–4 L)', 'Caminata a la cresta del Fuego', 'Ropa de frío y frontal (llevás la tuya)', 'Propina para el guía'],
  },
  gear: [
    ['Mochila 30–40 L', 'Llevar'], ['Chaqueta de plumas o sintética', 'Llevar'], ['Rompevientos impermeable', 'Llevar'], ['Gorro, guantes y buff', 'Llevar'],
    ['Pantalón térmico + pantalón de montaña', 'Llevar'], ['2 pares de medias gruesas', 'Llevar'], ['Zapatos de montaña con suela', 'Llevar'],
    ['Linterna frontal + baterías', 'Llevar'], ['Desayuno del día 1 y 3–4 L de agua', 'Comprar'], ['Snacks dulces y salados', 'Comprar'],
    ['Bloqueador y gafas de sol', 'Llevar'], ['Papel higiénico y bolsa de basura', 'Llevar'], ['Efectivo en quetzales para propinas', 'Llevar'],
    ['Power bank', 'Llevar'], ['Ibuprofeno y curitas', 'Llevar'],
  ],
  status: [
    { name: 'CONRED · boletines', url: 'https://conred.gob.gt/' },
    { name: 'INSIVUMEH · vulcanología', url: 'https://insivumeh.gob.gt/' },
    { name: 'Pronóstico en la montaña', url: 'https://www.mountain-forecast.com/peaks/Acatenango/forecasts/3976' },
  ],
};

// Lago Atitlán: datos para la pestaña Lago.
const LAKE = {
  facts: [['Base', 'San Pablo'], ['Noches', '2'], ['Altura', '1 560 m'], ['Agua', '~19–21 °C'], ['Lanchas', 'Q10–25'], ['Viento', 'Desde ~11:00']],
  towns: [
    { id: 'hotellago', when: 'Base', why: 'Pueblo pequeño y tranquilo entre San Juan y San Marcos, donde dormís las dos noches.' },
    { id: 'sanjuan', when: 'Vie 4', why: 'Tu primera tarde: murales, cooperativas de tejido y el mirador Kaqasiiwaan.' },
    { id: 'sanmarcos', when: 'Sáb 5', why: 'Cerro Tzankujil para nadar y saltar desde la plataforma.' },
    { id: 'santiago', when: 'Sáb 5', why: 'El pueblo más grande: mercado, iglesia colonial y Maximón.' },
    { id: 'sanpedro', when: 'Sáb 5', why: 'Atardecer, cena y de aquí sale el shuttle del domingo.' },
  ],
  boats: [['Tuk-tuk San Pablo → San Juan', '~Q10', '5–10 min'], ['Tuk-tuk San Pablo → San Marcos', '~Q10–15', '5–10 min'], ['San Marcos → San Pedro', '~Q10', '15 min'], ['San Pedro → Santiago', '~Q25', '25 min'], ['Santiago → San Pedro', '~Q25', '25 min'], ['Tuk-tuk San Pedro → San Pablo', '~Q25–30 de noche', '15 min']],
  tips: [
    'Las lanchas públicas salen cuando se llenan, de ~06:30 a ~17:00. No te quedés lejos después de las 16:30.',
    'El viento Xocomil entra cerca del mediodía y pica el lago: nadá y remá en la mañana.',
    'Pagá las lanchas en efectivo y preguntá el precio antes de subir; al turista a veces le cobran de más.',
    'Llevá traje de baño, toalla de secado rápido, sandalias y bloqueador el sábado.',
    'Para el shuttle de las 05:00 del domingo dejá la mochila lista la noche anterior.',
  ],
};

// Presupuesto. Dos escenarios en USD; total en colones con TRIP.fx.crc.
const BUDGET = [
  { k: 'Vuelo SJO ⇄ GUA', lean: 345, comfy: 345, note: 'Pagado: Avianca AV628 / AV629, tarifa light.' },
  { k: 'Transporte privado aeropuerto → Antigua', lean: 55, comfy: 55, note: 'Pagado.' },
  { k: 'Acatenango con cima', lean: 95, comfy: 95, note: 'Pagado: Adrenalina Tours $95 (incluye la entrada).' },
  { k: 'Airbnb Casablanca · 3 noches', lean: 71, comfy: 71, note: 'Pagado: ₡52 000 − ₡20 000 de descuento = ₡32 000.' },
  { k: 'Shuttles Antigua → lago → aeropuerto', lean: 67, comfy: 67, note: '$22 a San Juan + $45 de San Pedro al aeropuerto.' },
  { k: 'Airbnb San Pablo La Laguna · 2 noches', lean: 91, comfy: 91, note: 'Pagado: ₡41 000.' },
  { k: 'Tuk-tuks, lanchas, Tzankujil y Rostro Maya', lean: 17, comfy: 37, note: 'Tuk-tuks y lanchas ~Q110 + entrada ~Q20; Rostro Maya opcional ~$20.' },
  { k: 'Comida · 6 días', lean: 125, comfy: 180, note: '$20–30 diarios; comedores vs. restaurantes.' },
  { k: 'Entradas, propinas, SIM', lean: 30, comfy: 50, note: 'Santo Domingo, Kaqasiiwaan, Maximón, guía del volcán, eSIM.' },
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
  { id: 'cima', kind: 'AMANECER · SOMBRA DEL VOLCÁN', tags: ['Amanecer', 'Volcanes'], stars: 5, when: 'sunrise', where: 'Volcán', day: 2, tip: 'Girá la espalda al sol: la sombra triangular del Acatenango se proyecta sobre las nubes.' },
  { id: 'campamento', kind: 'NOCHE · LAVA DEL FUEGO', tags: ['Noche', 'Volcanes'], stars: 5, when: 'blue', where: 'Volcán', day: 1, tip: 'Trípode o piedra, 10–20 s a ISO 800–1600. Esperá la explosión con el obturador abierto.' },
  { id: 'arco', kind: 'HORA DORADA · ARCO Y VOLCÁN', tags: ['Atardecer', 'Arquitectura', 'Calle', 'Volcanes'], stars: 5, when: 'golden', where: 'Antigua', day: 0, tip: 'Desde la 5a Av Norte a la altura de La Merced: el arco enmarca el Agua con la calle vacía.' },
  { id: 'cafesky', kind: 'ATARDECER · TRES VOLCANES', tags: ['Atardecer', 'Volcanes'], stars: 4, when: 'sunset', where: 'Antigua', day: 0, tip: 'El Fuego queda al suroeste: a la hora azul se ve el resplandor rojo.' },
  { id: 'merced', kind: 'HORA DORADA · BARROCO', tags: ['Atardecer', 'Arquitectura'], stars: 4, when: 'golden', where: 'Antigua', day: 0, tip: 'La fachada mira al oeste: se enciende de naranja.' },
  { id: 'kaqasiiwaan', kind: 'HORA DORADA · LAGO', tags: ['Atardecer', 'Lago', 'Volcanes'], stars: 5, when: 'golden', where: 'Lago', day: 3, tip: 'Los volcanes San Pedro y Tolimán quedan de frente con la luz lateral.' },
  { id: 'muellesj', kind: 'ATARDECER · AGUA', tags: ['Atardecer', 'Lago'], stars: 4, when: 'sunset', where: 'Lago', day: 3, tip: 'Las lanchas recortadas a contraluz.' },
  { id: 'rostro', kind: 'AMANECER · TODO EL LAGO', tags: ['Amanecer', 'Lago', 'Volcanes'], stars: 5, when: 'sunrise', where: 'Lago', day: 4, tip: 'El sol sale entre Tolimán y Atitlán con niebla sobre el agua.' },
  { id: 'tzankujil', kind: 'MAÑANA · SALTO AL LAGO', tags: ['Lago'], stars: 5, when: '09:30', where: 'Lago', day: 4, tip: 'Que alguien grabe desde las rocas de al lado: el salto con el volcán San Pedro de fondo. Ráfaga en el teléfono.' },
  { id: 'santiago', kind: 'MEDIODÍA · MERCADO Y TEXTILES', tags: ['Calle'], stars: 4, when: '13:00', where: 'Lago', day: 4, tip: 'Pedí permiso antes de fotografiar a las personas; muchas prefieren que no.' },
  { id: 'kayak', kind: 'MAÑANA · LAGO ESPEJO', tags: ['Lago'], stars: 4, when: '08:00', where: 'Lago', day: 4, tip: 'Antes del viento: reflejo perfecto de los volcanes.' },
  { id: 'sanjuan', kind: 'CALLE · MURALES Y SOMBRILLAS', tags: ['Calle'], stars: 4, when: '12:30', where: 'Lago', day: 3, tip: 'A mediodía la luz entra por las sombrillas y colorea el piso.' },
  { id: 'cruz', kind: 'TARDE · CUADRÍCULA COLONIAL', tags: ['Arquitectura', 'Volcanes'], stars: 4, when: '15:30', where: 'Antigua', day: 0, tip: 'Temprano el Agua está despejado; después del mediodía se nubla.' },
  { id: 'capuchinas', kind: 'ARQUITECTURA · CLAUSTRO', tags: ['Arquitectura'], stars: 3, when: '16:00', where: 'Antigua', day: 2, tip: 'La torre de celdas circular desde el patio interior.' },
  { id: 'parque', kind: 'HORA AZUL · CATEDRAL', tags: ['Hora azul', 'Noche', 'Arquitectura'], stars: 4, when: 'blue', where: 'Antigua', day: 2, tip: 'Catedral iluminada y la fuente de las Sirenas.' },
  { id: 'santodomingo', kind: 'NOCHE · VELAS', tags: ['Noche', 'Arquitectura'], stars: 3, when: '19:00', where: 'Antigua', day: 2, tip: 'Los claustros con velas encendidas.' },
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
  ['Altura', 'Antigua 1 530 m, lago 1 560 m, cima 3 976 m. Solo la tarde del día 1 sirve de aclimatación antes del volcán: agua, nada de alcohol y subir despacio (el Cerro de la Cruz ayuda).'],
  ['Seguridad', 'Antigua es tranquila de día y de noche en el centro. El Cerro de la Cruz, con la patrulla turística. En el lago, lanchas antes de las 17:00 y nadá solo en zonas como Tzankujil, nunca de noche ni con viento.'],
  ['Emergencias', 'CONRED 119 · PROATUR (asistencia al turista) 1500.'],
];
