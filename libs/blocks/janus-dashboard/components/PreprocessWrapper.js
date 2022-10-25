import { html, createContext } from '../../../deps/htm-preact.js';
import { preprocessTestResults } from './utils.js';

export const DataContext = createContext({
  mapByConsumer: null,
  mapByFeature: null,
  cntMapByConsumer: null,
  cntMapByFeature: null,
  totalCnt: 0,
  totalPassedCnt: 0,
  totalFailedCnt: 0,
  flattened: [],
});

export function PreprocessWrapper({ results, children }) {
  const preprocessed = preprocessTestResults(results);
  return html`<${DataContext.Provider} value=${preprocessed}>${children}<//>`;
}
