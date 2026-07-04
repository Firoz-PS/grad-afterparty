/**
 * Google Apps Script — paste this into script.google.com (Extensions > Apps Script
 * from your Google Sheet) to receive RSVP submissions and append them as rows.
 *
 * Setup:
 * 1. Create a new Google Sheet (e.g. "Grad Afterparty RSVPs").
 * 2. Extensions > Apps Script. Delete any starter code and paste this file's contents.
 * 3. Click Deploy > New deployment > select type "Web app".
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the resulting Web App URL.
 * 5. Paste that URL into config.js as `googleSheetWebAppUrl`.
 * 6. Re-deploy (Deploy > Manage deployments > edit > New version) any time you
 *    change this script.
 */

function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

  // Add a header row the first time the sheet is used.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Name", "Timestamp (Georgia Time)"]);
  }

  var data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    data = e.parameter || {};
  }

  var name = data.name || "";

  // Format in Georgia Standard Time (GET, UTC+4), e.g. "Jul 5, 2026, 1:56 AM GET"
  // Uses native Intl-based formatting (more reliable across accounts/locales
  // than Utilities.formatDate, which can silently mis-convert in some setups).
  var now = new Date();
  var timestamp =
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Tbilisi",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(now) + " GET";

  var row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1).setValue(name);

  // Force the timestamp cell to plain text so Sheets doesn't auto-detect it
  // as a date/time and re-render it using the spreadsheet's own timezone.
  var timestampCell = sheet.getRange(row, 2);
  timestampCell.setNumberFormat("@");
  timestampCell.setValue(timestamp);

  return ContentService
    .createTextOutput(JSON.stringify({ result: "success" }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "RSVP endpoint is live" }))
    .setMimeType(ContentService.MimeType.JSON);
}
