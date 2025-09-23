# Sanity Studio Backup and Clone Script

This script creates a development copy of your Sanity studio by exporting your production data and setting up a separate development environment with a `development` dataset.

## 🎯 Purpose

The `backup-and-clone-studio.sh` script allows you to:
- **Export** your production Sanity data
- **Clone** your studio configuration
- **Create** a development dataset
- **Import** production data into the development dataset
- **Set up** a complete development environment

## 🔄 How It Works

### Step-by-Step Process

1. **Detects Sanity Directory**
   - Checks if current directory is a Sanity project (has `sanity.config.ts/js`)
   - Looks for `sanity/` subdirectory
   - Asks user to specify path if neither is found
   - Validates the Sanity project structure

2. **Validates Environment**
   - Verifies Sanity CLI is available
   - Reads project configuration from `.env`

3. **Exports Production Data**
   - Exports your current dataset (defaults to `production`)
   - Creates timestamped backup file: `sanity-backup-YYYYMMDD_HHMMSS.tar.gz`

4. **Clones Studio Configuration**
   - Copies entire Sanity directory to `sanity-dev-backup/sanity-studio/`
   - Preserves all schemas, plugins, and configuration

5. **Configures Development Environment**
   - Creates new `.env` file pointing to `development` dataset
   - Adds `import-backup` script to `package.json`
   - Uses same project ID but different dataset

6. **Sets Up Development Dataset**
   - Checks if `development` dataset already exists
   - If exists, offers three options:
     - Use existing dataset (keep current data)
     - Replace existing dataset (overwrite with production data)
     - Create new 'workshop' dataset (fresh dataset with production data)
   - Creates `development` dataset if it doesn't exist
   - **Fallback**: If `development` creation fails, automatically creates `workshop` dataset
   - Imports exported data only when replacing or creating dataset

## 📁 File Structure After Running

```
sanity-dev-backup/
├── sanity-studio/                    # Cloned studio
│   ├── .env                         # Points to development dataset
│   ├── package.json                 # With import-backup script
│   ├── schemaTypes/                 # Your schemas
│   ├── plugins/                     # Your plugins
│   └── ...                          # All other studio files
└── sanity-backup-20241218_143022.tar.gz  # Exported data
```

## 🚀 Usage

### Prerequisites

- Node.js and npm installed
- Sanity CLI available (`npx sanity --version`)
- Existing Sanity project (in current directory, `sanity/` subdirectory, or custom path)
- `.env` file in Sanity directory (optional)

### Running the Script

1. **Make the script executable:**
   ```bash
   chmod +x backup-and-clone-studio.sh
   ```

2. **Run from any of these locations:**
   ```bash
   # From Sanity project root (has sanity.config.ts/js)
   ./backup-and-clone-studio.sh
   
   # From parent directory (has sanity/ subdirectory)
   ./backup-and-clone-studio.sh
   
   # From anywhere (script will ask for Sanity directory path)
   ./backup-and-clone-studio.sh
   ```

3. **Start your development studio:**
   ```bash
   cd sanity-dev-backup/sanity-studio
   npm run dev
   ```

## ⚙️ Configuration

### Environment Variables

The script reads from `sanity/.env`:

```bash
SANITY_STUDIO_PROJECT_ID=your-project-id    # Optional
SANITY_STUDIO_DATASET=production            # Defaults to "production"
```

### Script Variables

You can modify these at the top of the script:

```bash
BACKUP_DIR="sanity-dev-backup"              # Output directory
TIMESTAMP=$(date +%Y%m%d_%H%M%S)           # Timestamp format
EXPORT_FILE="sanity-backup-${TIMESTAMP}.tar.gz"  # Backup filename
```

## 📋 Available Scripts

After running, you'll have these scripts in `sanity-dev-backup/sanity-studio/`:

```bash
# Start the development studio
npm run dev

# Re-import the backup data
npm run import-backup

# Standard Sanity scripts
npm run build
npm run deploy
```

## 🔧 What Gets Configured

### New `.env` File
```bash
# Development Sanity Studio Configuration
# This is a copy of your production studio configured for development

SANITY_STUDIO_PROJECT_ID=your-project-id
SANITY_STUDIO_DATASET=development

# Add any other environment variables from your original .env file
```

### Updated `package.json`
Adds an `import-backup` script:
```json
{
  "scripts": {
    "import-backup": "sanity dataset import ../sanity-backup-YYYYMMDD_HHMMSS.tar.gz development --replace"
  }
}
```

## ✅ Benefits

