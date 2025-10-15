# Swag Store - E-commerce Platform

A comprehensive e-commerce platform built with **Sanity CMS**, **Shopify Hydrogen**, **Sanity Functions**, and **Sanity SDK Apps**. This monorepo provides a complete headless commerce solution with advanced content management, real-time notifications, attribution tracking, and automated marketing campaigns.

## 🏗️ Architecture Overview

This repository contains multiple interconnected systems:

- **🌐 Frontend**: React Router-based Hydrogen storefront
- **📝 CMS**: Sanity Studio for content management
- **⚡ Functions**: Serverless functions for automation
- **📱 Apps**: Custom Sanity SDK applications
- **🔄 Integrations**: Shopify, Algolia, and webhook systems

## 📁 Repository Structure

```
swag-store/
├── web/                          # Hydrogen storefront (React Router)
├── sanity/                       # Sanity Studio CMS
├── functions/                    # Sanity Functions (serverless)
├── sanity-apps/                  # Custom Sanity SDK Apps
│   ├── notifications/            # Notification management app
│   └── attribution/              # Attribution tracking app
├── data/                         # Sample data and fixtures
└── docs/                         # Documentation and guides
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ 
- **pnpm** 10.12.4+ (package manager)
- **Shopify CLI** (for Hydrogen development)
- **Sanity CLI** (for CMS management)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd swag-store
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy environment templates
   cp web/.env.example web/.env
   cp sanity/.env.example sanity/.env
   ```

4. **Configure your environment**
   - Update `web/.env` with Shopify credentials
   - Update `sanity/.env` with Sanity project details
   - Configure function environment variables

### Development

Start all services in development mode:

```bash
# Start everything (web + sanity + functions)
pnpm dev

# Or start individual services
pnpm dev:web      # Hydrogen storefront
pnpm dev:sanity   # Sanity Studio
```

## 🌐 Frontend (Hydrogen Storefront)

**Location**: `web/`

A modern e-commerce storefront built with Shopify Hydrogen and React Router v7.

### Features

- **🛍️ Product Catalog**: Dynamic product listings and collections
- **🔍 Search & Filtering**: Advanced search with Algolia integration
- **🌍 Internationalization**: Multi-language and multi-currency support
- **📱 Responsive Design**: Mobile-first responsive layout
- **⚡ Performance**: Optimized for Core Web Vitals
- **🎨 Custom Components**: Reusable UI components and layouts

### Tech Stack

- **Framework**: Shopify Hydrogen 2025.5.0
- **Routing**: React Router 7.6.0
- **Styling**: Tailwind CSS 4.1.6
- **State Management**: React Context + Hooks
- **Data Fetching**: GraphQL + GROQ queries

### Key Routes

- `/` - Homepage with featured content
- `/products/[handle]` - Product detail pages
- `/collections/[handle]` - Collection pages
- `/pages/[handle]` - CMS-managed pages
- `/search` - Search and filtering interface

## 📝 CMS (Sanity Studio)

**Location**: `sanity/`

A powerful content management system with custom schemas and workflows.

### Content Types

- **Products**: Shopify-synced product data
- **Collections**: Product groupings and categories
- **Pages**: Custom CMS pages and content
- **Posts**: Blog posts and articles
- **Marketing Campaigns**: Campaign management
- **Notifications**: System notifications
- **Settings**: Site-wide configuration

### Custom Features

- **🔄 Shopify Sync**: Automatic product synchronization
- **📊 Analytics**: Built-in content analytics
- **🎯 Hotspots**: Interactive image hotspots
- **📱 Preview**: Live preview of content
- **🔧 Custom Actions**: Automated content workflows

### Studio Features

- **Custom Inputs**: Specialized input components
- **Document Actions**: Automated workflows
- **Media Management**: Advanced asset handling
- **Validation**: Content validation rules
- **Permissions**: Role-based access control

## ⚡ Sanity Functions

**Location**: `functions/`

Serverless functions for automation and integrations.

### Available Functions

| Function | Purpose | Trigger |
|----------|---------|---------|
| `algolia-sync` | Sync products to Algolia search | Product updates |
| `marketing-campaign-create` | Create marketing campaigns | Manual/API |
| `marketing-campaign-send` | Send campaign emails | Scheduled |
| `notification-webhook` | Process webhook notifications | Webhook events |
| `product-map` | Map Shopify products to Sanity | Product sync |
| `product-ref-map` | Create product references | Product updates |
| `sanity-shopify-product-slug` | Generate product slugs | Product creation |
| `shopify-image-upload` | Upload images to Shopify | Media uploads |
| `stale-products` | Identify stale products | Scheduled |

### Function Development

