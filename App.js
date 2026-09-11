import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import ProductListScreen from './src/screens/ProductListScreen';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <ProductListScreen />
    </SafeAreaProvider>
  );
}