import type { Store } from '@/data/store';
import { emptyStore, StoreContext } from '@/data/store';

import useSyncedState from '@/hooks/useSyncedState';
import { Stack } from 'expo-router';

export default function RootLayout() {
  const [store, setStore] = useSyncedState<Store>('store', emptyStore());

  return (
    <StoreContext.Provider value={[store, setStore]}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </StoreContext.Provider>
  );
}