- **Safe Development**: Work with real data without affecting production
- **Easy Setup**: One command creates complete development environment
- **Data Preservation**: Complete backup of your production data
- **Same Project**: Uses existing project with different dataset
- **Easy Reset**: Re-import data anytime with `npm run import-backup`
- **Dataset Safety**: Multiple options for handling existing datasets
- **User Control**: Choose to use, replace, or manage datasets visually
- **Multiple Dataset Options**: Create workshop datasets for different testing scenarios

## ⚠️ Important Notes

### Dataset Management
- Creates `development` dataset in your **existing** project
- Uses same project ID as production
- Data is completely separate from production dataset

### Data Safety
- Production data is never modified
- Development dataset can be safely deleted and recreated
- Backup file contains complete data export

### Environment Variables
- Script preserves additional environment variables from original `.env`
- You may need to update some variables for development use
- Check `sanity-dev-backup/sanity-studio/.env` after running

## 🛠️ Troubleshooting

### "Sanity CLI not found"
```bash
# Install Sanity CLI globally
npm install -g @sanity/cli

# Or use npx (recommended)
npx @sanity/cli --version
```

### "No Sanity project found"
- The script will automatically detect Sanity projects in:
  - Current directory (if it contains `sanity.config.ts` or `sanity.config.js`)
  - `sanity/` subdirectory
- If neither is found, the script will ask you to specify the path
- Make sure the directory you specify contains a valid Sanity project

### "Export failed - backup file not created"
- Check your internet connection
- Verify you have access to the dataset
- Ensure the dataset exists and has data

### "Dataset 'development' already exists!"
- The script will offer three options:
  1. **Use existing dataset**: Keep your current development data
  2. **Replace existing dataset**: Overwrite with fresh production data
  3. **Create new 'workshop' dataset**: Fresh dataset with production data
- Choose the option that best fits your needs

### "Failed to create 'development' dataset"
- The script will automatically fall back to creating a 'workshop' dataset
- This happens when the development dataset already exists but wasn't detected
- The script will update the `.env` file to use the workshop dataset
- This is a normal fallback behavior and not an error

### "Failed to create 'workshop' dataset"
- If the workshop dataset also already exists, the script will prompt you with options:
  1. **Use existing workshop dataset**: Keep your current workshop data
  2. **Replace existing workshop dataset**: Overwrite with fresh production data
- Choose the option that best fits your needs

## 🔄 Re-importing Data

To refresh your development data with latest production data:

```bash
cd sanity-dev-backup/sanity-studio
npm run import-backup
```

This will:
1. Delete existing development dataset
2. Re-import the backup data
3. Preserve all your development changes

## 🧹 Cleanup

To remove the development environment:

```bash
# Delete the development dataset
cd sanity-dev-backup/sanity-studio
npx sanity dataset delete development

# Delete the entire backup directory
cd ../..
rm -rf sanity-dev-backup/
```

## 📊 Example Output

### First Run (No Existing Dataset)
```
[INFO] Starting Sanity Studio backup and clone process...
[INFO] Detected Sanity project in current directory
[INFO] Loading configuration from .
[INFO] Project ID: l3u4li5b
[INFO] Dataset: production
[INFO] Creating backup directory: sanity-dev-backup
[INFO] Exporting Sanity dataset: production
[INFO] Using Project ID: l3u4li5b
[SUCCESS] Data exported successfully to sanity-dev-backup/sanity-backup-20241218_143022.tar.gz
[INFO] Copying Sanity studio to backup directory...
[INFO] Configuring development studio...
[INFO] Setting up development dataset...
[INFO] Checking if 'development' dataset exists...
[INFO] Creating 'development' dataset...
[INFO] Importing backup data to development dataset...
[SUCCESS] Backup and clone process completed!
[INFO] Your development studio is located at: sanity-dev-backup/sanity-studio
[INFO] Exported data is located at: sanity-dev-backup/sanity-backup-20241218_143022.tar.gz

[INFO] Next steps:
1. cd sanity-dev-backup/sanity-studio
2. npm install (if needed)
3. npm run dev

[INFO] Your development studio will use the 'development' dataset with imported data
[WARNING] Remember to update any environment variables in sanity-dev-backup/sanity-studio/.env as needed
```

### Directory Detection Examples

#### From Sanity Project Root
```
[INFO] Starting Sanity Studio backup and clone process...
[INFO] Detected Sanity project in current directory
[INFO] Loading configuration from .
[INFO] Project ID: l3u4li5b
[INFO] Dataset: production
```

