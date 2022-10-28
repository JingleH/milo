import { useState } from '../../../deps/htm-preact.js';
import results from '../results.js';

export default function useGetData() {
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState();
  setTimeout(() => {
    setData(results);
    setIsLoading(false);
  }, 2000);
  return { isLoading, data };
}
