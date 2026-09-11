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

  const requestRef = useRef(null);
  const nextSkipRef = useRef(0);
  const hasMoreRef = useRef(false);

  const loadPage = useCallback(async (firstPage = false) => {
    if (requestRef.current !== null) {
      return;
    }

    if (!firstPage && !hasMoreRef.current) {
      return;
    }

    const controller = new AbortController();
    requestRef.current = controller;

    const skip = firstPage ? 0 : nextSkipRef.current;

    if (firstPage) {
      setStatus('loading');
      setErrorMessage('');
      setLoadMoreError('');
    } else {
      setLoadingMore(true);
      setLoadMoreError('');
    }

    try {
      const data = await getProducts({
        limit: PAGE_SIZE,
        skip,
        query,
        signal: controller.signal,
      });

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
        if (firstPage) {
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

      if (firstPage) {
        setErrorMessage(message);
        setStatus('error');
      } else {
        setLoadMoreError(message);
      }
    } finally {
      if (requestRef.current === controller) {
        requestRef.current = null;
        setLoadingMore(false);
      }
    }
  }, [query]);

  useEffect(() => {
    // A new search always starts from the first page.
    nextSkipRef.current = 0;
    hasMoreRef.current = false;

    setProducts([]);
    setTotal(0);
    setHasMore(false);
    setStatus('loading');
    setErrorMessage('');
    setLoadMoreError('');
    setLoadingMore(false);

    // Empty search loads the normal catalog without a debounce delay.
    const delay = query ? SEARCH_DELAY : 0;

    const timer = setTimeout(() => {
      loadPage(true);
    }, delay);

    return () => {
      clearTimeout(timer);

      const controller = requestRef.current;
      requestRef.current = null;
      controller?.abort();
    };
  }, [query, loadPage]);

  function loadMore() {
    if (status === 'success' && !loadMoreError) {
      loadPage(false);
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
    loadMore,
    retry: () => loadPage(true),
    retryLoadMore: () => loadPage(false),
  };
}