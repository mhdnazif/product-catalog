import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export default function ProductImage({
  uri,
  style,
  accessibilityLabel = 'Product image',
}) {
  const imageUri = typeof uri === 'string' ? uri.trim() : '';

  return (
    <ImageWithState
      key={imageUri}
      uri={imageUri}
      style={style}
      accessibilityLabel={accessibilityLabel}
    />
  );
}

function ImageWithState({ uri, style, accessibilityLabel }) {
  const [status, setStatus] = useState(
    uri ? 'loading' : 'error'
  );

  const label =
    status === 'loading'
      ? `Loading ${accessibilityLabel}`
      : status === 'error'
        ? `${accessibilityLabel}: image unavailable`
        : accessibilityLabel;

  return (
    <View
      style={[styles.container, style]}
      accessible
      accessibilityRole="image"
      accessibilityLabel={label}
    >
      {uri && status !== 'error' ? (
        <Image
          source={{ uri }}
          style={styles.image}
          resizeMode="contain"
          accessible={false}
          onLoad={() => setStatus('success')}
          onError={() => setStatus('error')}
        />
      ) : null}

      {status === 'loading' && (
        <View
          style={styles.overlay}
          pointerEvents="none"
        >
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      )}

      {status === 'error' && (
        <View
          style={styles.overlay}
          pointerEvents="none"
        >
          <Text style={styles.fallbackText}>
            Image unavailable
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: '#F1F5F9',
  },
  image: {
    width: '100%',
    height: '100%'
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    backgroundColor: '#F1F5F9',
  },
  fallbackText: {
    fontSize: 12,
    lineHeight: 16,
    color: '#64748B',
    textAlign: 'center',
  },
});