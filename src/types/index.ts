// Types für die Einkaufslisten-App
export interface UserAvatar {
  src: string;
  alt: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  push_subscription?: any;
  created_at?: string;
}

export interface ShoppingList {
  id: string;
  name: string;
  description?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export type StoreType = 'Edeka' | 'Lidl' | 'Aldi' | 'Penny' | 'Rossmann' | 'DM' | 'Andere';

export type CategoryType = 
  | 'Obst & Gemüse'
  | 'Milchprodukte'
  | 'Fleisch & Fisch'
  | 'Brot & Backwaren'
  | 'Tiefkühlprodukte'
  | 'Konserven'
  | 'Getränke'
  | 'Süßwaren & Snacks'
  | 'Hygiene & Kosmetik'
  | 'Haushalt & Reinigung'
  | 'Sonstiges';

export interface ShoppingItem {
  id: string;
  list_id?: string;
  listId?: string; // Alternative für Demo-Daten
  name: string;
  quantity?: string;
  notes?: string;
  category: CategoryType;
  completed: boolean;
  assigned_to?: string;
  assignedTo?: string; // Alternative für Demo-Daten
  store: StoreType;
  sort_order?: number;
  sortOrder?: number; // Alternative für Demo-Daten
  created_at?: string;
  createdAt?: string; // Alternative für Demo-Daten
  updated_at?: string;
  created_by?: string;
  createdBy?: string; // Alternative für Demo-Daten
}

export interface Store {
  id: string;
  name: StoreType;
  type: string;
  color: string;
  icon: string;
}

export interface Category {
  id: string;
  name: CategoryType;
  icon: string;
  color: string;
  order: number;
}

export interface ItemHistory {
  id: string;
  item_name: string;
  category: CategoryType;
  frequency: number;
  last_purchased: string;
  user_id: string;
}

export interface PriceEstimation {
  totalEstimate: number;
  breakdown: Array<{
    item: string;
    estimatedPrice: number;
  }>;
  disclaimer?: string;
}

export interface AISuggestion {
  suggestion: string;
  category: CategoryType;
  frequency?: number;
}

export interface FilterOptions {
  searchTerm?: string;
  assignedTo?: string;
  store?: StoreType | string;
  category?: CategoryType | string;
  completed: boolean;
  notes?: string;
}

export interface AppState {
  currentUser: User | null;
  selectedList: ShoppingList | null;
  users: User[];
  shoppingLists: ShoppingList[];
  stores: Store[];
  categories: Category[];
  isLoading: boolean;
  error: string | null;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  error?: string;
  message?: string;
}

export interface CategorizationResponse {
  category: CategoryType;
  confidence: number;
}

export interface SuggestionsResponse {
  suggestions: string[];
}

// Event Types für Realtime
export interface RealtimeEvent {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: string;
  record: any;
  old_record?: any;
}

// Form Types
export type AddItemFormData = {
  name: string;
  quantity?: string;
  notes?: string;
  assignedTo?: string;
  store?: StoreType;
  category?: CategoryType;
};

export interface EditItemFormData extends AddItemFormData {
  id: string;
  completed: boolean;
}

// Hook Return Types
export interface UseShoppingListReturn {
  items: ShoppingItem[];
  isLoading: boolean;
  error: Error | null;
  addItem: (itemData: AddItemFormData) => Promise<void>;
  addItemFromFavorite: (item: { name: string; category: string; }) => Promise<void>;
  deleteFavorite: (favoriteName: string) => Promise<void>;
  updateItem: (id: string, updates: Partial<ShoppingItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  toggleCompleted: (id: string) => Promise<void>;
  removePurchasedItems: () => Promise<void>;
  updateSortOrder: (itemIds: string[]) => void;
}

export interface UseAIFeaturesReturn {
  categorizeItem: (itemName: string) => Promise<CategoryType>;
  getSuggestions: (searchTerm: string, currentList: ShoppingItem[]) => Promise<string[]>;
  getPriceEstimate: (items: ShoppingItem[]) => Promise<PriceEstimation>;
  isLoading: boolean;
  error: string | null;
}
