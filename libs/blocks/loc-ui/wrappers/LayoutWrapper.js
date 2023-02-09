import { html } from '../../../deps/htm-preact.js';

function LayoutWrapper({ children }) {
  return html` <div class="whole-block">${children}</div> `;
}

export default LayoutWrapper;
