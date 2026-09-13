import {
  getProducts,
  getProductById,
} from '../src/data/productsApi';

const originalFetch = global.fetch;

beforeEach(() => {
  global.fetch = jest.fn();
});

afterEach(() => {
  global.fetch = originalFetch;
});

describe('getProducts', () => {
  test('requests the selected page and returns its products', async () => {
    const responseData = {
      products: [
        { id: 21, title: 'Test product', price: 12.5 },
      ],
      total: 100,
      skip: 20,
      limit: 20,
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseData,
    });

    const result = await getProducts({
      limit: 20,
      skip: 20,
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://dummyjson.com/products?limit=20&skip=20',
      { signal: undefined }
    );

    expect(result).toEqual(responseData);
  });

  test('trims and encodes search text while preserving pagination', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: [],
        total: 0,
      }),
    });

    await getProducts({
      query: '  phone & case  ',
      limit: 20,
      skip: 20,
    });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://dummyjson.com/products/search?q=phone%20%26%20case&limit=20&skip=20',
      { signal: undefined }
    );
  });

  test('accepts an empty product list as a successful result', async () => {
    const responseData = {
      products: [],
      total: 0,
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => responseData,
    });

    await expect(getProducts()).resolves.toEqual(responseData);
  });

  test('rejects an unsuccessful server response', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    await expect(getProducts()).rejects.toThrow(
      'Unable to load products. Server returned 500.'
    );
  });

  test('rejects an invalid product list', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        products: null,
        total: 10,
      }),
    });

    await expect(getProducts()).rejects.toThrow(
      'The server returned an unexpected product list.'
    );
  });

  test('passes a network failure to the calling code', async () => {
    global.fetch.mockRejectedValueOnce(
      new Error('Network request failed')
    );

    await expect(getProducts()).rejects.toThrow(
      'Network request failed'
    );
  });
});

describe('getProductById', () => {
  test('requests and returns the selected product', async () => {
    const product = {
      id: 7,
      title: 'Test fragrance',
      price: 29.99,
      description: 'A sample product.',
      rating: 4.2,
      images: [],
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => product,
    });

    const result = await getProductById(7);

    expect(global.fetch).toHaveBeenCalledWith(
      'https://dummyjson.com/products/7',
      { signal: undefined }
    );

    expect(result).toEqual(product);
  });

  test('returns null when the product does not exist', async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    await expect(getProductById(999999)).resolves.toBeNull();
  });
});