#### From Parent Directory
```
[INFO] Starting Sanity Studio backup and clone process...
[INFO] Found 'sanity' subdirectory
[INFO] Loading configuration from sanity
[INFO] Project ID: l3u4li5b
[INFO] Dataset: production
```

#### Custom Directory Path
```
[INFO] Starting Sanity Studio backup and clone process...
[ERROR] No Sanity project found in current directory or 'sanity' subdirectory

[INFO] Please specify the path to your Sanity directory:
Enter path to Sanity directory: /path/to/my-sanity-project
[SUCCESS] Using Sanity directory: /path/to/my-sanity-project
[INFO] Loading configuration from /path/to/my-sanity-project
[INFO] Project ID: l3u4li5b
[INFO] Dataset: production
```

### Subsequent Runs (Dataset Exists - Option 1: Use Existing)
```
[INFO] Starting Sanity Studio backup and clone process...
[INFO] Creating backup directory: sanity-dev-backup
[INFO] Exporting Sanity dataset: production
[INFO] Using Project ID: l3u4li5b
[SUCCESS] Data exported successfully to sanity-dev-backup/sanity-backup-20241218_143022.tar.gz
[INFO] Copying Sanity studio to backup directory...
[INFO] Configuring development studio...
[INFO] Setting up development dataset...
[INFO] Checking if 'development' dataset exists...
[WARNING] Dataset 'development' already exists!

[INFO] You have the following options:
1. Use existing 'development' dataset (keep current data)
2. Replace existing 'development' dataset (overwrite with production data)
3. Open Sanity Dataset Workshop (manage datasets visually)

Choose an option (1/2/3): 1
[INFO] Using existing 'development' dataset...
[INFO] Skipping dataset creation and import
[INFO] Skipping data import (using existing dataset)
[SUCCESS] Backup and clone process completed!
```

### Subsequent Runs (Dataset Exists - Option 2: Replace)
```
[INFO] Starting Sanity Studio backup and clone process...
[INFO] Creating backup directory: sanity-dev-backup
[INFO] Exporting Sanity dataset: production
[INFO] Using Project ID: l3u4li5b
[SUCCESS] Data exported successfully to sanity-dev-backup/sanity-backup-20241218_143022.tar.gz
[INFO] Copying Sanity studio to backup directory...
[INFO] Configuring development studio...
[INFO] Setting up development dataset...
[INFO] Checking if 'development' dataset exists...
[WARNING] Dataset 'development' already exists!

[INFO] You have the following options:
1. Use existing 'development' dataset (keep current data)
2. Replace existing 'development' dataset (overwrite with production data)
3. Open Sanity Dataset Workshop (manage datasets visually)

Choose an option (1/2/3): 2
[INFO] Replacing existing 'development' dataset...
[INFO] This will completely overwrite the current data.
Are you sure you want to continue? (y/N): y
[INFO] Proceeding with dataset replacement...
[INFO] Importing backup data to development dataset...
[SUCCESS] Backup and clone process completed!
```

### Subsequent Runs (Dataset Exists - Option 3: Create Workshop Dataset)
```
[INFO] Starting Sanity Studio backup and clone process...
[INFO] Creating backup directory: sanity-dev-backup
[INFO] Exporting Sanity dataset: production
[INFO] Using Project ID: l3u4li5b
[SUCCESS] Data exported successfully to sanity-dev-backup/sanity-backup-20241218_143022.tar.gz
[INFO] Copying Sanity studio to backup directory...
[INFO] Configuring development studio...
[INFO] Setting up development dataset...
[INFO] Checking if 'development' dataset exists...
[WARNING] Dataset 'development' already exists!

[INFO] You have the following options:
1. Use existing 'development' dataset (keep current data)
2. Replace existing 'development' dataset (overwrite with production data)
3. Create new 'workshop' dataset (fresh dataset with production data)

Choose an option (1/2/3): 3
[INFO] Creating new 'workshop' dataset...
[INFO] Importing data to 'workshop' dataset...
[INFO] Updating .env to use 'workshop' dataset...
[INFO] Data already imported to workshop dataset
[SUCCESS] Backup and clone process completed!
[INFO] Your development studio is located at: sanity-dev-backup/sanity-studio
[INFO] Exported data is located at: sanity-dev-backup/sanity-backup-20241218_143022.tar.gz

[INFO] Next steps:
1. cd sanity-dev-backup/sanity-studio
2. npm install (if needed)
3. npm run dev

[INFO] Your development studio will use the 'workshop' dataset with imported data
[WARNING] Remember to update any environment variables in sanity-dev-backup/sanity-studio/.env as needed
```

