const BASE_URL = 'https://dummyjson.com';

export async function getProducts({
  limit = 20,
  skip = 0,
  query = '',
  signal,
} = {}) {
  const searchTerm = query.trim();

  const url = searchTerm
    ? `${BASE_URL}/products/search?q=${encodeURIComponent(searchTerm)}&limit=${limit}&skip=${skip}`
    : `${BASE_URL}/products?limit=${limit}&skip=${skip}`;

  const response = await fetch(url, { signal });

  if (!response.ok) {
    throw new Error(
      `Unable to load products. Server returned ${response.status}.`
    );
  }

  const data = await response.json();

  if (
    !Array.isArray(data.products) ||
    !Number.isFinite(data.total) ||
    data.total < 0
  ) {
    throw new Error('The server returned an unexpected product list.');
  }

  return data;
}

// Fetch one product for the detail screen.
export async function getProductById(id, { signal } = {}) {
  const response = await fetch(
    `${BASE_URL}/products/${encodeURIComponent(id)}`,
    { signal }
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Unable to load this product. Server returned ${response.status}.`
    );
  }

  const data = await response.json();

  if (
    !data ||
    typeof data.id !== 'number' ||
    typeof data.title !== 'string' ||
    typeof data.price !== 'number'
  ) {
    throw new Error('The server returned unexpected product information.');
  }

  return data;
}