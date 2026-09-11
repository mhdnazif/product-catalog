const BASE_URL = 'https://dummyjson.com';

export async function getProducts({
  limit = 20,
  skip = 0,
  signal,
} = {}) {
  const response = await fetch(
    `${BASE_URL}/products?limit=${limit}&skip=${skip}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(
      `Unable to load products. Server returned ${response.status}.`
    );
  }

  const data = await response.json();

  if (!Array.isArray(data.products)) {
    throw new Error('The server returned an unexpected product list.');
  }

  return data;
}