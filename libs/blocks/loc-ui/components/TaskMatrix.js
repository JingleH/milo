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

// 3 states: item*loc progress state, displaying state, selected state

// TODO: maintain a tree structure vs. flat array of objects?
// FIXME: use initial value
const initialDataState = contentItems.reduce(
  (accItems, currItem) => ({
    ...accItems,
    [currItem]: locales.reduce(
      (accLocs, currLoc) => ({ ...accLocs, [currLoc]: signal('initial') }),
      {},
    ),
  }),
  {},
);
function getInitialSelectionState() {
  return contentItems.reduce(
    (accItems, currItem) => ({
      ...accItems,
      [currItem]: locales.reduce(
        (accLocs, currLoc) => ({ ...accLocs, [currLoc]: signal(false) }),
        {},
      ),
    }),
    {},
  );
}

const selectionState = getInitialSelectionState();
function clearSelections() {
  Object.keys(selectionState).forEach((item) => {
    Object.keys(selectionState[item]).forEach((loc) => {
      selectionState[item][loc].value = false;
    });
  });
}

function selectionStateAnalyze(selected) {
  const firstState = selected?.[0]?.state;
  return {
    isEmpty: selected.length === 0,
    isConsistent: selected.every((s) => s.state === firstState),
    consistentState: firstState,
  };
}

function TaskMatrix() {
  const state = initialDataState;

  const localeCols = locales.map((locale) => locale);
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
      ...localeCols.map((col) => ({ content: col })),
    ],
    TableHeaderCell,
  );
  const rows = contentItems.map((item) => {
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
        { content: item },
        { content: sourceButtons },
        { content: langStoreButtons },
        ...localeCols.map((loc) => {
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
              <button>edit</button>
              <button>preview</button>
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
    <div class="table-wrapper">
      <table class="detail-table">
        ${headerRow} ${rows}
      </table>
    </div>
  </div>`;
}
export default TaskMatrix;
