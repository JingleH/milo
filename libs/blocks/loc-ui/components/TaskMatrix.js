import { html, signal } from '../../../deps/htm-preact.js';
import TableDataCell from '../../nala-dashboard/components/TableDataCell.js';
import TableHeaderCell from './TableHeaderCell.js';
import { buildRow } from '../../nala-dashboard/components/TableRow.js';
import {
  locales,
  contentItems,
  stateLifecycle,
  transitions,
} from './constants.js';
import { escapeRegExp } from './utils.js';
import {
  searchItemOnInput,
  searchItemState,
  searchLocOnInput,
  searchLocState,
  selectionState,
  state,
  selectionStateAnalyze,
  clearSelections,
  filterStatusState,
} from './TaskMatrixState.js';

function TaskMatrix() {
  let locRegex;
  let itemRegex;
  let statusRegex;
  let filteredLocs = locales;
  let filteredItems = contentItems;
  if (searchItemState.value) {
    itemRegex = new RegExp(escapeRegExp(searchItemState.value), 'i');
    filteredItems = contentItems.filter((item) => itemRegex.test(item));
  }
  if (searchLocState.value) {
    locRegex = new RegExp(escapeRegExp(searchLocState.value), 'i');
    filteredLocs = locales.filter((locale) => locRegex.test(locale));
  }
  // if (filterStatusState.value) {
  //   statusRegex = new RegExp(escapeRegExp(filterStatusState.value), 'i');
  //   const statusMatchingItems = [];
  //   const statusMatchingLocs = [];
  //   filteredItems.forEach((item) => {
  //     filteredLocs.forEach((loc) => {
  //       if (statusRegex.test(state[item][loc].value)) {
  //         statusMatchingItems.push(item);
  //         statusMatchingLocs.push(loc);
  //       }
  //     });
  //   });
  //   filteredItems = statusMatchingItems;
  //   filteredLocs = statusMatchingLocs;
  // }

  const selected = [];
  Object.keys(selectionState).forEach((item) => {
    Object.keys(selectionState[item]).forEach((loc) => {
      if (selectionState[item][loc].value) {
        selected.push({ loc, item, state: state[item][loc].value });
      }
    });
  });
  const { isEmpty, isConsistent, consistentState } =
    selectionStateAnalyze(selected);
  const actionButtons = Object.keys(transitions).map(
    (action) =>
      html`<button
        disabled=${isEmpty ||
        !isConsistent ||
        !stateLifecycle[consistentState].includes(action)}
        onClick=${(e) => {
          e.preventDefault();
          if (!isConsistent) {
            return;
          }
          selected.forEach((s) => {
            const { loc, item } = s;
            state[item][loc].value = transitions[action];
          });
          clearSelections();
        }}
      >
        ${action}
      </button>`,
  );
  const headerRow = buildRow(
    [
      { content: 'URL' },
      { content: 'Source' },
      { content: 'Language Store' },
      ...filteredLocs.map((loc) => ({
        content: html`<div
          onClick=${(e) => {
            e.preventDefault();
            Object.keys(selectionState).forEach((item) => {
              selectionState[item][loc].value =
                !selectionState[item][loc].value;
            });
          }}
        >
          ${loc}
        </div>`,
      })),
    ],
    TableHeaderCell,
  );

  const searchBars = html`<div>
    <input
      type="search"
      placeholder="Item"
      class="search-bar"
      value=${searchItemState}
      onInput=${searchItemOnInput}
    />
    <input
      type="search"
      placeholder="Loc"
      class="search-bar"
      value=${searchLocState}
      onInput=${searchLocOnInput}
    />
    <input
      type="search"
      placeholder="Status"
      class="search-bar"
      value=${filterStatusState}
      onInput=${(e) => {
        e.preventDefault();
      }}
    />
  </div>`;

  const rows = filteredItems.map((item) => {
    const sourceEdit = html`<button>Edit</button>`;
    const sourcePreview = html`<button>Preview</button>`;
    const sourceLive = html`<button>Live</button>`;
    const langStoreSync = html`<button>Sync</button>`;
    const langStoreEdit = html`<button>Edit</button>`;
    const langStorePreview = html`<button>Preview</button>`;
    const sourceButtons = html`<div>
      ${sourceEdit} ${sourcePreview} ${sourceLive}
    </div>`;
    const langStoreButtons = html`<div>
      ${langStoreSync} ${langStoreEdit} ${langStorePreview}
    </div>`;
    return buildRow(
      [
        {
          content: html`<div
            onClick=${(e) => {
              e.preventDefault();
              Object.keys(selectionState[item]).forEach((loc) => {
                selectionState[item][loc].value =
                  !selectionState[item][loc].value;
              });
            }}
          >
            ${item}
          </div>`,
        },
        { content: sourceButtons },
        { content: langStoreButtons },
        ...filteredLocs.map((loc) => {
          const currState = state[item][loc];
          const currSelectionState = selectionState[item][loc];
          return {
            content: html`<div
              class=${`clickable${currSelectionState.value ? ' blue' : ''}`}
              onClick=${() => {
                currSelectionState.value = !currSelectionState.value;
              }}
            >
              ${currState.value}
            </div>`,
          };
        }),
      ],
      TableDataCell,
    );
  });
  console.log('rendered task matrix');
  return html`<div>
    ${actionButtons}
    <button
      disabled=${isEmpty}
      onClick=${(e) => {
        e.preventDefault();
        clearSelections();
      }}
    >
      clear selections
    </button>
    ${searchBars}
    <div class="table-wrapper">
      <table class="detail-table sticky-top sticky-left">
        ${headerRow} ${rows}
      </table>
    </div>
  </div>`;
}
export default TaskMatrix;
