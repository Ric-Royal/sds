export const catalogue = {
  business: 'SDS', website: 'https://datasds.org', version: '1.0',
  commercial_status: 'Quote required. Job submission does not create a paid contract.',
  services: [
    { id: 'data-quality', title: 'Data quality assessment', engine: 'deterministic',
      input: 'JSON object with rows: up to 200 objects with scalar values.',
      output: 'Missing values, duplicate rows, field types and recommendations.' },
    { id: 'sales', title: 'Project scoping', engine: 'model',
      input: 'Project brief in text. Include the problem, intended users and timing.',
      output: 'Scope, questions, delivery approach and quote considerations; no invented prices.' },
    { id: 'marketing', title: 'Marketing draft', engine: 'model',
      input: 'Audience, channel, objective and verified facts in text.',
      output: 'Draft content for review. No messages sent or posts published.' },
    { id: 'research', title: 'Source-based research draft', engine: 'model',
      input: 'Research question and supplied source extracts in text.',
      output: 'Analysis limited to supplied material, with gaps flagged. No autonomous web retrieval.' },
    { id: 'governance', title: 'Governance review', engine: 'model',
      input: 'System purpose, data, permissions, owners and proposed actions in text.',
      output: 'Controls and unresolved decisions for review.' },
    { id: 'maintenance', title: 'Maintenance assessment', engine: 'model',
      input: 'Sanitised logs, observed behaviour and relevant code excerpts in text.',
      output: 'Diagnosis and suggested changes. No shell execution or deployment.' }
  ],
  api: { catalogue: '/v1/services', submit: '/v1/jobs', status: '/v1/jobs/{id}',
    authentication: 'Bearer token issued to a named client by SDS.',
    idempotency: 'Idempotency-Key required for submission.',
    results: 'Outputs become visible to the client after SDS review.' }
};

export function assessRows(rows, limit = 200) {
  if (!Array.isArray(rows) || rows.length < 1 || rows.length > limit) throw new Error(`Provide 1–${limit} rows.`);
  for (const row of rows) {
    if (!row || typeof row !== 'object' || Array.isArray(row) || Object.keys(row).length > 50)
      throw new Error('Each row must be an object with at most 50 fields.');
    if (Object.values(row).some(v => v !== null && !['string', 'number', 'boolean'].includes(typeof v)))
      throw new Error('Fields must contain strings, numbers, booleans or null.');
  }
  const fields = [...new Set(rows.flatMap(r => Object.keys(r)))].sort();
  if (fields.length > 50) throw new Error('Provide at most 50 fields across all rows.');
  const missing = v => v === null || v === undefined || (typeof v === 'string' && !v.trim());
  const signatures = rows.map(r => JSON.stringify(fields.map(f => r[f] === undefined ? null : r[f])));
  const duplicates = signatures.length - new Set(signatures).size;
  return {
    row_count: rows.length, duplicate_rows: duplicates,
    fields: fields.map(name => {
      const values = rows.map(r => r[name]);
      return { name, missing: values.filter(missing).length,
        observed_types: [...new Set(values.filter(v => !missing(v)).map(v => typeof v))].sort() };
    }),
    recommendations: [
      ...(duplicates ? ['Review duplicate records against the intended record key before removing them.'] : []),
      ...(fields.some(f => rows.some(r => missing(r[f]))) ? ['Review missing fields against business requirements.'] : []),
      'This assessment reports structure and completeness; it does not verify factual accuracy.'
    ]
  };
}
