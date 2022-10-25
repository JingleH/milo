import { html, useContext } from '../../../../deps/htm-preact.js';
import { DataContext } from '../PreprocessWrapper.js';
import { FilterContext } from '../FilterWrapper.js';
import FeatureRow from './FeatureRow/index.js';
import GridContainer from '../GridContainer.js';
import GridItem from '../GridItem.js';
import { filterByTeam, filterByFeature } from '../utils.js';

export default function DetailSection() {
  const { mapByFeature, flattened } = useContext(DataContext);
  const { state: filterState } = useContext(FilterContext);
  const selectedTeam = filterState.team;
  const titleRow = html`
    <${GridContainer}>
      <${GridItem}>Details for ${selectedTeam || 'All'}
      </${GridItem}>
    </${GridContainer}>
    <${GridContainer}>
      <${GridItem}><//>
      <${GridItem}>Total<//>
      <${GridItem}>Passed<//>
      <${GridItem}>Failed<//>
    </${GridContainer}>`;
  const data = filterByTeam(flattened, selectedTeam);
  const featureRows = Object.keys(mapByFeature).map(
    (feature) => html`<${FeatureRow} data=${filterByFeature(data, feature)} feature=${feature} />`,
  );

  return html`<div>${titleRow}${featureRows}</div>`;
}
