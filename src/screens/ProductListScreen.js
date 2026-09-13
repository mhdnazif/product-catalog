import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import ProductImage from '../components/ProductImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '../hooks/useProducts';
import { useState } from 'react';

export default function ProductListScreen({ navigation }) {
  const [searchText, setSearchText] = useState(''); 
  const {
    products,
    total,
    status,
    errorMessage,
    loadingMore,
    loadMoreError,
    hasMore,
    loadMore,
    refresh,
    refreshing,
    refreshError,
    retry,
    retryLoadMore,
  } = useProducts(searchText);

  function renderProduct({ item }) {
    return (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`View details for ${item.title}`}
        onPress={() =>
          navigation.navigate('ProductDetail', {
            productId: item.id,
          })
        }
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <ProductImage
          uri={item.thumbnail}
          style={styles.thumbnail}
          accesibility={item.title}
        />

        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>
            {item.title}
          </Text>

          <Text style={styles.price}>
            ${item.price.toFixed(2)}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
<View style={styles.header}>
  <Text style={styles.heading}>Product Catalog</Text>

  <Text style={styles.subtitle}>
    Discover your next favourite product.
  </Text>

  <View style={styles.searchContainer}>
    <TextInput
      style={styles.searchInput}
      placeholder="Search products..."
      placeholderTextColor="#64748B"
      value={searchText}
      onChangeText={setSearchText}
      autoCapitalize="none"
      autoCorrect={false}
      returnKeyType="search"
      accessibilityLabel="Search products"
    />

    {searchText.length > 0 && (
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Clear search"
        onPress={() => setSearchText('')}
        style={styles.clearButton}
      >
        <Text style={styles.clearText}>Clear</Text>
      </Pressable>
    )}
  </View>
</View>

      {status === 'loading' && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>
            {searchText.trim()
                ? 'Searching products...'
                : 'Loading products...'}
          </Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.errorTitle}>
            Could not load products
          </Text>

          <Text style={styles.stateText}>
            {errorMessage}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={retry}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {status === 'success' && (
        <FlatList
          style={styles.list}
          data={products}
          renderItem={renderProduct}
          refreshing={refreshing}
          onRefresh={refresh}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          keyExtractor={(item) => String(item.id)}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={
            products.length === 0
              ? styles.emptyList
              : styles.listContent
          }
          ListHeaderComponent={
            refreshError ? (
              <View style={styles.refreshBanner}>
                <Text style={styles.refreshErrorTitle}>
                  Could not refresh products
                </Text>

                <Text style={styles.refreshErrorText}>
                  {refreshError}
                </Text>

                <Text style={styles.refreshErrorText}>
                  Your previous results are still displayed.
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={refresh}
                  style={styles.refreshRetryButton}
                >
                  <Text style={styles.retryText}>Retry refresh</Text>
                </Pressable>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.stateContainer}>
              <Text style={styles.emptyTitle}>
                No products found
              </Text>

              <Text style={styles.stateText}>
                {searchText.trim()
                    ? `No matches for "${searchText.trim()}". Try another keyword.`
                    : 'There are no products to display.'}
                </Text>
            </View>
          }
          ListFooterComponent={
            products.length > 0 ? (
                <View style={styles.footer}>
                {loadingMore ? (
                    <View>
                    <ActivityIndicator size="small" color="#2563EB" />
                    <Text style={styles.footerText}>
                        Loading more products...
                    </Text>
                    </View>
                ) : loadMoreError ? (
                    <View>
                    <Text style={styles.footerError}>
                        Could not load more products.
                    </Text>

                    <Text style={styles.stateText}>
                        {loadMoreError}
                    </Text>

                    <Pressable
                        accessibilityRole="button"
                        onPress={retryLoadMore}
                        style={styles.retryButton}
                    >
                        <Text style={styles.retryText}>
                        Retry loading more
                        </Text>
                    </Pressable>
                    </View>
                ) : (
                    <Text style={styles.footerText}>
                    {hasMore
                        ? `Showing ${products.length} of ${total} products`
                        : `You've reached the end — ${products.length} products`}
                    </Text>
                )}
                </View>
            ) : null
            }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0F172A',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#64748B',
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: 16,
  },
  emptyList: {
    flexGrow: 1,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 12,
    marginBottom: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  thumbnail: {
    width: 88,
    height: 88,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
  },
  productInfo: {
    flex: 1,
    marginLeft: 16,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  price: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '700',
    color: '#2563EB',
  },
  stateContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: {
    marginTop: 12,
    fontSize: 15,
    lineHeight: 22,
    color: '#64748B',
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#B91C1C',
    textAlign: 'center',
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
    refreshBanner: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    backgroundColor: '#FEF2F2',
  },
  refreshErrorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#991B1B',
  },
  refreshErrorText: {
    marginTop: 6,
    fontSize: 14,
    lineHeight: 20,
    color: '#7F1D1D',
  },
  refreshRetryButton: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#2563EB',
  },
  retryButton: {
    marginTop: 20,
    paddingHorizontal: 28,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#2563EB',
  },
  retryText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerText: {
    paddingVertical: 16,
    textAlign: 'center',
    color: '#64748B',
  },
    footer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerError: {
    fontSize: 15,
    fontWeight: '600',
    color: '#B91C1C',
    textAlign: 'center',
  },
    cardPressed: {
    opacity: 0.7,
    backgroundColor: '#EFF6FF',
  },
    searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
  searchInput: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0F172A',
  },
  clearButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 14,
  },
  clearText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB',
  },
});