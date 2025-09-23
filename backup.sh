#!/bin/bash

# Sanity Studio Backup and Clone Script
# This script exports your production Sanity data and creates a development studio with the backup

set -e  # Exit on any error

# Configuration (will be updated after SANITY_DIR is determined)
PROJECT_ID=""
DATASET="production"
BACKUP_DIR="sanity-dev-backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
EXPORT_FILE="sanity-backup-${TIMESTAMP}.tar.gz"
SHOULD_IMPORT_DATA=true

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Determine Sanity directory
SANITY_DIR=""

# Check if we're already in a Sanity directory (has sanity.config.ts/js)
if [ -f "sanity.config.ts" ] || [ -f "sanity.config.js" ]; then
    SANITY_DIR="."
    print_status "Detected Sanity project in current directory"
elif [ -d "sanity" ]; then
    SANITY_DIR="sanity"
    print_status "Found 'sanity' subdirectory"
elif [ -d "cms" ]; then
    SANITY_DIR="cms"
    print_status "Found 'cms' subdirectory"
elif [ -d "studio" ]; then
    SANITY_DIR="studio"
    print_status "Found 'studio' subdirectory"
else
    print_error "No Sanity project found in current directory or common subdirectories (sanity, cms, studio)"
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

# Debug: Show the detected Sanity directory
print_status "Sanity directory detected: $SANITY_DIR"
print_status "Current working directory: $(pwd)"

# Load configuration from the determined Sanity directory
print_status "Loading configuration from $SANITY_DIR..."

# Try to get PROJECT_ID from .env first, then from sanity.config.js
PROJECT_ID=$(grep "SANITY_STUDIO_PROJECT_ID" "$SANITY_DIR/.env" 2>/dev/null | cut -d'=' -f2 || echo "")
if [ -z "$PROJECT_ID" ]; then
    # Extract from sanity.config.js
    PROJECT_ID=$(grep -o 'projectId:\s*"[^"]*"' "$SANITY_DIR/sanity.config.js" 2>/dev/null | sed 's/.*projectId:\s*"\([^"]*\)".*/\1/' || echo "")
fi

# Try to get DATASET from .env first, then from sanity.config.js
DATASET=$(grep "SANITY_STUDIO_DATASET" "$SANITY_DIR/.env" 2>/dev/null | cut -d'=' -f2 || echo "")
if [ -z "$DATASET" ]; then
    # Extract from sanity.config.js
    DATASET=$(grep -o 'dataset:\s*"[^"]*"' "$SANITY_DIR/sanity.config.js" 2>/dev/null | sed 's/.*dataset:\s*"\([^"]*\)".*/\1/' || echo "production")
fi

# Clean up the values
PROJECT_ID=$(echo "$PROJECT_ID" | tr -d '"' | xargs)
DATASET=$(echo "$DATASET" | tr -d '"' | tr '[:upper:]' '[:lower:]' | xargs)

print_status "Project ID: ${PROJECT_ID:-'(will use current project)'}"
print_status "Dataset: ${DATASET}"

# Check Node.js version
NODE_VERSION=$(node --version 2>/dev/null | sed 's/v//' || echo "")
if [ -n "$NODE_VERSION" ]; then
    print_status "Node.js version: $NODE_VERSION"
    # Check if Node.js version is supported by Sanity (>=20.19 <22 || >=22.12)
    if ! node -e "
        const version = '$NODE_VERSION';
        const [major, minor] = version.split('.').map(Number);
        const isSupported = (major === 20 && minor >= 19) || 
                           (major === 21) || 
                           (major === 22 && minor >= 12) || 
                           (major >= 23);
        process.exit(isSupported ? 0 : 1);
    " 2>/dev/null; then
        print_warning "Node.js version $NODE_VERSION is not officially supported by Sanity"
        print_warning "Sanity requires Node.js >=20.19 <22 || >=22.12"
        print_warning "Consider using Node.js 20.19+, 22.12+, or 23+ for best compatibility"
        echo
        read -p "Continue anyway? (y/N): " -r
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            print_status "Please upgrade Node.js and run the script again"
            exit 1
        fi
        print_warning "Proceeding with unsupported Node.js version..."
    fi
else
    print_error "Node.js not found. Please install Node.js first"
    exit 1
fi

