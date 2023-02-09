import { html } from '../../../deps/htm-preact.js';

export default function SmallLoader({ color }) {
  return html` <div class="loader-container loader-container-small">
    <div class=${`small-loader ${color}`}></div>
  </div>`;
}
