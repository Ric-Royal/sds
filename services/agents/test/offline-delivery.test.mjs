import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

const script = fileURLToPath(new URL('../scripts/assess-file.mjs', import.meta.url));
test('offline sample includes the exact CSV evidence in a separate output directory', () => {
  const root = mkdtempSync(join(tmpdir(), 'sds-sample-'));
  try {
    const source = 'customer,amount\nDemo A,10\nDemo A,10\n';
    const input = join(root, 'source.csv'), out = join(root, 'delivery');
    writeFileSync(input, source);
    const run = spawnSync(process.execPath, [script, input, out, '--sample'], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    assert.equal(readFileSync(join(out, 'synthetic-input.csv'), 'utf8'), source);
    const report = JSON.parse(readFileSync(join(out, 'report.json'), 'utf8'));
    assert.equal(report.input_sha256, createHash('sha256').update(source).digest('hex'));
    assert.equal(report.duplicate_rows, 1);
    assert.match(readFileSync(join(out, 'report.html'), 'utf8'), /href="synthetic-input.csv"/);
  } finally { rmSync(root, { recursive: true, force: true }); }
});
test('offline Markdown keeps multiline and markup field names inside the table', () => {
  const root = mkdtempSync(join(tmpdir(), 'sds-report-'));
  try {
    const input = join(root, 'source.json'), out = join(root, 'delivery');
    writeFileSync(input, JSON.stringify([{ 'amount\r\n# forged|<b>value</b>': 1 }]));
    const run = spawnSync(process.execPath, [script, input, out], { encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    const md = readFileSync(join(out, 'report.md'), 'utf8');
    assert.ok(!md.includes('\n# forged'));
    assert.ok(md.includes('amount # forged\\|&lt;b&gt;value&lt;/b&gt;'));
    assert.ok(!readFileSync(join(out, 'report.html'), 'utf8').includes('href="synthetic-input'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
