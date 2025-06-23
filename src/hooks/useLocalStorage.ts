// Custom Hook für Local Storage Management

import { useState, useEffect, useCallback } from 'react';
import type { FilterOptions } from '../types';
import { storage } from '../utils/helpers';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State für den Wert
  const [storedValue, setStoredValue] = useState<T>(() => {
    return storage.get(key, initialValue);
  });

  // Wert setzen
  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      // Funktion oder direkter Wert
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      setStoredValue(valueToStore);
      storage.set(key, valueToStore);
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Wert entfernen
  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue);
      storage.remove(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Storage events von anderen Tabs/Windows abfangen
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue !== null) {
        try {
          setStoredValue(JSON.parse(e.newValue));
        } catch (error) {
          console.error(`Error parsing localStorage value for key "${key}":`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key]);

  return [storedValue, setValue, removeValue];
}

// Hook für App-spezifische Storage-Funktionen
export const useAppStorage = {
    // Aktuelle Liste speichern/laden
    useSelectedList: () => useLocalStorage('shopping-list-selected-list', null as string | null),
    
    // Aktueller Benutzer
    useCurrentUser: () => useLocalStorage('shopping-list-current-user', 'jana-uuid'),
    
    // Filter-Einstellungen
    useFilters: (): [FilterOptions, (value: FilterOptions | ((val: FilterOptions) => FilterOptions)) => void, () => void] => {
      const initialFilters: FilterOptions = {
        searchTerm: undefined,
        assignedTo: undefined,
        store: undefined,
        category: undefined,
        completed: undefined
      };

      const storedFilters: FilterOptions = storage.get('shopping-list-filters', initialFilters);

      // Einfache Migration: Wenn alte Keys wie 'purchased' oder 'all'-Werte existieren, zurücksetzen.
      const isOutdated = 'purchased' in storedFilters || 
                         Object.values(storedFilters).includes('all');

      const validatedFilters = isOutdated ? initialFilters : storedFilters;

      if (isOutdated) {
        storage.set('shopping-list-filters', validatedFilters);
      }

      return useLocalStorage('shopping-list-filters', validatedFilters);
    },
    
    // Notification-Einstellungen
    useNotificationsEnabled: () => useLocalStorage('shopping-list-notifications', false),
    
    // Theme-Einstellungen
    useTheme: () => useLocalStorage('shopping-list-theme', 'light'),
    
    // Zuletzt verwendete Artikel für Vorschläge
    useRecentItems: () => useLocalStorage('shopping-list-recent-items', [] as string[]),
    
    // App-Einstellungen
    useAppSettings: () => useLocalStorage('shopping-list-settings', {
      autoSave: true,
      enableSounds: true,
      enableAnimations: true,
      defaultStore: 'Edeka',
      showPriceEstimates: true,
      groupByCategory: false,
      sortOrder: 'manual'
    })
};

export default useLocalStorage;
