import { html } from '../../../deps/htm-preact.js';

function GridItem({ children, centered, spacing = 1 }) {
  const cls = `grid-item${spacing > 1 ? spacing : ''}`;
  return html`<li class=${`${cls}${centered ? ' text-centered' : ''}`}>
    ${children}
  </li>`;
}

export default GridItem;