```bash
# Deploy a specific function
cd functions/[function-name]
sanity functions deploy

# Deploy all functions
sanity functions deploy --all
```

## 📱 Sanity SDK Apps

**Location**: `sanity-apps/`

Custom applications built with the Sanity SDK for specialized workflows.

### Notifications App

**Purpose**: System notification management and monitoring

**Features**:
- Real-time notification dashboard
- Notification filtering and categorization
- Automated cleanup and archiving
- Webhook integration for external systems

**Usage**:
```bash
cd sanity-apps/notifications
pnpm dev
```

### Attribution App

**Purpose**: E-commerce attribution tracking and campaign analytics

**Features**:
- Order tracking and attribution analysis
- Campaign performance monitoring
- Revenue analytics and reporting
- UTM parameter management
- Product performance insights

**Usage**:
```bash
cd sanity-apps/attribution
pnpm dev
```

## 🔧 Configuration

### Environment Variables

#### Web (Hydrogen)
```env
# Shopify Configuration
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_STOREFRONT_ACCESS_TOKEN=your_token
SHOPIFY_STOREFRONT_API_VERSION=2024-01

# Sanity Configuration
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_token

# Algolia (Optional)
ALGOLIA_APP_ID=your_app_id
ALGOLIA_SEARCH_API_KEY=your_key
```

#### Sanity Studio
```env
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_token
```

#### Functions
```env
SANITY_PROJECT_ID=your_project_id
SANITY_DATASET=production
SANITY_API_TOKEN=your_token
SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
SHOPIFY_ACCESS_TOKEN=your_token
```

### Workspace Configuration

The repository uses **pnpm workspaces** for monorepo management:

```json
{
  "workspaces": [
    "sanity",
    "web"
  ]
}
```

## 🚀 Deployment

### Frontend (Hydrogen)

Deploy to Shopify Oxygen:

```bash
cd web
pnpm build
shopify hydrogen deploy
```

### Sanity Studio

Deploy to Sanity:

```bash
cd sanity
pnpm build
sanity deploy
```

### Functions

Deploy all functions:

```bash
sanity functions deploy --all
```

### Apps

Deploy Sanity SDK apps:

```bash
cd sanity-apps/[app-name]
pnpm build
sanity deploy
```

## 📚 Documentation

### Guides

- [Sanity Development Setup](SANITY_DEV_SETUP.md)
- [Dataset Management](SANITY_DATASET_MANAGEMENT.md)
- [Marketing Campaign Functions](MARKETING_CAMPAIGN_FUNCTIONS_GUIDE.md)
- [Notification System](NOTIFICATION_SYSTEM.md)
- [Product Tag Processing](PRODUCT_TAG_PROCESSING.md)

### API Documentation

- **Sanity API**: [docs.sanity.io](https://docs.sanity.io)
- **Shopify Storefront API**: [shopify.dev](https://shopify.dev/docs/api/storefront)
- **Hydrogen**: [hydrogen.shopify.dev](https://hydrogen.shopify.dev)

## 🛠️ Development

### Code Style

- **ESLint**: Configured for TypeScript and React
- **Prettier**: Code formatting
- **TypeScript**: Strict type checking

### Testing

```bash
# Run type checking
pnpm typecheck

# Run linting
pnpm lint

# Run tests (when available)
pnpm test
```

### Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development |
| `pnpm build` | Build all workspaces |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm lint` | Run ESLint |
| `pnpm clean` | Clean build artifacts |

## 🔄 Integrations

### Shopify

- **Product Sync**: Automatic product synchronization
- **Order Processing**: Order webhook handling
- **Image Management**: Asset upload and optimization
- **Inventory**: Real-time inventory updates

### Algolia

- **Search**: Advanced product search
- **Filtering**: Dynamic filtering capabilities
- **Analytics**: Search analytics and insights

### Webhooks

- **Order Events**: Real-time order processing
- **Product Updates**: Automatic content updates
- **Notification System**: External system integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

### Development Guidelines

- Follow TypeScript best practices
- Use meaningful commit messages
- Update documentation for new features
- Test changes across all workspaces

## 📄 License

This project is licensed under the UNLICENSED license.

## 🆘 Support

For issues and questions:

1. Check the documentation in the `docs/` folder
2. Review existing issues
3. Create a new issue with detailed information

## 🔗 Related Links

- [Sanity Documentation](https://www.sanity.io/docs)
- [Shopify Hydrogen](https://hydrogen.shopify.dev)
- [React Router](https://reactrouter.com)
- [Tailwind CSS](https://tailwindcss.com)

---

**Built with ❤️ using Sanity, Shopify Hydrogen, and modern web technologies.**