# Check if Sanity CLI is available
if ! command -v npx sanity &> /dev/null; then
    print_error "Sanity CLI not found. Make sure you have npm/npx installed and Sanity project set up"
    exit 1
fi

# Check if Sanity is installed in the project directory
if [ ! -f "$SANITY_DIR/package.json" ] || ! grep -q '"sanity"' "$SANITY_DIR/package.json" 2>/dev/null || [ ! -d "$SANITY_DIR/node_modules" ]; then
    print_warning "Sanity is not installed as a dependency in $SANITY_DIR"
    print_status "Installing Sanity dependencies..."
    cd "$SANITY_DIR"
    
    if [ -f "package.json" ]; then
        # Clean up any problematic lock files first
        print_status "Cleaning up lock files..."
        rm -f package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null || true
        
        if command -v npm &> /dev/null; then
            print_status "Installing dependencies with npm..."
            if ! npm install --legacy-peer-deps; then
                print_warning "npm install with --legacy-peer-deps failed, trying with --force..."
                if ! npm install --force; then
                    print_error "Dependency installation failed. This is likely due to version conflicts."
                    print_error "You may need to manually resolve dependency conflicts in package.json"
                    print_error "Common solutions:"
                    print_error "1. Update styled-components to version 6.x"
                    print_error "2. Use 'npm install --legacy-peer-deps' manually"
                    print_error "3. Check for conflicting peer dependencies"
                    exit 1
                fi
            fi
        elif command -v pnpm &> /dev/null; then
            print_status "Installing dependencies with pnpm..."
            if ! pnpm install --legacy-peer-deps; then
                print_warning "pnpm install with --legacy-peer-deps failed, trying with --force..."
                if ! pnpm install --force; then
                    print_error "Dependency installation failed. This is likely due to version conflicts."
                    print_error "You may need to manually resolve dependency conflicts in package.json"
                    exit 1
                fi
            fi
        else
            print_error "Neither npm nor pnpm found. Please install dependencies manually."
            exit 1
        fi
    else
        print_error "No package.json found in $SANITY_DIR"
        exit 1
    fi
    
    cd ..
fi

print_status "Starting Sanity Studio backup and clone process..."

# Step 1: Create backup directory in project root
print_status "Creating backup directory: ${BACKUP_DIR}"
# Ensure we're in the project root for backup directory creation
PROJECT_ROOT="$(pwd)"
if [ "$SANITY_DIR" != "." ]; then
    # We're in a subdirectory, backup directory should be in project root
    mkdir -p "../${BACKUP_DIR}"
    # Store the relative path for when we're in the sanity directory
    BACKUP_DIR_FOR_EXPORT="../${BACKUP_DIR}"
    # Store the absolute path for when we're back in project root
    BACKUP_DIR_ABSOLUTE="${PROJECT_ROOT}/${BACKUP_DIR}"
else
    # We're already in the project root
    mkdir -p "${BACKUP_DIR}"
    BACKUP_DIR_FOR_EXPORT="${BACKUP_DIR}"
    BACKUP_DIR_ABSOLUTE="${PROJECT_ROOT}/${BACKUP_DIR}"
fi

# Step 2: Export Sanity data (PRIORITY - Core functionality)
print_status "Exporting Sanity dataset: ${DATASET}"
cd "$SANITY_DIR"

# Check if user is authenticated
print_status "Checking Sanity authentication..."
if ! npx sanity debug --secrets 2>/dev/null | grep -q "Auth token"; then
    print_warning "Not authenticated with Sanity. Please log in first."
    print_status "Running: npx sanity login"
    npx sanity login
fi

# Verify we're in a valid Sanity project context
print_status "Verifying Sanity project context..."
if ! npx sanity debug --secrets 2>/dev/null | grep -q "Project ID"; then
    print_warning "Sanity CLI doesn't recognize this as a valid project context."
    print_warning "This might be due to:"
    print_warning "1. Missing or invalid sanity.config.js/ts"
    print_warning "2. Sanity CLI version incompatibility"
    print_warning "3. Project structure issues"
    print_status "Trying to initialize Sanity context..."
    
    # Try to run a simple sanity command to initialize context
    if ! npx sanity --version >/dev/null 2>&1; then
        print_error "Sanity CLI is not working properly"
        exit 1
    fi
    
    # Try to run a basic command to see if it works
    print_status "Testing basic Sanity command..."
    if ! npx sanity dataset list >/dev/null 2>&1; then
        print_warning "Basic Sanity commands are not working. This might cause issues."
        print_warning "Continuing anyway - the export might still work..."
    fi
