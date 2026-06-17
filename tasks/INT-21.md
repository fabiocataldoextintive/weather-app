# División de tareas — INT-21: choose how often city weather refreshes and fetch new data only when that interval has passed since the last update

## Subtareas

### Intervalo de refresco (selector + persistencia)

T001 [P] [FAST] Definir constante de intervalos permitidos `[300000, 600000, 900000, 1800000]`, modelo de opción (`labelKey` + `value`) y claves i18n `interval.5min` … `interval.30min` en `messages.ts` (en/es).

T002 [BALANCED] Estado NgRx para `weatherUpdateTimeInterval`: default `300000` sin valor previo, hidratación desde `localStorage`, fallback a `300000` si el valor guardado no está en el array permitido, acción al seleccionar y persistencia en `weatherUpdateTimeInterval`. (depende de T001)

T003 [BALANCED] Selector de intervalo debajo del buscador de ciudad: opciones en orden ascendente (5, 10, 15, 30 min), etiquetas vía `I18nPipe`, opción seleccionada refleja el estado, cambio de idioma actualiza labels sin alterar el valor seleccionado. (depende de T001, T002)

### Timestamp y lógica de refresco

T004 [BALANCED] Agregar `lastUpdate` (string timestamp) a registros de historial y favoritos; asignarlo en cada fetch exitoso de clima; persistir vía capa de storage existente.

T005 [THINK] Gating de refresco en effects de carga de clima: primera búsqueda de una ciudad siempre llama API; búsquedas posteriores, selección desde historial y desde favoritos comparan `Date.now() - new Date(lastUpdate).getTime()` contra el intervalo activo — omitir API y mostrar datos cacheados si no transcurrió el intervalo; llamar API y actualizar `lastUpdate` si lo transcurrió. (depende de T002, T004)

### Tests

T006 [P] [BALANCED] Tests unitarios: hidratación/persistencia/fallback del intervalo, labels i18n y cambio de locale, cálculo elapsed vs intervalo (API sí/no), escritura de `lastUpdate` en historial y favoritos.

## Dependencias

- T002 → T001
- T003 → T001, T002
- T005 → T002, T004

## Scope gaps detectados

- Coordinación con flujo offline existente (PWA/INT-15): prioridad entre gating por intervalo y restricciones de conectividad cuando no hay red.
- Cambiar el intervalo no define si el clima visible en pantalla debe refrescarse de inmediato o solo en la próxima selección.
- Valor de `lastUpdate` en registros hidratados desde `localStorage` sin fetch previo en la sesión actual.
- Indicador visual de datos “stale” en UI (no requerido por los escenarios Gherkin).

## Notas

- No existe mapeo de Design System generado por `/screen-to-ds` para este ticket.
- Los effects actuales re-fetchean clima al seleccionar fila de historial o favorito; T005 reemplaza ese comportamiento incondicional.
- Criterios cubren: selector con default/persistencia/fallback, i18n en/en, `lastUpdate` en historial y favoritos, y gating de API por tiempo transcurrido.
