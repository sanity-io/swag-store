# Sanity Studio Deployment Setup

This document outlines the required setup for the Sanity Studio GitHub Action deployment.

## Required GitHub Secrets

The following secrets must be configured in your GitHub repository settings:

### 1. NPM_TOKEN
- **Purpose**: Authenticates with npm registry for @sanity packages
- **How to get**: 
  1. Go to [npmjs.com](https://www.npmjs.com)
  2. Sign in to your account
  3. Go to Access Tokens in your account settings
  4. Generate a new token with "Automation" type
  5. Copy the token value

### 2. SANITY_AUTH_TOKEN
- **Purpose**: Authenticates with Sanity for deployment operations
- **How to get**:
  1. Install Sanity CLI globally: `npm install -g @sanity/cli`
  2. Run: `sanity login`
  3. Follow the authentication flow
  4. Run: `sanity debug --secrets` to get your auth token
  5. Copy the token value

## Setting up GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with the exact names listed above

## Workflow Triggers

The workflow will automatically run when:
- Code is pushed to the `main` branch
- Changes are made to files in the `sanity/` directory
- Changes are made to `pnpm-lock.yaml` or `package.json`
- Manually triggered via GitHub Actions UI

## What the Workflow Does

1. **Checks out code** from the repository
2. **Sets up pnpm** with version 10.12.4
3. **Installs dependencies** for the entire workspace
4. **Builds the Sanity Studio** using `pnpm run build`
5. **Deploys the Studio** using `pnpm run deploy`
6. **Deploys the Schema** using `pnpm run deploy-schema`
7. **Deploys GraphQL** using `pnpm run deploy-graphql`

## Troubleshooting

### Common Issues

1. **Authentication failures**: Ensure both `NPM_TOKEN` and `SANITY_AUTH_TOKEN` are correctly set
2. **Build failures**: Check that all dependencies are properly installed
3. **Deployment failures**: Verify that the Sanity project ID and dataset are correctly configured in `sanity.cli.ts`

### Manual Deployment

You can also deploy manually by running these commands locally:

```bash
cd sanity
pnpm run build
pnpm run deploy
pnpm run deploy-schema
pnpm run deploy-graphql
```
