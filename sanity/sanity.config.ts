import {createAuthStore, defineConfig, isDev} from 'sanity'

import {structureTool} from 'sanity/structure'
import {schemaTypes} from './schemaTypes'
import {structure} from './structure'

import {visionTool} from '@sanity/vision'
import {colorInput} from '@sanity/color-input'
import {embeddingsIndexDashboard} from '@sanity/embeddings-index-ui'

import {assist} from '@sanity/assist'
import {imageHotspotArrayPlugin} from 'sanity-plugin-hotspot-array'
import {media, mediaAssetSource} from 'sanity-plugin-media'
import {customDocumentActions} from './plugins/customDocumentActions'
import Navbar from './components/studio/Navbar'
import {presentationTool} from 'sanity/presentation'

// Environment variables for project configuration
const projectId = process.env.SANITY_STUDIO_PROJECT_ID || 'your-projectID'
const dataset = process.env.SANITY_STUDIO_DATASET || 'production'

const devOnlyPlugins = [visionTool()]

export default defineConfig({
  name: 'sanity-hydrogen-ecommerce',
  title: 'Sanity and Shopify',

  projectId,
  dataset,

  auth: createAuthStore({
    projectId: projectId,
    dataset: dataset,
    redirectOnSingle: false,
    mode: "append",
    providers: [
      {
        name: "saml",
        title: "Sanity.io SSO",
        url: "https://api.sanity.io/v2021-10-01/auth/saml/login/a9fd8216",
      },
    ],
    loginMethod: "dual",
  }),

  plugins: [
    structureTool({structure}),
    embeddingsIndexDashboard(),
    colorInput(),
    imageHotspotArrayPlugin(),
    customDocumentActions(),
    presentationTool({
      previewUrl: {
        initial: 'http://localhost:3000',
        previewMode: {
          enable: 'api/preview',
          disable: 'api/preview',
        },
      },
      allowOrigins: ['http://localhost:3000'],
    }),
    media(),
    assist(),
    ...(isDev ? devOnlyPlugins : []),
  ],

  schema: {
    types: schemaTypes,
  },

  form: {
    file: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter((assetSource) => assetSource !== mediaAssetSource)
      },
    },
    image: {
      assetSources: (previousAssetSources) => {
        return previousAssetSources.filter((assetSource) => assetSource === mediaAssetSource)
      },
    },
  },

  studio: {
    components: {
      navbar: Navbar,
    },
  },
})