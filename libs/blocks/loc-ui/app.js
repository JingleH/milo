import { html } from '../../deps/htm-preact.js';
import ErrorBoundary from '../nala-dashboard/wrappers/ErrorBoundary.js';
import LayoutWrapper from '../nala-dashboard/wrappers/LayoutWrapper.js';
import TaskMatrix from './components/TaskMatrix.js';
import SubProjects from './components/SubProjects.js';

function LocUIApp() {
  return html`
  <${ErrorBoundary}>
    <${LayoutWrapper}>
      <${SubProjects} />
      <${TaskMatrix} />
    </${LayoutWrapper}>
  </${ErrorBoundary}>`;
}

export default LocUIApp;