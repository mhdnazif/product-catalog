import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import ProductImage from '../components/ProductImage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getProductById } from '../data/productsApi';

export default function ProductDetailScreen({ route }) {
  const { productId } = route.params;

  const [product, setProduct] = useState(null);
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;

    async function loadProduct() {
      setStatus('loading');
      setProduct(null);
      setErrorMessage('');

      try {
        const data = await getProductById(productId, {
          signal: controller.signal,
        });

        if (!active) {
          return;
        }

        if (data === null) {
          setStatus('empty');
          return;
        }

        setProduct(data);
        setStatus('success');
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.'
        );
        setStatus('error');
      }
    }

    loadProduct();

    return () => {
      active = false;
      controller.abort();
    };
  }, [productId, retryCount]);

  return (
    <SafeAreaView
      style={styles.screen}
      edges={['left', 'right', 'bottom']}
    >
      {status === 'loading' && (
        <View style={styles.stateContainer}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.stateText}>
            Loading product details...
          </Text>
        </View>
      )}

      {status === 'error' && (
        <View style={styles.stateContainer}>
          <Text style={styles.errorTitle}>
            Could not load product
          </Text>

          <Text style={styles.stateText}>
            {errorMessage}
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={() => setRetryCount((count) => count + 1)}
            style={styles.retryButton}
          >
            <Text style={styles.retryText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {status === 'empty' && (
        <View style={styles.stateContainer}>
          <Text style={styles.sectionTitle}>
            Product not found
          </Text>

          <Text style={styles.stateText}>
            This product may no longer be available.
            Use the back button to return to the catalog.
          </Text>
        </View>
      )}

      {status === 'success' && product && (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.title}>{product.title}</Text>

          <Text style={styles.price}>
            ${product.price.toFixed(2)}
          </Text>

          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>
              {typeof product.rating === 'number'
                ? `★ ${product.rating.toFixed(1)} / 5`
                : 'No rating available'}
            </Text>
          </View>

          <Text style={styles.sectionTitle}>Description</Text>

          <Text style={styles.description}>
            {product.description || 'No description available.'}
          </Text>

          <Text style={styles.sectionTitle}>Product images</Text>

          {Array.isArray(product.images) &&
          product.images.length > 0 ? (
            product.images.map((uri, index) => (
              <ProductImage
                key={`${uri}-${index}`}
                uri={uri}
                source={{ uri }}
                style={styles.productImage}
                resizeMode="contain"
                accessibilityLabel={
                  `${product.title}, image ${index + 1}`
                }
              />
            ))
          ) : (
            <Text style={styles.description}>
              No images available.
            </Text>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#0F172A',
  },
  price: {
    marginTop: 12,
    fontSize: 26,
    fontWeight: '700',
    color: '#2563EB',
  },
  ratingBadge: {
    alignSelf: 'flex-start',
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FEF3C7',
  },
  ratingText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#92400E',
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 10,
    fontSize: 20,
    fontWeight: '700',
    color: '#0F172A',
  },
  description: {
    fontSize: 16,
    lineHeight: 25,
    color: '#475569',
  },
  productImage: {
    width: '100%',
    height: 280,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
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
});