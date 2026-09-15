# Product Catalog

A React Native product catalog built with Expo and JavaScript for a mobile development assignment. Browse products from DummyJSON, search the full catalog, and open individual product details.

Repository: [mhdnazif/product-catalog](https://github.com/mhdnazif/product-catalog)

## Features

- Product list with titles, thumbnails, and prices.
- Infinite scrolling in batches of 20 using `limit` and `skip`.
- Product details with description, price, rating, and images.
- Distinct loading, success, empty, and error states with Retry actions.
- Server-side search with a 400 ms debounce and a Clear button.
- Pull-to-refresh that preserves the current search term.
- Reusable image component with loading indicators and unavailable-image fallbacks.
- Eight API unit tests with mocked network responses.

## Technology

| Tool | Version declared in package.json |
| --- | --- |
| Expo | ~57.0.22 |
| React Native | 0.86.3 |
| React | 19.2.3 |
| React Navigation | Native ^7.3.18; native stack ^7.18.10 |
| Jest | ~29.7.0 |
| jest-expo | ~57.0.5 |

Exact dependency resolutions are recorded in `package-lock.json`.

## Run on Android

### Prerequisites

- Node.js 22.13 or newer, using a supported LTS release, and npm. See the [Expo SDK 57 requirements](https://docs.expo.dev/versions/v57.0.0/).
- Git.
- An Android emulator configured in Android Studio, or an Android phone with an Expo Go version compatible with SDK 57.
- Internet access for the product API and remote images.

### Install and start

```bash
git clone https://github.com/mhdnazif/product-catalog.git
cd product-catalog
npm ci
npx expo start
```

For an emulator, start the virtual device, wait for the Android home screen, and press `a` in the Expo terminal. Alternatively, run `npm run android` after starting the emulator.

For a physical Android phone, connect it and the laptop to the same Wi-Fi network and scan the QR code with a compatible Expo Go app.

No API key, backend setup, or environment file is required. If the repository is private, clone access must be granted to the reviewer.

Development was checked on Windows with an Android Pixel 7 emulator. iOS and web have not been validated for this submission.

## Code organization

| File | Responsibility |
| --- | --- |
| `App.js` | Navigation container, screen registration, and safe-area provider |
| `src/data/productsApi.js` | List/search and detail requests, HTTP error handling, and basic response validation |
| `src/hooks/useProducts.js` | List state, debounce, pagination, refresh, and request cancellation |
| `src/screens/ProductListScreen.js` | Search input, product cards, list states, and navigation to details |
| `src/screens/ProductDetailScreen.js` | Detail request lifecycle and product presentation |
| `src/components/ProductImage.js` | Shared image loading, success, and error presentation |
| `__tests__/productApi.test.js` | API unit tests |

The data layer handles requests without depending on screen components. The presentation layer uses those functions to manage and display results. List behaviour is extracted into a custom hook; the detail screen owns its smaller request lifecycle.

## API and implementation decisions

The app uses the [DummyJSON products API](https://dummyjson.com/docs/products):

| Purpose | Request |
| --- | --- |
| List | `GET /products?limit=20&skip=0` |
| Search | `GET /products/search?q=phone&limit=20&skip=0` |
| Detail | `GET /products/{id}` |

### Server-side search

Search uses the API instead of filtering only downloaded products, so matches can come from the full catalog. Search text is trimmed and URL-encoded. A 400 ms debounce reduces requests during typing; clearing the search reloads the normal catalog without that delay.

Changing the query resets pagination and clears the previous results. Cleanup cancels pending timers and requests. Request identity checks prevent cancelled responses from updating the list.

### Pagination

`FlatList.onEndReached` requests another batch near the bottom. A request reference prevents overlapping page loads. The next offset advances by the number of returned records, and loading stops at the API total or an empty page. Incoming IDs already in the list are filtered out.

### Refresh and errors

Refresh requests the first page for the current query and takes priority over an in-flight page request. Existing results remain visible until success; success replaces them and resets the next offset. Refresh failure keeps the previous results and offers Retry in a banner. Pagination failures use a separate footer Retry action. Initial and detail failures have their own full-screen states.

### Navigation and images

Cards pass only the product ID to the detail screen, which fetches its full data. A 404 produces a product-not-found state. Each image reserves its display area, shows a spinner while loading, and displays a fallback on failure. A changed URL resets the image component state.

Prices are displayed with a dollar symbol and two decimal places; the app does not perform currency conversion.

## Automated tests

```bash
npm test -- --runInBand
```

The suite contains eight tests covering:

1. List pagination parameters and returned data.
2. Search trimming, URL encoding, and pagination parameters.
3. Successful empty results.
4. HTTP server failure.
5. An invalid product-list response.
6. Network failure propagation.
7. Detail request and returned product.
8. A missing product returning `null`.

`fetch` is mocked, so tests do not require the emulator or internet access. These tests cover the API layer; they do not establish UI, timing, or navigation correctness.

## Manual verification

| Check | Expected behaviour |
| --- | --- |
| Open the catalog | Loading state followed by product cards |
| Scroll through multiple pages | More products append without replacing existing ones |
| Search and quickly change the query | Results correspond to the final query |
| Search `zzzznotaproduct123` | Empty state with the query shown |
| Clear search | Normal catalog returns |
| Open a card and go back | Correct details; previous list state remains available |
| Refresh a search | Query remains and its first page reloads |
| Refresh with no connection | On failure, old products remain with a Retry banner |
| Restore connection and retry | Request can succeed again |
| Temporarily supply a broken image URL locally | Image fallback appears while product text remains usable |

Restore any temporary test URLs before committing or recording the final walkthrough.

## Scope and limitations

- Product results are stored in memory; there is no persistent offline catalog.
- Requests are cancelled when superseded or the screen is removed, but there is no explicit request timeout. Network failure feedback can therefore be delayed.
- Validation checks the overall list shape and basic detail fields, not every field of every list record.
- An image failure shows a fallback; there is no dedicated image retry button.
- The API suite does not yet automate debounce, refresh, navigation, or image rendering tests.