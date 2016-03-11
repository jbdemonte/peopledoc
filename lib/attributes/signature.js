module.exports = {
  id: '*', // only in response
  external_id: 'VARCHAR(100)',
  signature_type: 'VARCHAR(100)',
  document_type: 'VARCHAR(100) / mandatory',
  document_type_metas: '*',
  document_type_filters: '*',
  title: 'VARCHAR(255) / mandatory',
  reason: 'VARCHAR(255) / mandatory',
  location: 'VARCHAR(255) / mandatory',
  requestor_description: 'VARCHAR(255)',
  requestor_technical_id: 'VARCHAR(50)',
  expiration_date: 'DateISO8601 / mandatory',
  message: 'VARCHAR',
  auto_archive: 'BOOLEAN',
  callback_url: 'VARCHAR(255)',
  billing_tag: 'VARCHAR(255)',
  status: 'VARCHAR', // only in response
  signers: [{
    type: '[organisation, employee, manager, external] / mandatory',
    pdf_sign_field: 'VARCHAR',
    role_name: '*',
    generate_pdf_sign_field: {
      page: 'INTEGER',
      llx: 'INTEGER',
      lly: 'INTEGER',
      urx: 'INTEGER',
      ury: 'INTEGER'
    },
    signing_order: 'INTEGER',
    registration_reference: 'VARCHAR',
    technical_id: 'VARCHAR',
    email_address : 'VARCHAR',
    phone_number : 'VARCHAR',
    first_name : 'VARCHAR',
    last_name : 'VARCHAR',
    with_sms_notification: 'BOOLEAN',
    with_sms_authentication: 'BOOLEAN',
    send_signed_document: 'BOOLEAN',
    status: 'VARCHAR' // only in response
  }]
};