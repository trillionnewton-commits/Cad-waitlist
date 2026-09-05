/**
 * CAD Waitlist → Google Sheets
 * Paste ALL of this into: Extensions → Apps Script (replacing any code there)
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Signups') || ss.insertSheet('Signups');

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(['Timestamp', 'Email', 'Store URL', 'Source']);
      sheet.getRange(1, 1, 1, 4).setFontWeight('bold');
      sheet.setColumnWidth(1, 180);
      sheet.setColumnWidth(2, 240);
      sheet.setColumnWidth(3, 240);
      sheet.setColumnWidth(4, 120);
      sheet.setFrozenRows(1);
    }

    sheet.appendRow([new Date(), d.email, d.store, d.source || 'landing']);

    var count = sheet.getLastRow() - 1;
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true, count: count }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
