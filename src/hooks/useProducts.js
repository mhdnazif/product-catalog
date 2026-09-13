import { useCallback, useEffect, useRef, useState } from 'react';
import { getProducts } from '../data/productsApi';

const PAGE_SIZE = 20;
const SEARCH_DELAY = 400;

export function useProducts(searchText = '') {
  const query = searchText.trim();

  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  const [loadingMore, setLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState('');
  const [hasMore, setHasMore] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState('');

  const requestRef = useRef(null);
  const nextSkipRef = useRef(0);
  const hasMoreRef = useRef(false);

  const loadPage = useCallback(async (mode = 'initial') => {
    const isRefresh = mode === 'refresh';
    const isMore = mode === 'more';

    // Refresh takes priority over an existing page request.
    if (isRefresh) {
      const previousRequest = requestRef.current;
      requestRef.current = null;
      previousRequest?.abort();
    } else if (requestRef.current !== null) {
      return;
    }

    if (isMore && !hasMoreRef.current) {
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    const skip = isMore ? nextSkipRef.current : 0;

    if (isRefresh) {
      setRefreshing(true);
      setRefreshError('');
      setLoadingMore(false);
      setLoadMoreError('');
    } else if (isMore) {
      setLoadingMore(true);
      setLoadMoreError('');
    } else {
      setStatus('loading');
      setErrorMessage('');
      setLoadMoreError('');
      setRefreshError('');
    }

    try {
      const data = await getProducts({
        limit: PAGE_SIZE,
        skip,
        query,
        signal: controller.signal,
      });

      // Ignore results belonging to a cancelled request.
      if (requestRef.current !== controller) {
        return;
      }

      const nextSkip = skip + data.products.length;
      const moreAvailable =
        data.products.length > 0 && nextSkip < data.total;

      nextSkipRef.current = nextSkip;
      hasMoreRef.current = moreAvailable;

      setTotal(data.total);
      setHasMore(moreAvailable);

      setProducts((previousProducts) => {
        // Initial loads and refreshes replace the list.
        if (!isMore) {
          return data.products;
        }

        const existingIds = new Set(
          previousProducts.map((product) => product.id)
        );

        const newProducts = data.products.filter(
          (product) => !existingIds.has(product.id)
        );

        return [...previousProducts, ...newProducts];
      });

      setStatus('success');
    } catch (error) {
      if (requestRef.current !== controller) {
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.';

      if (isRefresh) {
        // Keep existing products and pagination position.
        setRefreshError(message);
      } else if (isMore) {
        setLoadMoreError(message);
      } else {
        setErrorMessage(message);
        setStatus('error');
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  }, [query]);

  useEffect(() => {
    nextSkipRef.current = 0;
    hasMoreRef.current = false;

    setProducts([]);
    setTotal(0);
    setHasMore(false);
    setStatus('loading');
    setErrorMessage('');
    setLoadingMore(false);
    setLoadMoreError('');
    setRefreshing(false);
    setRefreshError('');

    const delay = query ? SEARCH_DELAY : 0;

    const timer = setTimeout(() => {
      loadPage('initial');
    }, delay);

    return () => {
      clearTimeout(timer);

      const controller = requestRef.current;
      requestRef.current = null;
      controller?.abort();
    };
  }, [query, loadPage]);

  function loadMore() {
    if (
      status === 'success' &&
      !refreshing &&
      !loadMoreError &&
      !refreshError
    ) {
      loadPage('more');
    }
  }

  function refresh() {
    if (status === 'success' && !refreshing) {
      loadPage('refresh');
    }
  }

  return {
    products,
    total,
    status,
    errorMessage,
    loadingMore,
    loadMoreError,
    hasMore,
    refreshing,
    refreshError,
    loadMore,
    refresh,
    retry: () => loadPage('initial'),
    retryLoadMore: () => loadPage('more'),
  };
}