---
name: task-division
description: Divide un ticket en subtareas atómicas antes de planificar. Útil cuando el ticket es grande o ambiguo para acotar el scope del plan.
argument-hint: 'Opcional: contexto extra o restricciones del ticket.'
agent: agent
---

Divide el ticket en subtareas atómicas y ordenadas para alimentar el paso de planificación.

Input del usuario: ${input:userContext:contexto adicional o restricciones}

**Instrucción de salida:** No escribas análisis ni respuesta en el chat. Todo el output debe escribirse directamente en el archivo `tasks/[ID-TICKET].md`. Si el directorio no existe, crealo.

Fuentes obligatorias:

1. El ticket AI-ready activo en el contexto o provisto por el usuario.
2. Si existe, el mapeo de Design System generado por `/screen-to-ds`.

Objetivo:

Producir una lista de subtareas que responda **qué hay que hacer**, no cómo. El plan de implementación técnica viene después.

---

## Flujo de trabajo

1. Lee el ticket completo e identifica:
   - Criterios de aceptación explícitos
   - Casos edge mencionados o inferibles
   - Dependencias con otros componentes o servicios

2. Desglosa en subtareas atómicas usando el formato:

   ```
   T001 [P?] [TIER] Descripción concisa de la subtarea
   ```

   - `[P]` indica que puede correr en paralelo (archivos distintos, sin dependencias entre sí)
   - Sin `[P]` = bloqueante o secuencial
   - Cada subtarea debe ser verificable de forma independiente
   - `[TIER]` es el nivel de modelo recomendado para ejecutar esa tarea (ver criterios abajo)

3. Agrupa por bloque lógico cuando corresponda:

   - **UI / Componentes**: componentes nuevos, adaptaciones de DS
   - **Estado / Lógica**: hooks, stores, utils
   - **Integración**: llamadas a API, contratos Pact
   - **Tests**: unitarios, de integración (marcar como `[OPCIONAL]` si no están en los criterios)
   - **Accesibilidad / Edge cases**: vacíos, errores, loading states

4. Indicá dependencias explícitas cuando una tarea bloquea a otra:
   - `T003 depende de T001`

5. Al final, listá las subtareas que **no están cubiertas por el ticket** pero son necesarias para completarlo (scope gaps).

6. Para cada subtarea asigná un tier de modelo según estos criterios:

   | Tier | Cuándo usarlo | Ejemplos |
   |------|--------------|----------|
   | `[FAST]` | Tarea clara, mecánica, bien delimitada. El contexto es suficiente y no hay ambigüedad. | Crear un componente de UI con spec del DS, agregar un estado de loading, escribir un test con patrón conocido |
   | `[BALANCED]` | Tarea moderadamente compleja o con algo de ambigüedad. Requiere leer contexto del repo pero el camino es inferible. | Integrar un hook existente en un componente nuevo, adaptar un contrato Pact, manejar casos edge con lógica de negocio |
   | `[THINK]` | Tarea ambigua, con múltiples decisiones de diseño, dependencias cruzadas o impacto arquitectónico. El contexto no alcanza para tomar la decisión solo. | Definir la estructura de un hook complejo, decidir dónde vive un estado compartido, resolver conflicto entre DS y req. funcional |

   Regla de oro: si para ejecutar la tarea el agente necesita *razonar sobre trade-offs* más que *ejecutar pasos claros*, subí el tier.

---

## Reglas

- No describas implementación técnica (eso es el plan). Solo el *qué*.
- No inventes criterios que no están en el ticket ni son claramente inferibles.
- Siempre incluí al menos una subtarea de **unit tests**, aunque no esté explícita en los criterios de aceptación del ticket.
- Si el ticket ya es lo suficientemente pequeño, indicalo y no lo dividas.
- Máximo 10 subtareas. Si superás ese número, el ticket debe dividirse en varios tickets antes de continuar.
- **Dividí con criterio, no por completitud.** No es necesario llegar al máximo ni cubrir todo con una subtarea propia. Si dos cosas van naturalmente juntas, dejálas juntas. Una división buena es la mínima necesaria para que el plan sea claro y ejecutable.
- **Priorizá la verticalidad.** Cada subtarea debe entregar un slice funcional de punta a punta (UI → lógica → integración) en vez de capas horizontales aisladas. Preferí "pantalla X completa" sobre "todos los componentes UI" + "toda la lógica" por separado.
- **Referencias visuales.** Si la US incluye screenshots y una subtarea se beneficia de referenciarlas para dar contexto visual, incluí la referencia con el formato `📎 [nombre-screenshot]`. Esto es opcional y solo cuando la imagen aporta claridad sobre qué resolver.

---

## Formato de salida

Escribí el resultado en `tasks/[ID-TICKET].md`. No respondas en el chat.

```markdown
# División de tareas — [NOMBRE DEL TICKET]

## Subtareas

T001 [P] [FAST]     ...
T002 [P] [BALANCED] ... 📎 [screenshot-home.png]
T003     [THINK]    ... (depende de T001)
...

## Dependencias
- T003 → T001

## Scope gaps detectados
- ...

## Notas
- ...
```
