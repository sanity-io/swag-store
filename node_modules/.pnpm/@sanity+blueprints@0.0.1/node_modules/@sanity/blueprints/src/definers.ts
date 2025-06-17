import type {
  Blueprint,
  BlueprintFunctionResource,
  BlueprintFunctionResourceEvent,
  BlueprintModule,
  BlueprintResource,
  BlueprintsApiConfig,
} from './types.js'

export function defineBlueprint(blueprintConfig: Partial<Blueprint> & Partial<BlueprintsApiConfig>): BlueprintModule {
  const {organizationId, projectId, stackId, blueprintVersion, resources, values, outputs} = blueprintConfig

  if (resources && !Array.isArray(resources)) throw new Error('`resources` must be an array')

  function blueprint(): Blueprint {
    return {
      $schema: 'https://schemas.sanity.io/blueprints/v2024-10-01/blueprint.schema.json',
      blueprintVersion: blueprintVersion ?? '2024-10-01',
      resources,
      values,
      outputs,
    }
  }

  blueprint.organizationId = organizationId
  blueprint.projectId = projectId
  blueprint.stackId = stackId

  return blueprint
}

type EventKey = keyof BlueprintFunctionResourceEvent
const EVENT_KEYS = new Set<EventKey>(['on', 'filter', 'projection'])

export function defineDocumentFunction(
  functionConfig: Partial<BlueprintFunctionResource> & Partial<BlueprintFunctionResourceEvent>,
): BlueprintFunctionResource {
  let {name, src, event, timeout, memory, env, type, ...maybeEvent} = functionConfig

  if (!name) throw new Error('`name` is required')

  // defaults
  if (!src) src = `functions/${name}`
  if (!type) type = 'sanity.function.document'

  // type validation
  if (memory && typeof memory !== 'number') throw new Error('`memory` must be a number')
  if (timeout && typeof timeout !== 'number') throw new Error('`timeout` must be a number')

  // event validation
  if (event) {
    // check for `event` and `maybeEvent` collision
    const invalidKeys = Object.keys(maybeEvent).filter((k) => EVENT_KEYS.has(k as EventKey))
    if (invalidKeys.length > 0) {
      throw new Error(`\`event\` cannot be specified with ${invalidKeys.map((k) => `\`${k}\``).join(', ')}`)
    }

    if (!event.on) throw new Error('`event.on` is required')
    if (!Array.isArray(event.on)) throw new Error('`event.on` must be an array')
  } else {
    const {on, filter, projection} = maybeEvent
    if (on && !Array.isArray(on)) throw new Error('`on` must be an array')
    event = {on: on ?? ['publish'], filter, projection}
  }

  return {
    type,
    name,
    src,
    event,
    timeout,
    memory,
    env,
  }
}

export function defineResource(resourceConfig: Partial<BlueprintResource>): BlueprintResource {
  const {name, type} = resourceConfig
  if (!name) throw new Error('`name` is required')
  if (!type) throw new Error('`type` is required')

  return {
    ...resourceConfig,
    type,
    name,
  }
}
