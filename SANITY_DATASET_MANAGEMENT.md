# Sanity Dataset Management Guide

This guide explains how to export and import your Sanity dataset for backup, migration, or development purposes.

## Prerequisites

- Sanity CLI installed (`npm install -g @sanity/cli`)
- Authenticated with Sanity (`sanity login`)
- Access to your Sanity project

## Export Dataset

Export your dataset to a compressed tarball file:

```bash
# Export to current directory
sanity dataset export <dataset-name> backup-$(date +%Y%m%d_%H%M%S).tar.gz

# Export with specific options
sanity dataset export production backup.tar.gz --no-assets --no-drafts
```

### Export Options

- `--no-assets`: Export only documents, skip image assets
- `--no-drafts`: Export only published versions
- `--raw`: Extract only documents without rewriting asset references
- `--types products,shops`: Export only specific document types
- `--overwrite`: Overwrite existing files

## Import Dataset

Import a dataset from a tarball or ndjson file:

```bash
# Import from tarball
sanity dataset import backup.tar.gz target-dataset --replace

# Import from extracted folder
sanity dataset import ./backup-folder target-dataset --replace

# Import from remote URL
sanity dataset import https://example.com/backup.tar.gz target-dataset --replace
```

### Import Options

- `--replace`: Replace existing documents with same IDs
- `--missing`: Skip documents that already exist
- `--allow-failing-assets`: Skip assets that can't be uploaded
- `--replace-assets`: Don't reuse existing assets

## Quick Management Script

Here's a simple script to automate common dataset operations:

```bash
#!/bin/bash

# Sanity Dataset Management Script
# Usage: ./dataset-manager.sh [export|import|list] [options]

PROJECT_DIR="sanity"  # Adjust if your Sanity project is in a different directory
BACKUP_DIR="./sanity-backups"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

case "$1" in
  "export")
    DATASET_NAME=${2:-"production"}
    BACKUP_FILE="$BACKUP_DIR/backup-${DATASET_NAME}-$(date +%Y%m%d_%H%M%S).tar.gz"
    
    echo "📦 Exporting dataset: $DATASET_NAME"
    echo "💾 Saving to: $BACKUP_FILE"
    
    cd "$PROJECT_DIR" || exit 1
    sanity dataset export "$DATASET_NAME" "../$BACKUP_FILE"
    
    if [ $? -eq 0 ]; then
      echo "✅ Export completed successfully!"
      echo "📁 Backup saved: $BACKUP_FILE"
    else
      echo "❌ Export failed!"
      exit 1
    fi
    ;;
    
  "import")
    BACKUP_FILE="$2"
    TARGET_DATASET=${3:-"development"}
    
    if [ -z "$BACKUP_FILE" ]; then
      echo "❌ Please provide backup file path"
      echo "Usage: $0 import <backup-file> [target-dataset]"
      exit 1
    fi
    
    echo "📥 Importing dataset from: $BACKUP_FILE"
    echo "🎯 Target dataset: $TARGET_DATASET"
    
    cd "$PROJECT_DIR" || exit 1
    sanity dataset import "../$BACKUP_FILE" "$TARGET_DATASET" --replace
    
    if [ $? -eq 0 ]; then
      echo "✅ Import completed successfully!"
    else
      echo "❌ Import failed!"
      exit 1
    fi
    ;;
    
  "list")
    echo "📋 Available datasets:"
    cd "$PROJECT_DIR" || exit 1
    sanity dataset list
    ;;
    
  "copy")
    SOURCE_DATASET=${2:-"production"}
    TARGET_DATASET=${3:-"development"}
    
    echo "📋 Copying dataset: $SOURCE_DATASET → $TARGET_DATASET"
    cd "$PROJECT_DIR" || exit 1
    sanity dataset copy "$SOURCE_DATASET" "$TARGET_DATASET"
    ;;
    
  *)
    echo "Sanity Dataset Management Script"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  export [dataset-name]     Export dataset to backup file"
    echo "  import <backup-file> [target-dataset]  Import from backup file"
    echo "  list                      List all datasets"
    echo "  copy [source] [target]    Copy dataset to another dataset"
    echo ""
    echo "Examples:"
    echo "  $0 export production"
    echo "  $0 import ./backups/backup-production-20240101_120000.tar.gz development"
    echo "  $0 list"
    echo "  $0 copy production development"
    ;;
esac
```

## Common Workflows

### 1. Backup Production Data

```bash
# Create timestamped backup
sanity dataset export production backup-$(date +%Y%m%d_%H%M%S).tar.gz

# Or use the script
./dataset-manager.sh export production
```

### 2. Create Development Environment

```bash
# Copy production to development
sanity dataset copy production development

# Or import from backup
sanity dataset import backup-production.tar.gz development --replace
```

### 3. Migrate Between Projects

```bash
# Export from source project
cd source-project/sanity
sanity dataset export production ../migration-backup.tar.gz

# Import to target project
cd target-project/sanity
sanity dataset import ../migration-backup.tar.gz production --replace
```

### 4. Clean Development Dataset

```bash
# Export only published content (no drafts)
sanity dataset export production clean-backup.tar.gz --no-drafts

# Import to clean development dataset
sanity dataset import clean-backup.tar.gz development --replace
```

## Best Practices

1. **Always backup before importing** - Use `--replace` carefully
2. **Use descriptive filenames** - Include dataset name and timestamp
3. **Test imports on development first** - Verify data integrity
4. **Consider asset handling** - Use `--no-assets` for faster exports if assets aren't needed
5. **Monitor import progress** - Large datasets may take time to import

## Troubleshooting

- **"Dataset already exists"** - Use `--replace` flag or delete existing dataset first
- **"Project identifier not found"** - Ensure you're in the correct Sanity project directory
- **"Authentication required"** - Run `sanity login` first
- **Import fails** - Check file permissions and ensure backup file is valid

## Script Setup

1. Save the script as `dataset-manager.sh`
2. Make it executable: `chmod +x dataset-manager.sh`
3. Adjust `PROJECT_DIR` variable if needed
4. Run: `./dataset-manager.sh` for usage instructions

---

For more advanced options, see the [Sanity CLI Dataset Documentation](https://www.sanity.io/docs/cli-reference/dataset).
