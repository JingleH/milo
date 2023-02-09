import { html, useErrorBoundary } from '../../../deps/htm-preact.js';

export default function ErrorBoundary({ children }) {
  const [error] = useErrorBoundary();
  if (error) {
    console.error(error);
    return html`<div class="whole-block">
      <p>Oh no! We ran into an error: ${error.message}</p>
    </div>`;
  }
  return children;
}
