// Hilfsfunktionen für die Einkaufslisten-App

import type { ShoppingItem, CategoryType, StoreType, UserAvatar } from '../types';
import { CATEGORIES, STORES, USERS } from './constants';



// Datum formatieren (deutsch)
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Relative Zeit formatieren (z.B. "vor 2 Stunden")
export const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'gerade eben';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `vor ${minutes} Minute${minutes !== 1 ? 'n' : ''}`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `vor ${hours} Stunde${hours !== 1 ? 'n' : ''}`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `vor ${days} Tag${days !== 1 ? 'en' : ''}`;
  }
};

// GIBT DAS KORREKTE STORE-LOGO ZURÜCK
export const getStoreLogo = (storeName?: StoreType): string | null => {
  if (!storeName || storeName === 'Andere') return null;
  const logoMap: Record<string, string> = {
    'Aldi': '/images/aldi-logo.png',
    'DM': '/images/dm-logo.png',
    'Edeka': '/images/edeka-logo.png',
    'Lidl': '/images/lidl-logo.png',
    'Penny': '/images/penny-logo.png',
    'Rewe': '/images/rewe-logo.png',
    'Rossmann': '/images/rossmann-logo.png',
  };
  return logoMap[storeName] || null;
};

// GIBT EIN AVATAR-OBJEKT FÜR DEN BENUTZER ZURÜCK
export const getUserAvatar = (userId?: string): UserAvatar | null => {
  if (!userId) return null;
  const user = USERS.find(u => u.id === userId);
  if (!user) return null;

  const avatarMap: Record<string, string> = {
    'Jana': '/images/j.png',
    'Nico': '/images/n.png',
  };

  const src = avatarMap[user.name];
  if (!src) return null;

  return {
    src: src,
    alt: user.name,
  };
};

// GIBT DAS KATEGORIE-ICON (EMOJI) ZURÜCK
export const getCategoryIcon = (categoryName?: CategoryType): string => {
  if (!categoryName) return '📦';
  const category = CATEGORIES.find(c => c.name === categoryName);
  return category ? category.icon : '📦';
};

// Artikel nach Kategorien gruppieren
export const groupItemsByCategory = (items: ShoppingItem[]): Record<string, ShoppingItem[]> => {
  const grouped: Record<string, ShoppingItem[]> = {};
  
  CATEGORIES.forEach(category => {
    grouped[category.name] = [];
  });
  grouped['Sonstiges'] = [];

  items.forEach(item => {
    const category = item.category || 'Sonstiges';
    if (grouped[category]) {
      grouped[category].push(item);
    } else {
      grouped['Sonstiges'].push(item);
    }
  });

  return grouped;
};

// Artikel nach Geschäft gruppieren
export const groupItemsByStore = (items: ShoppingItem[]): Record<string, ShoppingItem[]> => {
  const grouped: Record<string, ShoppingItem[]> = {};
  
  STORES.forEach(store => {
    grouped[store.name] = [];
  });
  grouped['Andere'] = [];

  items.forEach(item => {
    const store = item.store || 'Andere';
    if (grouped[store]) {
      grouped[store].push(item);
    } else {
      grouped['Andere'].push(item);
    }
  });

  return grouped;
};

// Artikel sortieren
export const sortItems = (items: ShoppingItem[], sortBy: 'name' | 'category' | 'store' | 'created' | 'manual' = 'manual'): ShoppingItem[] => {
  return [...items].sort((a, b) => {
    switch (sortBy) {
      case 'name': {
        return a.name.localeCompare(b.name, 'de-DE');
      }
      case 'category': {
        const aCategoryOrder = CATEGORIES.find(c => c.name === a.category)?.order || 999;
        const bCategoryOrder = CATEGORIES.find(c => c.name === b.category)?.order || 999;
        return aCategoryOrder - bCategoryOrder;
      }
      case 'store': {
        return (a.store || '').localeCompare(b.store || '', 'de-DE');
      }
      case 'created': {
        const aDate = new Date(a.createdAt || a.created_at || 0);
        const bDate = new Date(b.createdAt || b.created_at || 0);
        return bDate.getTime() - aDate.getTime(); // Neueste zuerst
      }
      case 'manual':
      default: {
        const aSortOrder = a.sortOrder || a.sort_order || 0;
        const bSortOrder = b.sortOrder || b.sort_order || 0;
        return aSortOrder - bSortOrder;
      }
    }
  });
};

// Artikel filtern
export const filterItems = (
  items: ShoppingItem[], 
  filters: {
    assignedTo?: string;
    store?: StoreType | string;
    category?: CategoryType | string;
    completed?: boolean;
    highlighted?: boolean;
    searchTerm?: string;
  }
): ShoppingItem[] => {
  return items.filter(item => {
    // Nach zugewiesener Person filtern
    if (filters.assignedTo) {
      const assignedTo = item.assignedTo || item.assigned_to;
      if (assignedTo !== filters.assignedTo) return false;
    }

    // Nach Geschäft filtern
    if (filters.store) {
      if (item.store !== filters.store) return false;
    }

    // Nach Kategorie filtern
    if (filters.category) {
      if (item.category !== filters.category) return false;
    }

    // Nach Gekauft-Status filtern
    if (filters.completed !== undefined) {
      if (item.completed !== filters.completed) return false;
    }

    // Nach Hervorhebung filtern


    // Nach Suchbegriff filtern
    if (filters.searchTerm) {
      const searchTerm = filters.searchTerm.toLowerCase();
      const nameMatch = item.name.toLowerCase().includes(searchTerm);
      const notesMatch = item.notes?.toLowerCase().includes(searchTerm);
      if (!nameMatch && !notesMatch) return false;
    }

    return true;
  });
};

// Klassenname kombinieren (ähnlich wie clsx)
export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

// Local Storage Hilfsfunktionen
export const storage = {
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.warn('localStorage setItem failed:', error);
    }
  },
  
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn('localStorage getItem failed:', error);
      return defaultValue;
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('localStorage removeItem failed:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('localStorage clear failed:', error);
    }
  }
};