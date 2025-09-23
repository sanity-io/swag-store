#!/bin/bash

# Sanity Development Studio Setup Script
# This script creates a complete development studio setup with imported production data

set -e

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="sanity-dev-studio"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
NEW_PROJECT_NAME="sanity-dev-test-${TIMESTAMP}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Determine Sanity directory
SANITY_DIR=""

# Check if we're already in a Sanity directory (has sanity.config.ts/js)
if [ -f "sanity.config.ts" ] || [ -f "sanity.config.js" ]; then
    SANITY_DIR="."
    print_status "Detected Sanity project in current directory"
elif [ -d "sanity" ]; then
    SANITY_DIR="sanity"
    print_status "Found 'sanity' subdirectory"
else
    print_error "No Sanity project found in current directory or 'sanity' subdirectory"
    echo
    print_status "Please specify the path to your Sanity directory:"
    read -p "Enter path to Sanity directory: " -r
    SANITY_DIR="$REPLY"
    
    # Validate the provided directory
    if [ ! -d "$SANITY_DIR" ]; then
        print_error "Directory '$SANITY_DIR' does not exist"
        exit 1
    fi
    
    if [ ! -f "$SANITY_DIR/sanity.config.ts" ] && [ ! -f "$SANITY_DIR/sanity.config.js" ]; then
        print_error "Directory '$SANITY_DIR' does not appear to be a Sanity project (no sanity.config.ts/js found)"
        exit 1
    fi
    
    print_success "Using Sanity directory: $SANITY_DIR"
fi

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command_exists "npx"; then
        print_error "npx not found. Please install Node.js and npm."
        exit 1
    fi

    if ! command_exists "sanity" && ! npx sanity --version >/dev/null 2>&1; then
        print_error "Sanity CLI not available. Please install Sanity or ensure npx can access it."
        exit 1
    fi

    if ! command_exists "jq"; then
        print_warning "jq not found. Some features may not work properly."
        print_status "Install jq with: brew install jq (macOS) or apt-get install jq (Ubuntu)"
    fi

    print_success "Prerequisites check passed"
}

# Get project configuration
get_project_config() {
    print_status "Reading project configuration from $SANITY_DIR..."

    # Try to get project ID and dataset from sanity directory
    if [ -f "$SANITY_DIR/.env" ]; then
        SOURCE_PROJECT_ID=$(grep "SANITY_STUDIO_PROJECT_ID" "$SANITY_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'")
        SOURCE_DATASET=$(grep "SANITY_STUDIO_DATASET" "$SANITY_DIR/.env" 2>/dev/null | cut -d'=' -f2 | tr -d '"' | tr -d "'" || echo "production")
    else
        print_warning "No .env file found in $SANITY_DIR directory"
        SOURCE_PROJECT_ID=""
        SOURCE_DATASET="production"
    fi

    # Get current sanity project info if available
    if [ -d "$SANITY_DIR" ]; then
        cd "$SANITY_DIR"
        if npx sanity debug --secrets 2>/dev/null | grep -q "projectId"; then
            CURRENT_PROJECT=$(npx sanity debug --secrets 2>/dev/null | grep "projectId" | cut -d'"' -f4)
            if [ -z "$SOURCE_PROJECT_ID" ]; then
                SOURCE_PROJECT_ID="$CURRENT_PROJECT"
            fi
        fi
        cd ..
    fi

    print_status "Source Project ID: ${SOURCE_PROJECT_ID:-'(will use current project)'}"
    print_status "Source Dataset: ${SOURCE_DATASET}"
    print_status "New Project Name: ${NEW_PROJECT_NAME}"
}

# Export production data
export_data() {
    local export_file="sanity-backup-${TIMESTAMP}.tar.gz"

    print_status "Exporting data from dataset: ${SOURCE_DATASET}"
    cd "$SANITY_DIR"

    # Use the source project ID if available
    if [ -n "$SOURCE_PROJECT_ID" ]; then
        SANITY_PROJECT_ID="$SOURCE_PROJECT_ID" npx sanity dataset export "${SOURCE_DATASET}" "../${export_file}" || {
            print_error "Failed to export dataset"
            exit 1
        }
    else
        npx sanity dataset export "${SOURCE_DATASET}" "../${export_file}" || {
            print_error "Failed to export dataset"
            exit 1
        }
    fi

    cd ..

    if [ ! -f "${export_file}" ]; then
        print_error "Export file not created"
        exit 1
    fi

    echo "$export_file"
}

