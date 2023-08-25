import { throttle, debounce } from './utils.js';

export default function useInputAutocomplete(
  fetchFunc,
  updateUIWithSuggestions,
  { throttleDelay = 300, debounceDelay = 500, limit = 5, useFake = false, throttleThreshold = 2 } = {},
) {
  const state = { query: '', waitingFor: '' };
  const fetchAndUpdateUI = async () => {
    const currentSearch = state.query;
    state.waitingFor = currentSearch;
    const suggestions = await fetchFunc(currentSearch, limit, useFake);
    console.log({suggestions});
    if (state.waitingFor === currentSearch) {
      updateUIWithSuggestions(suggestions);
    }
  };

  const throttledFetchAndUpdateUI = throttle(fetchAndUpdateUI, throttleDelay, { trailing: true });
  const debouncedFetchAndUpdateUI = debounce(fetchAndUpdateUI, debounceDelay);

  const inputHandler = (e) => {
    state.query = e.target.value;
    if (state.query.length < throttleThreshold || state.query.endsWith(' ')) {
      if (throttleDelay > 0) throttledFetchAndUpdateUI();
    } else {
      if (debounceDelay > 0) debouncedFetchAndUpdateUI();
    }
  };
  return { inputHandler };
}
