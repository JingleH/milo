import { html, render } from '../../deps/htm-preact.js';

import LocUIApp from './app.js';

export default function init(el) {
  const app = html` <${LocUIApp} el=${el} /> `;
  render(app, el);
}
