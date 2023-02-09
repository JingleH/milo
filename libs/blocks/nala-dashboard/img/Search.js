import { html } from '../../../deps/htm-preact.js';

export default function Search() {
  return html`<svg
    xmlns="http://www.w3.org/2000/svg"
    height="18"
    viewBox="0 0 18 18"
    width="18"
  >
    <defs>
      <style>
        .fill {
          fill: #464646;
        }
      </style>
    </defs>
    <title>S Search 18 N</title>
    <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18" />
    <path
      class="fill"
      d="M16.5865,15.107,12.7,11.2215A6.413,6.413,0,1,0,11.2215,12.7l3.886,3.886a1.05,1.05,0,0,0,1.479-1.479ZM3,7.5A4.5,4.5,0,1,1,7.5,12,4.5,4.5,0,0,1,3,7.5Z"
    />
  </svg>`;
}