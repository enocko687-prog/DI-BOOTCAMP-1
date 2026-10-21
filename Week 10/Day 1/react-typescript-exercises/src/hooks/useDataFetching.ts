import { useCallback, useEffect, useRef, useState } from "react";

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

interface UseDataFetchingConfig<T> {
  maxAge: number;
  parse: (value: unknown) => T;
}

type FetchState<T> =
  | { status: "loading" }
  | { status: "success"; data: T; fetchedAt: number; fromCache: boolean }
  | { status: "error"; message: string };

const responseCache = new Map<string, CacheEntry>();

function useDataFetching<T>(
  url: string,
  { maxAge, parse }: UseDataFetchingConfig<T>,
) {
  const [state, setState] = useState<FetchState<T>>({ status: "loading" });
  const [requestId, setRequestId] = useState(0);
  const forceRefresh = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    const shouldForceRefresh = forceRefresh.current;
    forceRefresh.current = false;

    async function loadData() {
      const cachedEntry = responseCache.get(url);
      if (
        !shouldForceRefresh &&
        cachedEntry &&
        Date.now() - cachedEntry.timestamp < maxAge
      ) {
        try {
          setState({
            status: "success",
            data: parse(cachedEntry.data),
            fetchedAt: cachedEntry.timestamp,
            fromCache: true,
          });
          return;
        } catch (error) {
          responseCache.delete(url);
          setState({
            status: "error",
            message:
              error instanceof Error
                ? error.message
                : "Cached data did not match the expected format.",
          });
          return;
        }
      }

      setState({ status: "loading" });

      try {
        const response = await fetch(url, { signal: controller.signal });
        if (!response.ok) {
          throw new Error(`The request failed (${response.status}).`);
        }

        const rawData: unknown = await response.json();
        const data = parse(rawData);
        if (controller.signal.aborted) {
          return;
        }

        const timestamp = Date.now();
        responseCache.set(url, { data: rawData, timestamp });
        setState({ status: "success", data, fetchedAt: timestamp, fromCache: false });
      } catch (error) {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "An unexpected error occurred while loading data.",
        });
      }
    }

    void loadData();
    return () => controller.abort();
  }, [maxAge, parse, requestId, url]);

  const refetch = useCallback(() => {
    forceRefresh.current = true;
    setRequestId((currentId) => currentId + 1);
  }, []);

  const loadFromCache = useCallback(() => {
    forceRefresh.current = false;
    setRequestId((currentId) => currentId + 1);
  }, []);

  const invalidateCache = useCallback(() => {
    responseCache.delete(url);
  }, [url]);

  return { state, refetch, loadFromCache, invalidateCache };
}

export default useDataFetching;
