# @sanity/blueprints

> [!IMPORTANT]  
> This package is currently in beta and may change. Refer to the [CHANGELOG](./CHANGELOG.md) for details.

Helper methods for building valid Sanity Blueprints.

## Usage

```ts
import {defineBlueprint, defineDocumentFunction, defineResource} from '@sanity/blueprints'

export default defineBlueprint({
  resources: [
    defineDocumentFunction({name: 'invalidate-cache', timeout: 60, projection: '_id'}),
    defineDocumentFunction({name: 'send-email', filter: "_type == 'press-release'"}),
    defineDocumentFunction({
      name: 'Create Fancy Report',
      src: 'functions/create-fancy-report',
      memory: 2,
      timeout: 360,
      event: {
        on: ['publish'],
        filter: "_type == 'customer'",
        projection: "totalSpend, lastOrderDate",
      },
      env: {
        currency: 'USD',
      },
    }),

    defineResource({name: 'test-resource', type: 'test'}),
  ],
})
```