fi

# Try using global Sanity CLI first, then fall back to local
print_status "Attempting export with global Sanity CLI..."
if command -v sanity &> /dev/null; then
    print_status "Using global Sanity CLI..."
    if ! sanity dataset export "${DATASET}" "${BACKUP_DIR_FOR_EXPORT}/${EXPORT_FILE}" --project "${PROJECT_ID}"; then
        print_warning "Global Sanity CLI failed, trying local npx..."
        if ! npx sanity dataset export "${DATASET}" "${BACKUP_DIR_FOR_EXPORT}/${EXPORT_FILE}"; then
            print_error "Export failed. This might be due to:"
            print_error "1. Invalid or expired API token - run 'npx sanity login'"
            print_error "2. Insufficient permissions"
            print_error "3. Network connectivity issues"
            print_error "4. Invalid dataset name"
            print_error "5. Sanity CLI context issues"
            exit 1
        fi
    fi
else
    print_status "Using local npx Sanity CLI..."
    if ! npx sanity dataset export "${DATASET}" "${BACKUP_DIR_FOR_EXPORT}/${EXPORT_FILE}"; then
        print_error "Export failed. This might be due to:"
        print_error "1. Invalid or expired API token - run 'npx sanity login'"
        print_error "2. Insufficient permissions"
        print_error "3. Network connectivity issues"
        print_error "4. Invalid dataset name"
        print_error "5. Sanity CLI context issues"
        exit 1
    fi
fi

cd ..

if [ ! -f "${BACKUP_DIR_ABSOLUTE}/${EXPORT_FILE}" ]; then
    print_error "Export failed - backup file not created"
    print_error "Expected file: ${BACKUP_DIR_ABSOLUTE}/${EXPORT_FILE}"
    print_error "Current directory: $(pwd)"
    print_error "Files in backup directory:"
    ls -la "${BACKUP_DIR_ABSOLUTE}/" 2>/dev/null || echo "Backup directory not found"
    exit 1
fi

print_success "Data exported successfully to ${BACKUP_DIR_ABSOLUTE}/${EXPORT_FILE}"

# Step 3: Create development/workshop dataset and import data (PRIORITY - Core functionality)
print_status "Setting up dataset..."

# Use Sanity directory for CLI operations since that's where sanity.config.js is located
print_status "Using Sanity directory for CLI commands: ${SANITY_DIR}"
cd "${SANITY_DIR}"

# Check if development dataset already exists
print_status "Checking if 'development' dataset exists..."
if ! npx sanity dataset list 2>/dev/null | grep -q "^development$"; then
    # Development dataset doesn't exist, continue with creation
    print_status "Development dataset does not exist, will create it"
