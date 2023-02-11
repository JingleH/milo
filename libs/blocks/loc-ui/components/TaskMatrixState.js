import { html, signal } from '../../../deps/htm-preact.js';
import {
  locales,
  contentItems,
  stateLifecycle,
  transitions,
} from './constants.js';

// 3 states: item*loc progress state, displaying state, selected state

// TODO: maintain a tree structure vs. flat array of objects?
// FIXME: use initial value
export function getInitialDataState() {
  return contentItems.reduce(
    (accItems, currItem) => ({
      ...accItems,
      [currItem]: locales.reduce(
        (accLocs, currLoc) => ({ ...accLocs, [currLoc]: signal('initial') }),
        {},
      ),
    }),
    {},
  );
}
export function getInitialSelectionState() {
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

export const selectionState = getInitialSelectionState();
export const searchItemState = signal(null);
export const searchLocState = signal(null);
export const filterStatusState = signal(null);
export const state = getInitialDataState();

export function clearSelections() {
  Object.keys(selectionState).forEach((item) => {
    Object.keys(selectionState[item]).forEach((loc) => {
      selectionState[item][loc].value = false;
    });
  });
}

export function selectionStateAnalyze(selected) {
  const firstState = selected?.[0]?.state;
  return {
    isEmpty: selected.length === 0,
    isConsistent: selected.every((s) => s.state === firstState),
    consistentState: firstState,
  };
}

export const updateSearchItemState = (v) => {
  searchItemState.value = v;
};
export const updateSearchLocState = (v) => {
  searchLocState.value = v;
};

export const searchItemOnInput = (e) => {
  e.preventDefault();
  updateSearchItemState(e.target.value);
};

export const searchLocOnInput = (e) => {
  e.preventDefault();
  updateSearchLocState(e.target.value);
};