# Create new Sanity project
create_new_project() {
    print_status "Creating new Sanity project: ${NEW_PROJECT_NAME}"
    
    # Create new project using Sanity CLI
    if command_exists "jq"; then
        NEW_PROJECT_ID=$(npx sanity projects create "${NEW_PROJECT_NAME}" --output json | jq -r '.projectId' 2>/dev/null || echo "")
    else
        # Fallback: parse the output manually
        PROJECT_OUTPUT=$(npx sanity projects create "${NEW_PROJECT_NAME}" 2>/dev/null || echo "")
        NEW_PROJECT_ID=$(echo "$PROJECT_OUTPUT" | grep -o 'Project ID: [a-z0-9-]*' | cut -d' ' -f3 || echo "")
    fi
    
    if [ -z "$NEW_PROJECT_ID" ]; then
        print_error "Failed to create new Sanity project"
        print_status "You may need to run 'npx sanity login' first"
        print_status "Or check if you have permission to create projects"
        exit 1
    fi
    
    print_success "Created new project with ID: ${NEW_PROJECT_ID}"
    echo "$NEW_PROJECT_ID"
}

# Setup development studio
setup_dev_studio() {
    local export_file="$1"
    local new_project_id="$2"

    print_status "Setting up development studio..."

    # Check if this is a Next.js app with embedded Sanity studio
    if [ -f "next.config.js" ] || [ -f "next.config.ts" ] || [ -f "next.config.mjs" ]; then
        print_warning "Detected Next.js application with embedded Sanity studio."
        echo
        print_status "Due to the complexity of duplicating the entire Next.js project structure,"
        print_status "it's recommended to handle the development studio by updating environment variables instead."
        echo
        print_status "To switch to your new development project, update your environment variables:"
        echo "  SANITY_STUDIO_PROJECT_ID=${new_project_id}"
        echo "  SANITY_STUDIO_DATASET=production"
        echo
        print_status "You can also create a separate .env.development file with:"
        echo "  SANITY_STUDIO_PROJECT_ID=${new_project_id}"
        echo "  SANITY_STUDIO_DATASET=production"
        echo "  # Add any other development-specific environment variables"
        echo
        print_status "Then run your Next.js app with: npm run dev (or your preferred dev command)"
        echo
        read -p "Skip development studio clone creation for Next.js app? (Y/n): " -r
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            print_status "Proceeding with development studio clone creation anyway..."
            print_warning "This may not work properly with the embedded Next.js structure."
        else
            print_status "Skipping development studio clone creation for Next.js app"
            print_status "Your new Sanity project setup is complete!"
            print_status "New Project ID: ${new_project_id}"
            print_status "Backup file: ${export_file}"
            echo
            print_status "To use your new project:"
            echo "1. Update your .env file with the new project ID"
            echo "2. Run your Next.js app normally"
            echo "3. Your studio will now use the new project"
            exit 0
        fi
    fi

    # Remove existing dev studio if it exists
    if [ -d "${BACKUP_DIR}" ]; then
        print_warning "Removing existing ${BACKUP_DIR} directory"
        rm -rf "${BACKUP_DIR}"
    fi

    mkdir -p "${BACKUP_DIR}"

    # Copy the entire sanity directory
    print_status "Copying studio files..."
    if command -v rsync >/dev/null 2>&1; then
        print_status "Using rsync for efficient copying..."
        if ! rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='build' --exclude='sanity-dev-studio' "$SANITY_DIR/" "${BACKUP_DIR}/"; then
            print_warning "rsync failed, falling back to cp..."
            find "$SANITY_DIR" -maxdepth 1 -not -name "sanity-dev-studio" -not -name "." -exec cp -r {} "${BACKUP_DIR}/" \;
        fi
    else
        print_status "rsync not available, using cp..."
        find "$SANITY_DIR" -maxdepth 1 -not -name "sanity-dev-studio" -not -name "." -exec cp -r {} "${BACKUP_DIR}/" \;
    fi

    # Copy export file
    mv "${export_file}" "${BACKUP_DIR}/"

    cd "${BACKUP_DIR}"

    # Create development .env file
    print_status "Creating development configuration..."
    cat > .env << EOF
# Development Sanity Studio Configuration
# Generated on $(date)

SANITY_STUDIO_PROJECT_ID=${new_project_id}
SANITY_STUDIO_DATASET=production
SANITY_STUDIO_PREVIEW_URL=""
SANITY_STUDIO_STUDIO_HOST="sanity-dev-test"
EOF

    # If original .env had other variables, preserve them (except project/dataset specific ones)
    if [ -f "../$SANITY_DIR/.env" ]; then
        print_status "Preserving additional environment variables..."
        grep -v "SANITY_STUDIO_PROJECT_ID\|SANITY_STUDIO_DATASET\|SANITY_STUDIO_PREVIEW_URL\|SANITY_STUDIO_STUDIO_HOST" "../$SANITY_DIR/.env" >> .env || true
    fi

    # Update package.json scripts for development
    if command_exists "jq"; then
        print_status "Adding development scripts to package.json..."
        jq '.scripts["import-backup"] = "sanity dataset import ./'"${export_file}"' production --replace --allow-failing-assets"' package.json > package.json.tmp && mv package.json.tmp package.json
        jq '.scripts["reset-dev"] = "sanity dataset delete production && sanity dataset create production && sanity dataset import ./'"${export_file}"' production --replace --allow-failing-assets"' package.json > package.json.tmp && mv package.json.tmp package.json
        jq '.scripts["deploy"] = "sanity deploy"' package.json > package.json.tmp && mv package.json.tmp package.json
    else
        print_warning "jq not found - you can manually add import-backup script to package.json"
    fi

    # Install dependencies in development studio
    print_status "Installing dependencies in development studio..."
    if [ -f "package.json" ]; then
        # Clean up any problematic lock files first
        print_status "Cleaning up lock files..."
        rm -f package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null || true
        
        if command_exists "npm"; then
            print_status "Installing dependencies with npm..."
            if ! npm install --legacy-peer-deps; then
                print_warning "npm install with --legacy-peer-deps failed, trying with --force..."
                if ! npm install --force; then
                    print_warning "Dependency installation failed. You may need to resolve conflicts manually."
                    print_warning "Common solutions:"
                    print_warning "1. Update styled-components to version 6.x in package.json"
                    print_warning "2. Use 'npm install --legacy-peer-deps' manually"
                    print_warning "3. Check for conflicting peer dependencies"
                fi
            fi
        elif command_exists "pnpm"; then
            print_status "Installing dependencies with pnpm..."
            if ! pnpm install --legacy-peer-deps; then
                print_warning "pnpm install with --legacy-peer-deps failed, trying with --force..."
                if ! pnpm install --force; then
                    print_warning "pnpm install failed. You may need to resolve dependency conflicts manually."
                    print_warning "Try running 'pnpm install --legacy-peer-deps' manually in the studio directory"
                fi
            fi
        else
            print_warning "Neither npm nor pnpm found. Please install dependencies manually."
        fi
    else
        print_warning "No package.json found in development studio"
    fi

    cd ..
}