else
    # Development dataset exists
    print_warning "Dataset 'development' already exists!"
    echo
    print_status "You have the following options:"
    echo "1. Use existing 'development' dataset (keep current data)"
    echo "2. Replace existing 'development' dataset (overwrite with production data)"
    echo "3. Create new 'workshop' dataset (fresh dataset with production data)"
    echo
    read -p "Choose an option (1/2/3): " -r
    case $REPLY in
        1)
            print_status "Using existing 'development' dataset..."
            print_status "Skipping dataset creation and import"
            FINAL_DATASET="development"
            SHOULD_IMPORT_DATA=false
            ;;
        2)
            print_status "Replacing existing 'development' dataset..."
            print_status "This will completely overwrite the current data."
            read -p "Are you sure you want to continue? (y/N): " -r
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_status "Operation cancelled by user"
                print_status "You can manually import the data later with:"
                print_status "  npm run import-backup"
                cd "${PROJECT_ROOT}"
                exit 0
            fi
            print_status "Proceeding with dataset replacement..."
            FINAL_DATASET="development"
            SHOULD_IMPORT_DATA=true
            ;;
        3)
            print_status "Creating new 'workshop' dataset..."
            if ! npx sanity dataset create workshop --visibility public 2>/dev/null; then
                print_warning "Failed to create 'workshop' dataset (it may already exist)"
                print_status "Checking if 'workshop' dataset already exists..."
                
                if npx sanity dataset list 2>/dev/null | grep -q "^workshop$"; then
                    print_warning "Dataset 'workshop' already exists!"
                    echo
                    print_status "You have the following options for the workshop dataset:"
                    echo "1. Use existing 'workshop' dataset (keep current data)"
                    echo "2. Replace existing 'workshop' dataset (overwrite with production data)"
                    echo
                    read -p "Choose an option (1/2): " -r
                    case $REPLY in
                        1)
                            print_status "Using existing 'workshop' dataset..."
                            print_status "Skipping dataset creation and import"
                            FINAL_DATASET="workshop"
                            SHOULD_IMPORT_DATA=false
                            ;;
                        2)
                            print_status "Replacing existing 'workshop' dataset..."
                            print_status "This will completely overwrite the current data."
                            read -p "Are you sure you want to continue? (y/N): " -r
                            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                                print_status "Operation cancelled by user"
                                print_status "You can manually import the data later with:"
                                print_status "  npm run import-backup"
                                exit 0
                            fi
                            print_status "Proceeding with dataset replacement..."
                            FINAL_DATASET="workshop"
                            SHOULD_IMPORT_DATA=true
                            ;;
                        *)
                            print_error "Invalid option. Please run the script again and choose 1 or 2."
                            exit 1
                            ;;
                    esac
                else
                    print_error "Failed to create 'workshop' dataset. This might be due to:"
                    print_error "1. Invalid or expired API token - run 'npx sanity login'"
                    print_error "2. Insufficient permissions"
                    print_error "3. Network connectivity issues"
                    exit 1
                fi
            else
                print_status "Importing data to 'workshop' dataset..."
                if ! npx sanity dataset import "${BACKUP_DIR_FOR_EXPORT}/${EXPORT_FILE}" workshop --replace --allow-failing-assets; then
                    print_error "Failed to import data to 'workshop' dataset"
                    exit 1
                fi
                print_status "Workshop dataset created and data imported successfully"
                FINAL_DATASET="workshop"
            fi
            ;;
        *)
            print_error "Invalid option. Please run the script again and choose 1, 2, or 3."
            cd "${PROJECT_ROOT}"
            exit 1
            ;;
    esac
    # Skip the rest of the dataset creation logic since we handled it above
    cd "${PROJECT_ROOT}"
    print_success "Core backup process completed!"
    print_status "Data exported to: ${BACKUP_DIR_ABSOLUTE}/${EXPORT_FILE}"
    if [[ "$FINAL_DATASET" == "workshop" ]]; then
        print_status "New 'workshop' dataset created with your production data"
    else
        print_status "Using existing 'development' dataset with your production data"
    fi
    exit 0
fi

# Create development dataset since it doesn't exist
print_status "Creating 'development' dataset..."
if ! npx sanity dataset create development --visibility public; then
    print_warning "Failed to create 'development' dataset (it may already exist)"
    print_status "Proceeding with creating 'workshop' dataset instead..."
    
    if ! npx sanity dataset create workshop --visibility public 2>/dev/null; then
        print_warning "Failed to create 'workshop' dataset (it may already exist)"
        print_status "Checking if 'workshop' dataset already exists..."
        
        if npx sanity dataset list 2>/dev/null | grep -q "^workshop$"; then
            print_warning "Dataset 'workshop' already exists!"
            echo
            print_status "You have the following options for the workshop dataset:"
            echo "1. Use existing 'workshop' dataset (keep current data)"
            echo "2. Replace existing 'workshop' dataset (overwrite with production data)"
            echo
            read -p "Choose an option (1/2): " -r
            case $REPLY in
                1)
                    print_status "Using existing 'workshop' dataset..."
                    print_status "Skipping dataset creation and import"
                    FINAL_DATASET="workshop"
                    SHOULD_IMPORT_DATA=false
                    ;;
                2)
                    print_status "Replacing existing 'workshop' dataset..."
                    print_status "This will completely overwrite the current data."
                    read -p "Are you sure you want to continue? (y/N): " -r
                    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                        print_status "Operation cancelled by user"
                        print_status "You can manually import the data later with:"
                        print_status "  npm run import-backup"
                        exit 0
                    fi
                    print_status "Proceeding with dataset replacement..."
                    FINAL_DATASET="workshop"
                    SHOULD_IMPORT_DATA=true
                    ;;
                *)
                    print_error "Invalid option. Please run the script again and choose 1 or 2."
                    exit 1
                    ;;
            esac
        else
            print_error "Failed to create 'workshop' dataset. This might be due to:"
            print_error "1. Invalid or expired API token - run 'npx sanity login'"
            print_error "2. Insufficient permissions"
            print_error "3. Network connectivity issues"
            exit 1
        fi
    else
        print_status "Workshop dataset created successfully"
        FINAL_DATASET="workshop"
    fi
