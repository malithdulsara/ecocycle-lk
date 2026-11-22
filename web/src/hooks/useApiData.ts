import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { getErrorMessage } from '../api/client';

// Loads data from the API when the page opens. Call reload() to load it again (e.g. after saving).
// "load" must not change on every render: pass a function from an api file, or wrap it in useCallback.
export function useApiData<T>(load: () => Promise<T>, initialValue: T) {
  const [data, setData] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let active = true; // ignore the answer if the page was closed before it arrived
    load()
      .then((result) => {
        if (active) {
          setData(result);
        }
      })
      .catch((error: unknown) => toast.error(getErrorMessage(error)))
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [load, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { data, setData, loading, reload };
}