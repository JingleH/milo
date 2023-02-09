import { html } from '../../../deps/htm-preact.js';

export default function Dropdown({
  options = [],
  onSelect,
  value,
  defaultValue,
  defaultText,
  isLoading,
  isError,
  labelText,
  bigDropdown,
}) {
  const defaultOption = html`<option
    key=${defaultValue}
    value=${defaultValue}
    disabled
  >
    ${defaultText}
  </option>`;

  const errorOption = html`<option disabled>Error loading data</option>`;
  const loadingOption = html`<option disabled>Loading...</option>`;
  const selectableOptions = options.map(
    (o) => html`<option key=${o} value=${o.value}>${o.text}</option>`,
  );

  let optionSelections;
  if (isError) {
    optionSelections = [errorOption];
  } else if (isLoading) {
    optionSelections = [loadingOption];
  } else {
    optionSelections = [defaultOption, ...selectableOptions];
  }

  const label = !bigDropdown && html`<label class="label">${labelText}</label>`;
  const selectHandler = (e) => {
    e.preventDefault();
    onSelect(e.target.value);
  };
  return html`<div class=${bigDropdown ? 'dropdown-big' : 'dropdown'}>
    ${label}
    <select value=${value} class="select" onChange=${selectHandler}>
      ${optionSelections}
    </select>
  </div>`;
}