else
    # Development dataset was created successfully
    FINAL_DATASET="development"
fi

# Import the backup data to the created dataset (only if we should import data)
if [[ "$SHOULD_IMPORT_DATA" == "true" ]]; then
    if [[ "$FINAL_DATASET" == "workshop" ]]; then
        print_status "Importing backup data to 'workshop' dataset..."
        if ! npx sanity dataset import "${BACKUP_DIR_FOR_EXPORT}/${EXPORT_FILE}" workshop --replace --allow-failing-assets; then
            print_error "Failed to import data to 'workshop' dataset"
            exit 1
        fi
    else
        print_status "Importing backup data to 'development' dataset..."
        if ! npx sanity dataset import "${BACKUP_DIR_FOR_EXPORT}/${EXPORT_FILE}" development --replace --allow-failing-assets; then
            print_error "Failed to import data to 'development' dataset"
            exit 1
        fi
    fi
else
    print_status "Skipping data import (using existing dataset)"
fi

# Determine which dataset is being used for the final message
# FINAL_DATASET should already be set from the dataset creation logic above
# If it's not set, default to development
if [ -z "$FINAL_DATASET" ]; then
    FINAL_DATASET="development"
fi

print_success "Core backup process completed!"
print_status "Data exported to: ${BACKUP_DIR_ABSOLUTE}/${EXPORT_FILE}"
if [[ "$FINAL_DATASET" == "workshop" ]]; then
    print_status "New 'workshop' dataset created with your production data"
else
    print_status "New 'development' dataset created with your production data"
fi

echo
print_status "Would you like to create a development studio clone? (Optional)"
echo "This will copy your studio files and set up a development environment."
echo "Note: This step may encounter dependency issues that you'll need to resolve manually."
echo

# Check if this is a Next.js app with embedded Sanity studio
if [ -f "next.config.js" ] || [ -f "next.config.ts" ] || [ -f "next.config.mjs" ]; then
    print_warning "Detected Next.js application with embedded Sanity studio."
    echo
    print_status "Due to the complexity of duplicating the entire Next.js project structure,"
    print_status "it's recommended to handle the development studio by updating environment variables instead."
    echo
    print_status "To switch to your development dataset, update your environment variables:"
    if [[ "$FINAL_DATASET" == "workshop" ]]; then
        echo "  SANITY_STUDIO_DATASET=workshop"
    else
        echo "  SANITY_STUDIO_DATASET=development"
    fi
    echo
    print_status "You can also create a separate .env.development file with:"
    if [[ "$FINAL_DATASET" == "workshop" ]]; then
        echo "  SANITY_STUDIO_DATASET=workshop"
    else
        echo "  SANITY_STUDIO_DATASET=development"
    fi
    echo "  # Add any other development-specific environment variables"
    echo
    print_status "Then run your Next.js app with: npm run dev (or your preferred dev command)"
    echo
    read -p "Skip development studio clone creation? (Y/n): " -r
    if [[ $REPLY =~ ^[Nn]$ ]]; then
        print_status "Proceeding with development studio clone creation anyway..."
        print_warning "This may not work properly with the embedded Next.js structure."
    else
        print_status "Skipping development studio clone creation for Next.js app"
        print_status "Your backup and dataset setup is complete!"
        exit 0
    fi
else
    read -p "Create development studio clone? (y/N): " -r
fi

