import type { AppLocale } from './app-locale';

export type MessageId =
  | 'card.favoriteToggle'
  | 'card.localTime'
  | 'card.weatherIconAlt'
  | 'card.wind'
  | 'card.humidity'
  | 'dashboard.title'
  | 'dashboard.hint'
  | 'dashboard.searchSection'
  | 'dashboard.cityLabel'
  | 'dashboard.viewToggle'
  | 'dashboard.viewTable'
  | 'dashboard.viewDetail'
  | 'dashboard.loading'
  | 'dashboard.langToggle'
  | 'dashboard.langEn'
  | 'dashboard.langEs'
  | 'detail.section'
  | 'detail.emptyHint'
  | 'favorites.section'
  | 'favorites.title'
  | 'favorites.loadCity'
  | 'favorites.remove'
  | 'favorites.emptyHint'
  | 'table.colCity'
  | 'table.colTempC'
  | 'table.colCondition'
  | 'table.colLocalTime'
  | 'table.emptyHint'
  | 'table.paginationNav'
  | 'table.paginationPrev'
  | 'table.paginationNext'
  | 'table.paginationStatus'
  | 'err.locationNotFound'
  | 'err.apiLoadPrefix'
  | 'err.generic'
  | 'err.invalidSearchQuery'
  | 'err.noCitySuggestions'
  | 'err.offlineBanner'
  | 'err.offlineLiveWeather'
  | 'err.offlineSearch';

type MessageCatalog = Record<MessageId, string>;

/** Runtime catalogs aligned with `src/locale/messages*.xlf` message ids. */
export const MESSAGES: Record<AppLocale, MessageCatalog> = {
  en: {
    'card.favoriteToggle': 'Toggle favorite',
    'card.localTime': 'Local time: {time}',
    'card.weatherIconAlt': 'Weather condition icon',
    'card.wind': 'Wind',
    'card.humidity': 'Humidity',
    'dashboard.title': 'Weather',
    'dashboard.hint': 'Search for a city and pick a suggestion, or press Enter.',
    'dashboard.searchSection': 'City search',
    'dashboard.cityLabel': 'City',
    'dashboard.viewToggle': 'Results layout',
    'dashboard.viewTable': 'Table',
    'dashboard.viewDetail': 'Detail',
    'dashboard.loading': 'Loading weather…',
    'dashboard.langToggle': 'Language',
    'dashboard.langEn': 'English',
    'dashboard.langEs': 'Spanish',
    'detail.section': 'Detailed weather',
    'detail.emptyHint': 'Search for a city to see the forecast.',
    'favorites.section': 'Favorite cities',
    'favorites.title': 'Favorites',
    'favorites.loadCity': 'Load weather for {city}',
    'favorites.remove': 'Remove {city} from favorites',
    'favorites.emptyHint': 'No favorites yet. Open a city in detail view and tap the star.',
    'table.colCity': 'City',
    'table.colTempC': 'Temp (°C)',
    'table.colCondition': 'Condition',
    'table.colLocalTime': 'Local time',
    'table.emptyHint': 'No saved results yet. Search for a city above.',
    'table.paginationNav': 'Search history pages',
    'table.paginationPrev': 'Previous',
    'table.paginationNext': 'Next',
    'table.paginationStatus': 'Page {current} of {total}',
    'err.locationNotFound': 'That location could not be found. Try another city.',
    'err.apiLoadPrefix': 'Weather could not be loaded: ',
    'err.generic': 'Something went wrong. Check your connection and try again.',
    'err.invalidSearchQuery':
      'That search is not valid. Use letters or numbers (for example a city name or coordinates).',
    'err.noCitySuggestions': 'No city suggestions available. Try writing another city.',
    'err.offlineBanner':
      'You are offline. Search saved favorites and history below; live weather needs a network connection.',
    'err.offlineLiveWeather': 'Live weather requires a network connection.',
    'err.offlineSearch': 'No saved cities match that search. Try a name from your favorites or history.',
  },
  es: {
    'card.favoriteToggle': 'Cambiar favorito',
    'card.localTime': 'Hora local: {time}',
    'card.weatherIconAlt': 'Icono del estado del tiempo',
    'card.wind': 'Viento',
    'card.humidity': 'Humedad',
    'dashboard.title': 'Tiempo',
    'dashboard.hint': 'Busca una ciudad y elige una sugerencia, o pulsa Entrar.',
    'dashboard.searchSection': 'Búsqueda de ciudad',
    'dashboard.cityLabel': 'Ciudad',
    'dashboard.viewToggle': 'Diseño de resultados',
    'dashboard.viewTable': 'Tabla',
    'dashboard.viewDetail': 'Detalle',
    'dashboard.loading': 'Cargando el tiempo…',
    'dashboard.langToggle': 'Idioma',
    'dashboard.langEn': 'Inglés',
    'dashboard.langEs': 'Español',
    'detail.section': 'Tiempo detallado',
    'detail.emptyHint': 'Busca una ciudad para ver la previsión.',
    'favorites.section': 'Ciudades favoritas',
    'favorites.title': 'Favoritos',
    'favorites.loadCity': 'Cargar el tiempo de {city}',
    'favorites.remove': 'Quitar {city} de favoritos',
    'favorites.emptyHint': 'Aún no hay favoritos. Abre una ciudad en vista detalle y pulsa la estrella.',
    'table.colCity': 'Ciudad',
    'table.colTempC': 'Temp. (°C)',
    'table.colCondition': 'Estado',
    'table.colLocalTime': 'Hora local',
    'table.emptyHint': 'Aún no hay resultados guardados. Busca una ciudad arriba.',
    'table.paginationNav': 'Páginas del historial de búsqueda',
    'table.paginationPrev': 'Anterior',
    'table.paginationNext': 'Siguiente',
    'table.paginationStatus': 'Página {current} de {total}',
    'err.locationNotFound': 'No se encontró esa ubicación. Prueba con otra ciudad.',
    'err.apiLoadPrefix': 'No se pudo cargar el tiempo: ',
    'err.generic': 'Algo salió mal. Comprueba la conexión e inténtalo de nuevo.',
    'err.invalidSearchQuery':
      'Esa búsqueda no es válida. Usa letras o números (por ejemplo un nombre de ciudad o coordenadas).',
    'err.noCitySuggestions':
      'No hay sugerencias de ciudad. Prueba escribiendo otra ciudad.',
    'err.offlineBanner':
      'Estás sin conexión. Busca en favoritos e historial guardados; el tiempo en vivo necesita red.',
    'err.offlineLiveWeather': 'El tiempo en vivo requiere conexión a la red.',
    'err.offlineSearch':
      'Ninguna ciudad guardada coincide con esa búsqueda. Prueba un nombre de favoritos o historial.',
  },
};
