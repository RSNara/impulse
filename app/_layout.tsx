import type { Store } from '@/data/store';
import { defaultStore, load, save, StoreContext } from '@/data/store';
import useDebounced from '@/hooks/useDebounced';
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';

export default function RootLayout() {
  const [store, setStore] = useState<Store>(defaultStore());
  const [syncStore, setSyncStore] = useState<boolean>(false);
  const saveStore = useDebounced((store: Store) => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    console.log(`Syncing store: ${hh}:${mm}:${ss}`);
    console.log('Store: ', store);
    save(store);
  }, 1000);

  useEffect(() => {
    if (syncStore) {
      saveStore(store);
    }
  }, [store, syncStore]);

  useEffect(() => {
    load()
      .then((savedStore) => {
        console.log(savedStore);
        setStore(savedStore);
        setSyncStore(true);
      })
      .catch((ex) => {
        console.warn(ex);
      });
  }, []);

  return (
    <StoreContext.Provider value={[store, setStore]}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </StoreContext.Provider>
  );
}

// 0s fn()
// 1s fn()
// 5s fn()