if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_status "Creating development studio clone..."
    
    # Ensure we're in the correct directory (project root)
    print_status "Ensuring correct working directory..."
    print_status "Current working directory: $(pwd)"
    
    # If we're in the sanity subdirectory, go back to project root
    if [ -f "sanity.config.ts" ] || [ -f "sanity.config.js" ]; then
        print_status "Detected we're in sanity subdirectory, moving to project root..."
        cd ..
    fi
    
    print_status "Working directory after adjustment: $(pwd)"
    
    # Now check if we can find the Sanity directory
    if [ ! -d "$SANITY_DIR" ]; then
        print_error "Cannot find Sanity directory '$SANITY_DIR' from current location: $(pwd)"
        print_error "Please run this script from the project root directory"
        exit 1
    fi
    
    # Copy Sanity studio to backup directory (excluding node_modules)
    print_status "Copying Sanity studio to backup directory (excluding node_modules)..."
    print_status "Source directory: $SANITY_DIR"
    print_status "Target directory: ${BACKUP_DIR}/sanity-studio/"
    
    # Check if source directory exists
    print_status "Checking source directory: $SANITY_DIR"
    print_status "Current working directory: $(pwd)"
    print_status "Full path to source: $(pwd)/$SANITY_DIR"
    
    if [ ! -d "$SANITY_DIR" ]; then
        print_error "Source directory '$SANITY_DIR' does not exist"
        print_error "Current working directory: $(pwd)"
        print_error "Please ensure you're running this script from the correct directory"
        exit 1
    fi
    
    # Remove existing sanity-studio directory if it exists
    if [ -d "${BACKUP_DIR}/sanity-studio" ]; then
        print_status "Removing existing sanity-studio directory..."
        rm -rf "${BACKUP_DIR}/sanity-studio"
    fi
    
    # Create the target directory
    mkdir -p "${BACKUP_DIR}/sanity-studio"
    
    # Try rsync first, fallback to cp if it fails
    if command -v rsync >/dev/null 2>&1; then
        print_status "Using rsync for efficient copying..."
        if ! rsync -av --exclude='node_modules' --exclude='.git' --exclude='dist' --exclude='build' --exclude='sanity-dev-backup' "$SANITY_DIR/" "${BACKUP_DIR}/sanity-studio/"; then
            print_warning "rsync failed, falling back to cp..."
            find "$SANITY_DIR" -maxdepth 1 -not -name "sanity-dev-backup" -not -name "." -exec cp -r {} "${BACKUP_DIR}/sanity-studio/" \;
        fi
    else
        print_status "rsync not available, using cp..."
        find "$SANITY_DIR" -maxdepth 1 -not -name "sanity-dev-backup" -not -name "." -exec cp -r {} "${BACKUP_DIR}/sanity-studio/" \;
    fi

    # Modify the copied studio for development
print_status "Configuring development studio..."
cd "${BACKUP_DIR}/sanity-studio"

# Create a new .env file for development
cat > .env << EOF
# Development Sanity Studio Configuration
# This is a copy of your production studio configured for development

SANITY_STUDIO_PROJECT_ID=${PROJECT_ID}
SANITY_STUDIO_DATASET=${FINAL_DATASET}

# Add any other environment variables from your original .env file
EOF

# Update package.json to include import script
if [ -f "package.json" ]; then
    # Add import script to package.json
        npx json -I -f package.json -e 'this.scripts["import-backup"]="sanity dataset import ../'"${EXPORT_FILE}"' '"${FINAL_DATASET}"' --replace"' 2>/dev/null || true
fi

cd ../..

    # Install dependencies in development studio
    print_status "Installing dependencies in development studio..."
cd "${BACKUP_DIR}/sanity-studio"

    if [ -f "package.json" ]; then
        # Clean up any problematic lock files first
        print_status "Cleaning up lock files..."
        rm -f package-lock.json yarn.lock pnpm-lock.yaml 2>/dev/null || true
        
        if command -v npm &> /dev/null; then
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
        elif command -v pnpm &> /dev/null; then
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

cd ../..

    print_success "Development studio clone created!"
print_status "Your development studio is located at: ${BACKUP_DIR}/sanity-studio"
echo
print_status "Next steps:"
echo "1. cd ${BACKUP_DIR}/sanity-studio"
    echo "2. npm run dev (or pnpm run dev)"
    echo
    print_warning "If you encounter dependency issues:"
    echo "1. Check package.json for version conflicts"
    echo "2. Try deleting node_modules and package-lock.json, then run npm install"
    echo "3. Ensure your Node.js version is compatible with Sanity"
    echo "4. Check the studio directory for any error messages"
else
    print_status "Skipping development studio clone creation"
    print_status "You can manually copy your studio files later if needed"
fi

echo
if [[ "$FINAL_DATASET" == "workshop" ]]; then
    print_status "Your development studio will use the 'workshop' dataset with imported data"
else
print_status "Your development studio will use the 'development' dataset with imported data"
fi
print_warning "Remember to update any environment variables as needed"