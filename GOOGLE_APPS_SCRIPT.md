# Google Apps Script for Auto-Sync

You can add this script to your Google Sheet to automatically sync products to your website.

## Setup Instructions

1. Open your Google Sheet: https://docs.google.com/spreadsheets/d/1rm5beP1P_eCIshYdaJBoyUmzEiOB8Ox3UssMhPv6K1I
2. Go to **Extensions** → **Apps Script**
3. Delete any existing code and paste the script below
4. Save the script (Ctrl+S or Cmd+S)
5. Run `syncToWebsite()` once manually to authorize it
6. Set up a trigger (see below)

## The Script

```javascript
/**
 * Sync products to Eonni website
 * This calls the /api/sync-sheet endpoint on your website
 */
function syncToWebsite() {
  const WEBSITE_URL = 'https://www.eonni.com.ua/api/sync-sheet';
  
  try {
    const response = UrlFetchApp.fetch(WEBSITE_URL, {
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
      
      // Optional: Show a toast notification
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Imported ' + result.imported + ' products',
        '✅ Sync Complete',
        5
      );
    } else {
      Logger.log('❌ Sync failed with status: ' + statusCode);
      Logger.log('Response: ' + responseText);
      
      SpreadsheetApp.getActiveSpreadsheet().toast(
        'Error: ' + statusCode,
        '❌ Sync Failed',
        10
      );
    }
  } catch (error) {
    Logger.log('❌ Error: ' + error.message);
    SpreadsheetApp.getActiveSpreadsheet().toast(
      error.message,
      '❌ Sync Error',
      10
    );
  }
}

/**
 * Add a custom menu to the spreadsheet
 */
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🛍️ Eonni')
    .addItem('Sync to Website', 'syncToWebsite')
    .addToUi();
}
```

## Setting Up Automatic Triggers

### Option 1: Every 5 Minutes (Recommended)

1. In Apps Script, click the clock icon (Triggers) in the left sidebar
2. Click **+ Add Trigger**
3. Configure:
   - Function: `syncToWebsite`
   - Event source: `Time-driven`
   - Type: `Minutes timer`
   - Interval: `Every 5 minutes`
4. Click **Save**

### Option 2: On Edit (Sync when you make changes)

1. In Apps Script, click the clock icon (Triggers)
2. Click **+ Add Trigger**
3. Configure:
   - Function: `syncToWebsite`
   - Event source: `From spreadsheet`
   - Event type: `On edit`
4. Click **Save**

Note: "On edit" will sync every time ANY cell changes, which might be too frequent. Consider using a debounce or only syncing on specific sheet changes.

### Option 3: Manual Only

Just use the **🛍️ Eonni** → **Sync to Website** menu item whenever you want to sync.

## Troubleshooting

- **Authorization Required**: The first time you run the script, Google will ask for permission to access external URLs. Click "Allow".
- **Script Not Running**: Make sure you saved the script and that triggers are set up correctly.
- **Sync Errors**: Check the Apps Script logs (View → Logs) for detailed error messages.

## Current Setup

- **Vercel Cron**: Runs daily at 6:00 AM UTC (automatic backup sync)
- **Google Apps Script**: Can run every 5 minutes or on-demand (your choice)

This gives you the best of both worlds - automatic daily sync as a backup, plus frequent updates when you need them!

