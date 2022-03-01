import 'react-native-gesture-handler';
import React from 'react';
import { BleManager } from 'react-native-ble-plx';
export const bleManager = new BleManager();

import { DataProvider } from './src/hooks';
import AppNavigation from './src/navigation/App';

export default function App() {
  return (
    <DataProvider>
      <AppNavigation />
    </DataProvider>
  );
}
