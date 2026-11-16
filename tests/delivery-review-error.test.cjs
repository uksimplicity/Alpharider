const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
require.extensions['.tsx'] = (module, filename) => module._compile(ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText, filename);
const DeliveryReviewError = require('../src/app/components/DeliveryReviewError.tsx').default;

test('review failure offers recovery and retains backend status, ID and message without job actions', () => {
  const html = renderToStaticMarkup(React.createElement(DeliveryReviewError, {
    id: 'd69b17d0-e147-4a66-a51f-9fdb351f8987', error: 'Unauthorized', status: 404, retry() {},
  }));
  assert.match(html, /Couldn’t open this delivery/);
  assert.match(html, /Refresh requests or return to the dashboard/);
  assert.match(html, /href="\/dashboard"/);
  assert.match(html, /Try again/);
  assert.match(html, /<details><summary>Error details<\/summary>/);
  assert.match(html, /HTTP status: 404/);
  assert.match(html, /Server message: Unauthorized/);
  assert.match(html, /d69b17d0-e147-4a66-a51f-9fdb351f8987/);
  assert.doesNotMatch(html, /Accept delivery/);
});

test('network failures keep their diagnostic message without inventing an HTTP status', () => {
  const html = renderToStaticMarkup(React.createElement(DeliveryReviewError, { id: 'job1', error: 'Failed to fetch', retry() {} }));
  assert.match(html, /Failed to fetch/);
  assert.doesNotMatch(html, /HTTP status/);
});
