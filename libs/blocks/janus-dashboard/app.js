import { html } from '../../deps/htm-preact.js';
import { PreprocessWrapper } from './components/PreprocessWrapper.js';
import FilterWrapper from './components/FilterWrapper.js';
import useGetData from './hooks/useGetData.js';
import Layout from './components/Layout.js';

function DashboardApp() {
  const { isLoading, data } = useGetData();
  if (isLoading) {
    return 'Loading...';
  }
  return html`
  <${PreprocessWrapper} results=${data}>
    <${FilterWrapper}>
      <${Layout} />
    </${FilterWrapper}>
  </${PreprocessWrapper}
  >`;
}

export default DashboardApp;
