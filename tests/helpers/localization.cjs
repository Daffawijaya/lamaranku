// Editor handler tests keep copy in the source language; locale behavior has separate tests.
const runtime = require('react/jsx-runtime');
const mock = {
  T: Object.assign(({ text, values }) => typeof text === "string" && values ? text.replace(/\{(\d+)\}/g, (_, index) => String(values[Number(index)] ?? "")) : text, { localizationBoundary: true }),
  LocalizedAttributes: Object.assign(({ children }) => children, { localizationBoundary: true }),
  useAppLanguage: () => ({ language: 'id', t: text => text }),
  setLanguageAccount: () => {},
  translateMessage: text => text,
};
for (const name of ['jsx', 'jsxs']) {
  const original = runtime[name];
  runtime[name] = (type, props, key) => type?.localizationBoundary ? type(props) : original(type, props, key);
}
const id = require.resolve('../../components/i18n/LanguageProvider.tsx');
require.cache[id] = { id, filename: id, loaded: true, exports: mock };
module.exports = { mock };
