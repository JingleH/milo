import { html, render } from '../../libs/deps/htm-preact.js';
import LocUIApp from './app.js';

async function init() {
  const app = html` <${LocUIApp} /> `;
  const root = document.getElementById('loc-ui-root');
  render(app, root);
}

export default init;
