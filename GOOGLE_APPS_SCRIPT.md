# Google Apps Script for Korean Eonni

This script does two things:
1. **Syncs photo links** from your Google Drive folder to the sheet
2. **Syncs products** from the sheet to your website

## Setup Instructions

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1rm5beP1P_eCIshYdaJBoyUmzEiOB8Ox3UssMhPv6K1I
2. Go to **Extensions** → **Apps Script**
3. Delete any existing code and paste the ENTIRE script below
4. Save the script (Ctrl+S or Cmd+S)
5. Run `onOpen()` once manually to create the menu
6. Set up triggers (see below)

## The Complete Script

```javascript
// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  SHEET_NAME: 'Загальний',
  PHOTO_FOLDER_ID: '1l0OnOXF3O8W1mGzg0vNz_aY50IH3rrXc',
  WEBSITE_SYNC_URL: 'https://www.eonni.com.ua/api/sync-sheet',
  HEADER_ROWS: 1,
  NAME_COL: 1,        // Column A
  OUT_START_COL: 24,  // Column X (where photos start) — UPDATED 2026-05-06: was 20 (T) before description split into 6 sections
  OUT_COUNT: 12,      // 12 photo columns (X through AI)
};

// ============================================
// MENU
// ============================================
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🛍️ Eonni')
    .addItem('1. Sync Photo Links from Drive', 'syncProductPhotoLinks')
    .addItem('2. Sync Products to Website', 'syncToWebsite')
    .addSeparator()
    .addItem('🔄 Full Sync (Photos + Website)', 'fullSync')
    .addToUi();
}

// ============================================
// FULL SYNC (runs both)
// ============================================
function fullSync() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  ss.toast('Step 1/2: Syncing photo links...', '🔄 Full Sync', -1);
  syncProductPhotoLinks();
  
  ss.toast('Step 2/2: Syncing to website...', '🔄 Full Sync', -1);
  syncToWebsite();
  
  ss.toast('Full sync completed!', '✅ Done', 5);
}

// ============================================
// SYNC PHOTO LINKS FROM GOOGLE DRIVE
// ============================================
function syncProductPhotoLinks() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(CONFIG.SHEET_NAME);
  if (!sh) throw new Error('Sheet not found: ' + CONFIG.SHEET_NAME);

  // 1) Read all product names from column A
  const lastRow = sh.getLastRow();
  if (lastRow <= CONFIG.HEADER_ROWS) return;

  const names = sh.getRange(CONFIG.HEADER_ROWS + 1, CONFIG.NAME_COL, lastRow - CONFIG.HEADER_ROWS, 1)
    .getValues()
    .flat();

  // 2) Build map: baseName -> {index -> fileUrl}
  const folder = DriveApp.getFolderById(CONFIG.PHOTO_FOLDER_ID);
  const files = folder.getFiles();

  const map = new Map();

  // Pattern: "Base Name (3).jpg" / "Base Name (2).webp"
  const re = /^(.*)\s+\((\d+)\)\.[^.]+$/;

  while (files.hasNext()) {
    const f = files.next();
    const m = f.getName().match(re);
    if (!m) continue;

    const base = m[1].trim();
    const idx = parseInt(m[2], 10);
    if (!idx || idx < 1 || idx > CONFIG.OUT_COUNT) continue;

    if (!map.has(base)) map.set(base, {});
    map.get(base)[idx] = f.getUrl();
  }

  // 3) Prepare output array for photo columns
  const out = names.map(n => {
    const base = (n || '').toString().trim();
    const row = new Array(CONFIG.OUT_COUNT).fill('');
    if (!base) return row;

    const hits = map.get(base);
    if (!hits) return row;

    for (let i = 1; i <= CONFIG.OUT_COUNT; i++) {
      const url = hits[i];
      if (url) row[i - 1] = url;
    }
    return row;
  });

  // 4) Write to photo columns
  sh.getRange(CONFIG.HEADER_ROWS + 1, CONFIG.OUT_START_COL, out.length, CONFIG.OUT_COUNT)
    .setValues(out);

  const photosFound = out.filter(row => row.some(cell => cell)).length;
  ss.toast(`Found photos for ${photosFound} products`, '✅ Photos Synced', 5);
  Logger.log(`Photo sync complete: ${photosFound} products with photos`);
}

// ============================================
// SYNC PRODUCTS TO WEBSITE
// ============================================
function syncToWebsite() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  try {
    const response = UrlFetchApp.fetch(CONFIG.WEBSITE_SYNC_URL, {
      method: 'GET',
      muteHttpExceptions: true,
      headers: {
        'User-Agent': 'GoogleAppsScript-EonniSync'
      }
    });
    
    const statusCode = response.getResponseCode();
    const responseText = response.getContentText();
    
    if (statusCode === 200) {
      const result = JSON.parse(responseText);
      Logger.log('✅ Sync successful!');
      Logger.log('Imported: ' + result.imported + ' products');
      Logger.log('Skipped: ' + result.skipped);
      Logger.log('Errors: ' + result.errors);
      Logger.log('Duration: ' + result.duration + 'ms');
      
      ss.toast(
        `Imported ${result.imported} products (${result.errors} errors)`,
        '✅ Website Sync',
        5
      );
    } else {
      Logger.log('❌ Sync failed with status: ' + statusCode);
      Logger.log('Response: ' + responseText);
      
      ss.toast('Error: ' + statusCode, '❌ Sync Failed', 10);
    }
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
    ss.toast(error.message, '❌ Sync Error', 10);
  }
}

// ============================================
// AUTOMATIC SYNC (called by trigger)
// ============================================
function autoSync() {
  // This function is called automatically by the time trigger
  // It runs the full sync (photos + website)
  Logger.log('Auto sync started at ' + new Date().toISOString());
  
  try {
    syncProductPhotoLinks();
    syncToWebsite();
    Logger.log('Auto sync completed successfully');
  } catch (error) {
    Logger.log('Auto sync failed: ' + error.message);
  }
}
```

