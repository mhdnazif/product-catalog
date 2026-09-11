import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '../hooks/useProducts';

export default function ProductListScreen() {
  const {
    products,
    total,
    status,
    errorMessage,
    loadingMore,
    loadMoreError,
    hasMore,
    loadMore,
    retry,
    retryLoadMore,
  } = useProducts();

  function renderProduct({ item }) {
    return (
      <View style={styles.card}>
        <Image
          source={{ uri: item.thumbnail }}
          style={styles.thumbnail}
          resizeMode="contain"
          accessibilityLabel={item.title}
        />

        <View style={styles.productInfo}>
          <Text style={styles.productTitle}>
            {item.title}
          </Text>

          <Text style={styles.price}>
            ${item.price.toFixed(2)}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.heading}>Product Catalog</Text>
        <Text style={styles.subtitle}>
          Discover your next favourite product.
        </Text>
      </View>

      {status === 'loading' && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>Loading products...</Text>
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
          keyExtractor={(item) => String(item.id)}
          onEndReached={loadMore}
          onEndReachedThreshold={0.5}
          contentContainerStyle={
            products.length === 0
              ? styles.emptyList
              : styles.listContent
          }
          ListEmptyComponent={
            <View style={styles.stateContainer}>
              <Text style={styles.emptyTitle}>
                No products found
              </Text>

              <Text style={styles.stateText}>
                There are no products to display.
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
});