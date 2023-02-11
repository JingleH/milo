import { html } from '../../../deps/htm-preact.js';

function TableHeaderCell({ children, textLeft }) {
  return html`<th class=${`table-data-cell sticky-top-header${textLeft ? ' text-left' : ''}`}>
    ${children}
  </th>`;
}

export default TableHeaderCell;
