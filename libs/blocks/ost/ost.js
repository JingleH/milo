import { loadScript, loadStyle, getConfig, createTag } from '../../utils/utils.js';

const { miloLibs, codeRoot } = getConfig();
const base = miloLibs || codeRoot;

const loadDeps = () => {
  const version = new URL(document.location.href)?.searchParams?.get('caasver') || 'latest';
  return Promise.all([
    loadScript(`https://www.adobe.com/special/chimera/${version}/dist/dexter/react.umd.js`),
    loadScript(`https://www.adobe.com/special/chimera/${version}/dist/dexter/react.dom.umd.js`),
  ]).then(() => loadScript(`${base}/deps/ost/develop.js`, 'module'));
};

export default async function init() {
  const root = createTag('div', { id: 'root' });
  document.body.querySelector('main').append(root);

  await loadDeps(`${base}/deps/ost/develop.js`, 'module');
}
