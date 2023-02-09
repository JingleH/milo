import { html } from '../../../deps/htm-preact.js';

function TableRow({ children }) {
  return html`<tr class="detail-row">
    ${children}
  </tr>`;
}

/**
 *
 * @param {[{content: any, config: {}}]} data
 * @param {*} CellComponent
 * @returns
 */
export function buildRow(data, CellComponent) {
  const cells = data.map((h) => {
    const { content, config } = h;
    return html`<${CellComponent} textLeft=${config?.textLeft}>${content}<//>`;
  });
  return html`
  <${TableRow}>
    ${cells}
  </${TableRow}>`;
}

export default TableRow;
