// Zentrale Konfigurationsdatei für Konstanten

import type { StoreType, CategoryType } from '../types';

export const STORES: StoreType[] = [
  'Edeka',
  'Lidl',
  'Aldi',
  'Penny',
  'Rossmann',
  'DM',
  'Andere',
];

export const CATEGORIES: CategoryType[] = [
  'Obst & Gemüse',
  'Milchprodukte',
  'Fleisch & Fisch',
  'Brot & Backwaren',
  'Tiefkühlprodukte',
  'Konserven',
  'Getränke',
  'Süßwaren & Snacks',
  'Hygiene & Kosmetik',
  'Haushalt & Reinigung',
  'Sonstiges',
];

export const USERS = {
  JANA: 'Jana',
  NICO: 'Nico',
};