## Setting Up Automatic Triggers (Every 5 Minutes)

1. In Apps Script, click the **clock icon** (Triggers) in the left sidebar
2. Click **+ Add Trigger**
3. Configure:
   - **Function to run:** `autoSync`
   - **Event source:** `Time-driven`
   - **Type of time based trigger:** `Minutes timer`
   - **Select minute interval:** `Every 5 minutes`
4. Click **Save**
5. Google will ask for permissions - click **Allow**

## How It Works

### Every 5 Minutes (Automatic):
1. `autoSync()` runs
2. First, it syncs photo links from your Google Drive folder to the sheet
3. Then, it syncs all products from the sheet to your website

### Manual (from the menu):
- **🛍️ Eonni → 1. Sync Photo Links from Drive** - Only updates photo URLs in the sheet
- **🛍️ Eonni → 2. Sync Products to Website** - Only syncs to website
- **🛍️ Eonni → 🔄 Full Sync** - Does both

## Important Notes

### Photo Naming Convention
Your photos in Google Drive should be named like:
- `Product Name (1).jpg` - First photo
- `Product Name (2).jpg` - Second photo
- `Product Name (3).webp` - Third photo

The name before `(N)` must EXACTLY match the product name in column A.

### Sharing the Drive Folder
Make sure your photo folder is either:
1. Shared with the service account: `eonni-777@algotcha.iam.gserviceaccount.com`
2. Or set to "Anyone with the link can view"

### Troubleshooting
- **Photos not appearing:** Check that file names match product names exactly
- **Sync errors:** Check Apps Script logs (View → Logs)
- **Permission errors:** Re-authorize the script when prompted

## Current Configuration
- **Sheet:** Загальний
- **Photo Folder ID:** 1l0OnOXF3O8W1mGzg0vNz_aY50IH3rrXc
- **Website URL:** https://www.eonni.com.ua/api/sync-sheet
- **Photo Columns:** X through AI (12 photos per product) — was T-AE before 2026-05-06 column expansion

## Column Layout (44 cols)

```
A  Назва                      M  Короткий опис              X-AG  Фото 1..10
B  Постачальник               N  Довгий опис (intro only)   AH-AI (empty placeholders for Фото 11/12)
C  Категорія                  O  Спосіб застосування        AJ  Об'єм/Варіанти
D  Субкатегорія               P  Клінічно підтверджено      AK  Рейтинг
E  Бренд                      Q  Які проблеми вирішує       AL  Кількість відгуків
F  SKU                        R  Ключові інгредієнти        AM  Вік
G  Вага                       S  Для якої шкіри підходить   AN  Інгредієнти
H  Собівартість               T  Сумісність з іншими комп.  AO  Тип шкіри
I  Ціна продажу               U  Активний товар             AP  Серія
J  Стара ціна                 V  Позначити як новинку       AQ  Класифікація
K  Знижка                     W  Позначити як ексклюзив
L  Теги
```

⚠️ **Important:** If you ever rename/insert/delete columns, update `OUT_START_COL` to match the new "Фото 1" position. The script writes 12 photo URLs starting from that column (X = col 24, X..AI = cols 24..35).