### Fallback Behavior (Development Dataset Creation Fails)
```
[INFO] Starting Sanity Studio backup and clone process...
[INFO] Detected Sanity project in current directory
[INFO] Loading configuration from .
[INFO] Project ID: l3u4li5b
[INFO] Dataset: production
[INFO] Creating backup directory: sanity-dev-backup
[INFO] Exporting Sanity dataset: production
[INFO] Using Project ID: l3u4li5b
[SUCCESS] Data exported successfully to sanity-dev-backup/sanity-backup-20241218_143022.tar.gz
[INFO] Copying Sanity studio to backup directory...
[INFO] Configuring development studio...
[INFO] Setting up development dataset...
[INFO] Checking if 'development' dataset exists...
[INFO] Creating 'development' dataset...
[WARNING] Failed to create 'development' dataset (it may already exist)
[INFO] Proceeding with creating 'workshop' dataset instead...
[INFO] Updating .env to use 'workshop' dataset...
[INFO] Importing backup data to workshop dataset...
[SUCCESS] Core backup process completed!
[INFO] Data exported to: sanity-dev-backup/sanity-backup-20241218_143022.tar.gz
[INFO] New dataset 'workshop' created with your production data
[INFO] Your development studio is located at: sanity-dev-backup/sanity-studio
[INFO] Exported data is located at: sanity-dev-backup/sanity-backup-20241218_143022.tar.gz

[INFO] Next steps:
1. cd sanity-dev-backup/sanity-studio
2. npm install (if needed)
3. npm run dev

[INFO] Your development studio will use the 'workshop' dataset with imported data
[WARNING] Remember to update any environment variables in sanity-dev-backup/sanity-studio/.env as needed
```

### Workshop Dataset Options (Both Datasets Exist)
```
[INFO] Starting Sanity Studio backup and clone process...
[INFO] Detected Sanity project in current directory
[INFO] Loading configuration from .
[INFO] Project ID: l3u4li5b
[INFO] Dataset: production
[INFO] Creating backup directory: sanity-dev-backup
[INFO] Exporting Sanity dataset: production
[INFO] Using Project ID: l3u4li5b
[SUCCESS] Data exported successfully to sanity-dev-backup/sanity-backup-20241218_143022.tar.gz
[INFO] Copying Sanity studio to backup directory...
[INFO] Configuring development studio...
[INFO] Setting up development dataset...
[INFO] Checking if 'development' dataset exists...
[INFO] Creating 'development' dataset...
[WARNING] Failed to create 'development' dataset (it may already exist)
[INFO] Proceeding with creating 'workshop' dataset instead...
[WARNING] Failed to create 'workshop' dataset (it may already exist)

[INFO] The 'workshop' dataset already exists. You have the following options:
1. Use existing 'workshop' dataset (keep current data)
2. Replace existing 'workshop' dataset (overwrite with production data)

Choose an option (1/2): 2
[INFO] Replacing existing 'workshop' dataset...
[INFO] This will completely overwrite the current data.
Are you sure you want to continue? (y/N): y
[INFO] Proceeding with dataset replacement...
[INFO] Importing backup data to workshop dataset...
[SUCCESS] Core backup process completed!
[INFO] Data exported to: sanity-dev-backup/sanity-backup-20241218_143022.tar.gz
[INFO] New dataset 'workshop' created with your production data
[INFO] Your development studio is located at: sanity-dev-backup/sanity-studio
[INFO] Exported data is located at: sanity-dev-backup/sanity-backup-20241218_143022.tar.gz

[INFO] Next steps:
1. cd sanity-dev-backup/sanity-studio
2. npm install (if needed)
3. npm run dev

[INFO] Your development studio will use the 'workshop' dataset with imported data
[WARNING] Remember to update any environment variables in sanity-dev-backup/sanity-studio/.env as needed
```

## 🔗 Related Scripts

- **`sanity-dev-setup.sh`**: Creates a completely new Sanity project for testing
- **`backup-and-clone-studio.sh`**: Creates development dataset in existing project (this script)

## 📝 Differences from `sanity-dev-setup.sh`

| Feature | `backup-and-clone-studio.sh` | `sanity-dev-setup.sh` |
|---------|------------------------------|------------------------|
| **Project** | Uses existing project | Creates new project |
| **Dataset** | Creates `development` dataset | Uses `production` dataset |
| **Isolation** | Same project, different dataset | Completely separate project |
| **Risk** | Low (dataset-level isolation) | None (project-level isolation) |
| **Use Case** | Development with same project | Testing with new project |
| **Cleanup** | Delete dataset | Delete entire project |

Choose the script that best fits your needs! 🎯