# Import data to new project
import_data_to_new_project() {
    local export_file="$1"
    local new_project_id="$2"

    print_status "Importing data to new project..."
    cd "${BACKUP_DIR}"

    # Import data to production dataset (default for new projects)
    print_status "Importing data to production dataset..."
    SANITY_PROJECT_ID="$new_project_id" npx sanity dataset import "./${export_file}" production --replace --allow-failing-assets

    cd ..
}

# Main execution
main() {
    print_status "Starting Sanity Development Studio setup..."
    echo

    check_prerequisites
    get_project_config

    echo
    print_status "This will:"
    print_status "1. Export your '${SOURCE_DATASET}' dataset from project '${SOURCE_PROJECT_ID}'"
    print_status "2. Create a NEW Sanity project: '${NEW_PROJECT_NAME}'"
    print_status "3. Create a new development studio in '${BACKUP_DIR}'"
    print_status "4. Import the exported data into the new project's production dataset"
    echo
    print_warning "This creates a completely separate Sanity project for testing!"
    echo

    read -p "Continue? (y/N): " -r
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cancelled by user"
        exit 0
    fi

    echo
    export_file=$(export_data)
    new_project_id=$(create_new_project)
    setup_dev_studio "$export_file" "$new_project_id"
    import_data_to_new_project "$export_file" "$new_project_id"

    echo
    print_success "Development studio setup completed!"
    echo
    print_status "New Sanity Project ID: ${new_project_id}"
    print_status "Development studio location: ${BACKUP_DIR}/"
    print_status "Dataset: production"
    print_status "Backup file: ${BACKUP_DIR}/${export_file}"
    echo
    print_status "To start your development studio:"
    echo "  cd ${BACKUP_DIR}"
    echo "  npm run dev"
    echo
    print_status "To re-import backup data:"
    echo "  cd ${BACKUP_DIR}"
    echo "  npm run import-backup"
    echo
    print_status "To deploy your studio:"
    echo "  cd ${BACKUP_DIR}"
    echo "  npm run deploy"
    echo
    print_warning "If you encounter dependency issues:"
    echo "1. Check package.json for version conflicts"
    echo "2. Try deleting node_modules and package-lock.json, then run npm install"
    echo "3. Ensure your Node.js version is compatible with Sanity"
    echo "4. Check the studio directory for any error messages"
    echo
    print_warning "Remember to check ${BACKUP_DIR}/.env and update any environment variables as needed"
    print_status "Your new project is completely separate from your original project!"
}

# Run main function
main "$@"