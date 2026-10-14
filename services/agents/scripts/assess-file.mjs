import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { createHash } from 'node:crypto';
import { assessRows } from '../src/catalogue.mjs';
import { parseCsv } from '../src/services.mjs';
import { escapeHtml } from '../src/common.mjs';

// Offline delivery uses the same deterministic assessment as the customer service.
// Usage: node scripts/assess-file.mjs input.json output-directory [--sample]
const [inputPath, outputPath, sampleFlag, ...extra] = process.argv.slice(2);
if (!inputPath || !outputPath || extra.length || (sampleFlag && sampleFlag !== '--sample')) {
  throw new Error('Usage: node assess-file.mjs input.json|input.csv output-directory [--sample]');
}
const raw = await readFile(resolve(inputPath), 'utf8');
const rows = extname(inputPath).toLowerCase() === '.csv' ? parseCsv(raw) : JSON.parse(raw);
const result = assessRows(rows, 5000);
const sample = sampleFlag === '--sample';
const sourceName = extname(inputPath).toLowerCase() === '.csv' ? 'synthetic-input.csv' : 'synthetic-input.json';
const generated = new Date().toISOString();
const report = {
  title: 'Data and reporting review', generated_at: generated, synthetic_sample: sample,
  engine: 'SDS deterministic data-quality assessment',
  input_sha256: createHash('sha256').update(raw).digest('hex'),
  ...result,
  limitations: [
    'Duplicate rows require a business-key review before removal.',
    'CSV values remain strings; mixed-type checks are most useful with typed JSON.',
    'This assessment does not test financial reconciliation, customer churn, accuracy or causation.',
    'A paid assessment also requires agreed business rules, source checks and a reviewed action plan.',
  ],
};
const label = sample ? 'SYNTHETIC SAMPLE / NO CLIENT DATA' : 'PRIVATE DELIVERY / REVIEW BEFORE SHARING';
const markdownCell = value => escapeHtml(String(value)).replaceAll('\\', '\\\\').replace(/[\r\n]+/g, ' ').replace(/[|`*_\[\]]/g, '\\$&');
const missingCells = result.fields.reduce((n, f) => n + f.missing, 0);
const md = [`# SDS / Data and reporting review`, '', label, '',
  `Generated: ${generated}`, `Input SHA-256: ${report.input_sha256}`, '',
  `Rows: ${result.row_count}. Duplicate rows: ${result.duplicate_rows}. Missing cells: ${missingCells}.`, '',
  '| Field | Missing | Observed types |', '| --- | ---: | --- |',
  ...result.fields.map(f => `| ${markdownCell(f.name)} | ${f.missing} | ${f.observed_types.join(', ')} |`), '',
  '## Recommended review', '', ...result.recommendations.map(r => `- ${r}`), '',
  '## Limits', '', ...report.limitations.map(r => `- ${r}`), '',
].join('\n');
const safeCell = v => '"' + (/^[=+@\-\t\r]/.test(String(v)) ? "'" : '') + String(v).replaceAll('"', '""') + '"';
const csv = ['field,missing,observed_types', ...result.fields.map(f => [f.name, f.missing, f.observed_types.join(';')].map(safeCell).join(','))].join('\r\n');
const list = items => items.map(x => `<li>${escapeHtml(x)}</li>`).join('');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Data review ${sample ? 'sample' : 'report'} | SDS</title><style>*{box-sizing:border-box}body{margin:0;background:#f3f2ec;color:#142d29;font:16px/1.6 system-ui}main{max-width:1000px;margin:auto;padding:40px 24px}header{border-top:7px solid #1c493d;padding-top:25px}small,.label{font:12px/1.6 monospace;letter-spacing:.05em}h1{font-size:clamp(36px,6vw,64px);line-height:1.05;letter-spacing:-.04em;margin:20px 0}h2{margin-top:38px}a{color:#1c493d}.cards{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin:30px 0}.card{background:white;padding:20px}.card b{display:block;font-size:38px}table{width:100%;border-collapse:collapse;background:white}th,td{padding:12px;text-align:left;border-bottom:1px solid #deded7}code{overflow-wrap:anywhere;font-size:11px}.notice{padding:16px;background:#e0e9e1}.downloads{display:flex;flex-wrap:wrap;gap:18px}@media(max-width:500px){.cards{grid-template-columns:1fr}th,td{padding:8px;font-size:13px}}@media print{body{background:white}main{padding:10px}.downloads{display:none}}</style></head><body><main><header><p class="label">SDS / DATA. DECISIONS. SYSTEMS.</p><p class="notice">${label}</p><h1>Can you trust the records behind your report?</h1><p>This ${sample ? 'synthetic example' : 'assessment'} shows the structural checks that start a data and reporting review. Findings come from the SDS assessment engine. ${sample ? 'These are invented records, not a customer case study.' : 'Review the findings against your source systems and business rules.'}</p></header><div class="cards"><div class="card"><b>${result.row_count}</b>Rows assessed</div><div class="card"><b>${result.duplicate_rows}</b>Duplicate rows</div><div class="card"><b>${missingCells}</b>Missing cells</div></div><h2>Field checks</h2><table><thead><tr><th>Field</th><th>Missing</th><th>Observed types</th></tr></thead><tbody>${result.fields.map(f => `<tr><td>${escapeHtml(f.name)}</td><td>${f.missing}</td><td>${escapeHtml(f.observed_types.join(', '))}</td></tr>`).join('')}</tbody></table><h2>What needs review</h2><ul>${list(result.recommendations)}</ul><h2>What this establishes</h2><ul>${list(report.limitations)}</ul><h2>Inspect the evidence</h2><p class="downloads"><a href="report.json">JSON report</a><a href="report.md">Editable report</a><a href="field-quality.csv">Field statistics</a>${sample ? '<a href="' + sourceName + '">Synthetic source records</a>' : ''}</p><p><small>Generated ${generated}</small><br><code>Input SHA-256: ${report.input_sha256}</code></p>${sample ? '<h2>Start with your reporting problem.</h2><p>SDS offers a KES 45,000 assessment of up to two agreed data extracts. Scope, timing, access and commercial terms are agreed in a written quote.</p><p><a href="/managed-analytics/">View the service</a> · <a href="mailto:richard@datasds.org?subject=Data%20and%20reporting%20review">Discuss a review</a></p>' : ''}</main></body></html>`;
const out = resolve(outputPath);
await mkdir(out, { recursive: true });
if (sample) await writeFile(resolve(out, sourceName), raw);
for (const [name, content] of [['report.json', JSON.stringify(report, null, 2)], ['report.md', md], ['field-quality.csv', csv], ['report.html', html]]) {
  await writeFile(resolve(out, name), content);
}
console.log(JSON.stringify({ output: out, rows: result.row_count, duplicate_rows: result.duplicate_rows, missing_cells: missingCells, synthetic_sample: sample }));
