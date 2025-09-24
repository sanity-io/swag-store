#!/bin/bash

# Sanity Dataset Management Script
# Usage: ./dataset-manager.sh [export|import|list|copy] [options]

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
    echo "  $0 import ./sanity-backups/backup-production-20240101_120000.tar.gz development"
    echo "  $0 list"
    echo "  $0 copy production development"
    ;;
esac
