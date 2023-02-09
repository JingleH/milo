import { html } from '../../../deps/htm-preact.js';

function TableDataCell({ children, textLeft }) {
  return html`<td class=${`table-data-cell${textLeft ? ' text-left' : ''}`}>
    ${children}
  </td>`;
}

export default TableDataCell;
