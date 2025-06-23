// Anwendungskonstanten für die Einkaufslisten-App

import type { StoreType, CategoryType } from '../types';

// Geschäfte/Stores
export const STORES: Array<{ name: StoreType; color: string; icon: string; type: string }> = [
  { name: 'Edeka', color: '#FFA500', icon: '🏪', type: 'Supermarkt' },
  { name: 'Lidl', color: '#0050AA', icon: '🛒', type: 'Discounter' },
  { name: 'Aldi', color: '#FF6B35', icon: '🛒', type: 'Discounter' },
  { name: 'Penny', color: '#E31837', icon: '🛒', type: 'Discounter' },
  { name: 'Rossmann', color: '#D40511', icon: '💊', type: 'Drogerie' },
  { name: 'DM', color: '#00A3E0', icon: '💊', type: 'Drogerie' },
  { name: 'Andere', color: '#64748B', icon: '🏬', type: 'Sonstige' }
];

// Kategorien
export const CATEGORIES: Array<{ name: CategoryType; icon: string; color: string; order: number }> = [
  { name: 'Obst & Gemüse', icon: '🥕', color: '#10B981', order: 1 },
  { name: 'Milchprodukte', icon: '🥛', color: '#FBBF24', order: 2 },
  { name: 'Fleisch & Fisch', icon: '🍖', color: '#EF4444', order: 3 },
  { name: 'Brot & Backwaren', icon: '🍞', color: '#92400E', order: 4 },
  { name: 'Tiefkühlprodukte', icon: '❄️', color: '#06B6D4', order: 5 },
  { name: 'Konserven', icon: '🥫', color: '#6B7280', order: 6 },
  { name: 'Getränke', icon: '🥤', color: '#3B82F6', order: 7 },
  { name: 'Süßwaren & Snacks', icon: '🍫', color: '#F59E0B', order: 8 },
  { name: 'Hygiene & Kosmetik', icon: '🧴', color: '#8B5CF6', order: 9 },
  { name: 'Haushalt & Reinigung', icon: '🧽', color: '#059669', order: 10 },
  { name: 'Sonstiges', icon: '📦', color: '#64748B', order: 11 }
];

// Benutzer (Hard-coded für Jana & Nico)
export const USERS = [
  {
    id: 'jana-uuid',
    name: 'Jana',
    email: 'jana@example.com',
    avatar: '/images/jana-avatar.jpg'
  },
  {
    id: 'nico-uuid',
    name: 'Nico', 
    email: 'nico@example.com',
    avatar: '/images/nico-avatar.jpg'
  }
];

// API Endpunkte
export const API_ENDPOINTS = {
  AI_CATEGORIZE: '/api/ai/categorize',
  AI_SUGGESTIONS: '/api/ai/suggestions',
  AI_PRICE_ESTIMATE: '/api/ai/price-estimate',
  NOTIFICATIONS_SEND: '/api/notifications/send',
  WEBHOOK_SUPABASE: '/api/webhook/supabase',
  HEALTH: '/api/health'
};

// UI Konstanten
export const UI_CONSTANTS = {
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300,
  MAX_SUGGESTIONS: 5,
  TOAST_DURATION: 3000,
  SWIPE_THRESHOLD: 100,
  DRAG_THRESHOLD: 5
};

// Nachrichten und Texte
export const MESSAGES = {
  ERRORS: {
    NETWORK: 'Netzwerkfehler. Bitte versuchen Sie es erneut.',
    UNKNOWN: 'Ein unbekannter Fehler ist aufgetreten.',
    ITEM_NOT_FOUND: 'Artikel nicht gefunden.',
    LIST_NOT_FOUND: 'Liste nicht gefunden.',
    VALIDATION: 'Ungültige Eingabe.',
    UNAUTHORIZED: 'Nicht autorisiert.'
  },
  SUCCESS: {
    ITEM_ADDED: 'Artikel hinzugefügt',
    ITEM_UPDATED: 'Artikel aktualisiert',
    ITEM_DELETED: 'Artikel gelöscht',
    ITEM_PURCHASED: 'Als gekauft markiert',
    ITEM_UNPURCHASED: 'Als nicht gekauft markiert',
    LIST_CREATED: 'Liste erstellt',
    LIST_UPDATED: 'Liste aktualisiert',
    LIST_DELETED: 'Liste gelöscht'
  },
  INFO: {
    LOADING: 'Wird geladen...',
    EMPTY_LIST: 'Keine Artikel in der Liste',
    EMPTY_SUGGESTIONS: 'Keine Vorschläge verfügbar',
    SYNC_IN_PROGRESS: 'Synchronisation läuft...',
    PRICE_ESTIMATED: 'Geschätzte Kosten berechnet'
  }
};

// Local Storage Keys
export const STORAGE_KEYS = {
  SELECTED_LIST: 'shopping-list-selected-list',
  CURRENT_USER: 'shopping-list-current-user',
  FILTERS: 'shopping-list-filters',
  NOTIFICATIONS_ENABLED: 'shopping-list-notifications',
  THEME: 'shopping-list-theme'
};

// Swipe Gestures
export const SWIPE_DIRECTIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
} as const;

// Filter Optionen für UI
export const FILTER_OPTIONS = {
  ALL_USERS: 'all',
  ALL_STORES: 'all',
  ALL_CATEGORIES: 'all'
};

// Theme Colors (Tailwind)
export const THEME_COLORS = {
  PRIMARY: 'bg-blue-600',
  SECONDARY: 'bg-gray-600',
  SUCCESS: 'bg-green-600',
  WARNING: 'bg-yellow-600',
  ERROR: 'bg-red-600',
  INFO: 'bg-blue-500'
};

// Responsive Breakpoints (entspricht Tailwind)
export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280,
  '2XL': 1536
};

// PWA Manifest Konfiguration
export const PWA_CONFIG = {
  name: 'Einkaufsliste - Jana & Nico',
  short_name: 'Einkaufsliste',
  description: 'KI-gestützte Einkaufslisten-App für Jana und Nico',
  theme_color: '#3B82F6',
  background_color: '#ffffff',
  display: 'standalone',
  orientation: 'portrait',
  start_url: '/',
  scope: '/'
};

// Service Worker Konfiguration
export const SW_CONFIG = {
  UPDATE_AVAILABLE: 'sw-update-available',
  OFFLINE: 'sw-offline',
  ONLINE: 'sw-online'
};

export default {
  STORES,
  CATEGORIES,
  USERS,
  API_ENDPOINTS,
  UI_CONSTANTS,
  MESSAGES,
  STORAGE_KEYS,
  SWIPE_DIRECTIONS,
  FILTER_OPTIONS,
  THEME_COLORS,
  BREAKPOINTS,
  PWA_CONFIG,
  SW_CONFIG
};
