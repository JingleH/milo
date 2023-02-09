import { html } from '../../../deps/htm-preact.js';

function TableHeaderCell({ children, textLeft }) {
  return html`<th class=${`table-data-cell${textLeft ? ' text-left' : ''}`}>
    ${children}
  </th>`;
}

export default TableHeaderCell;
