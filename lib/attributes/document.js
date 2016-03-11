module.exports = {
  title : 'VARCHAR(255) / mandatory',
  document_type_id : 'INTEGER',
  document_type_code : 'VARCHAR(100)',
  external_reference : 'VARCHAR(255)',
  external_unique_id : 'VARCHAR(255)',
  date: 'DateISO8601',
  document_type_metas: '*',
  document_type_filters: '*',
  employee_technical_id : 'VARCHAR(50) / mandatory',
  organization_codes: ['VARCHAR(64)'],
  api_uploader_name: 'VARCHAR'
};