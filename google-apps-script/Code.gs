const SPREADSHEET_ID = '1af8-MOCPg6afgJZUDfxKcST70b_uyErK5-IDm4-0Zhs'
const SHEET_NAME = 'Requests'
const WEBHOOK_TOKEN = 'replace-with-a-private-token'

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents)
    if (!payload.token || payload.token !== WEBHOOK_TOKEN) return respond({ ok: false, message: 'Unauthorized' }, 401)

    const record = payload.record || {}
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID)
    const sheet = spreadsheet.getSheetByName(SHEET_NAME) || spreadsheet.insertSheet(SHEET_NAME)
    if (sheet.getLastRow() === 0) sheet.appendRow(['Created', 'Name', 'Email', 'Phone', 'Service', 'Message', 'Contact preference', 'Status', 'MongoDB ID'])
    sheet.appendRow([
      record.createdAt || new Date().toISOString(),
      record.name || '',
      record.email || '',
      record.phone || '',
      record.service || '',
      record.message || '',
      record.contactPreference || '',
      record.status || '',
      record._id || '',
    ])
    return respond({ ok: true })
  } catch (error) {
    return respond({ ok: false, message: error.message }, 500)
  }
}

function respond(body, status) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON)
}