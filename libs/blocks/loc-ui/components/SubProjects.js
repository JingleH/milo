import { html, signal } from '../../../deps/htm-preact.js';
import Card from './Card.js';
import GridContainer from './GridContainer.js';
import GridItem from './GridItem.js';
import { updateSearchLocState } from './TaskMatrixState.js';

function SubProjectCard({ loc }) {
  return html`<${Card}> <div onClick=${(e) => {
    e.preventDefault();
    updateSearchLocState(loc);
  }}>${loc}</div> </${Card}>`;
}

function SubProjects() {
  return html` <div class='mb5 mt3'>
    <${GridContainer} spaceAround>
      <${GridItem}>
        <${SubProjectCard} loc=${'German'} />
      </${GridItem}>
      <${GridItem}>
      <${SubProjectCard} loc=${'Spanish'} />
      </${GridItem}>
      <${GridItem}>
      <${SubProjectCard} loc=${'French'} />
      </${GridItem}>
      <${GridItem}>
      <${SubProjectCard} loc=${'French (AltLang)'} />
      </${GridItem}>
      </${GridContainer}>
      </div>
  `;
}
export default SubProjects;
