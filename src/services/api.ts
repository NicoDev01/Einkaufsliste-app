// API Service für Cloudflare Worker Integration

import type { 
  CategoryType, 
  ShoppingItem, 
  PriceEstimation, 
  CategorizationResponse,
  SuggestionsResponse 
} from '../types';
import { API_ENDPOINTS } from '../utils/constants';

// Base API Configuration
const BASE_URL = import.meta.env.VITE_CLOUDFLARE_WORKER_URL || 'https://shopping-list-worker.your-domain.workers.dev';

// API Client Class
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, { ...defaultOptions, ...options });
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // KI-basierte Kategorisierung
  async categorizeItem(itemName: string): Promise<CategoryType> {
    try {
      const response = await this.request<CategorizationResponse>(
        API_ENDPOINTS.AI_CATEGORIZE,
        {
          method: 'POST',
          body: JSON.stringify({ itemName }),
        }
      );
      
      return response.category;
    } catch (error) {
      console.warn('AI categorization failed, using fallback:', error);
      return this.fallbackCategorization(itemName);
    }
  }

  // KI-basierte Vorschläge
  async getItemSuggestions(
    searchTerm: string, 
    currentList: ShoppingItem[] = []
  ): Promise<string[]> {
    try {
      const response = await this.request<SuggestionsResponse>(
        API_ENDPOINTS.AI_SUGGESTIONS,
        {
          method: 'POST',
          body: JSON.stringify({ searchTerm, currentList }),
        }
      );
      
      return response.suggestions;
    } catch (error) {
      console.warn('AI suggestions failed, using fallback:', error);
      return this.fallbackSuggestions(searchTerm, currentList);
    }
  }

  // Preis-Schätzung
  async estimatePrice(shoppingList: ShoppingItem[]): Promise<PriceEstimation> {
    try {
      const response = await this.request<PriceEstimation>(
        API_ENDPOINTS.AI_PRICE_ESTIMATE,
        {
          method: 'POST',
          body: JSON.stringify({ shoppingList }),
        }
      );
      
      return response;
    } catch (error) {
      console.warn('Price estimation failed, using fallback:', error);
      return this.fallbackPriceEstimation(shoppingList);
    }
  }

  // Push-Benachrichtigungen senden
  async sendPushNotification(
    subscription: any, 
    payload: any
  ): Promise<boolean> {
    try {
      await this.request(
        API_ENDPOINTS.NOTIFICATIONS_SEND,
        {
          method: 'POST',
          body: JSON.stringify({ subscription, payload }),
        }
      );
      
      return true;
    } catch (error) {
      console.error('Push notification failed:', error);
      return false;
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.request(API_ENDPOINTS.HEALTH);
      return true;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Fallback-Funktionen für Offline-Betrieb

  private fallbackCategorization(itemName: string): CategoryType {
    const lowerName = itemName.toLowerCase();
    
    // Einfache Kategorisierung basierend auf Schlüsselwörtern
    const categories: { [key: string]: CategoryType } = {
      'apfel|banane|orange|tomate|gurke|salat|karotte|zwiebel|kartoffel|paprika|obst|gemüse': 'Obst & Gemüse',
      'milch|käse|joghurt|butter|quark|sahne|frischkäse': 'Milchprodukte',
      'fleisch|wurst|huhn|rind|schwein|fisch|lachs|thunfisch': 'Fleisch & Fisch',
      'brot|brötchen|toast|croissant|kuchen': 'Brot & Backwaren',
      'tiefkühl|eis|frozen|pizza': 'Tiefkühlprodukte',
      'dose|konserve|tomaten|bohnen|mais': 'Konserven',
      'wasser|saft|cola|bier|wein|kaffee|tee': 'Getränke',
      'schokolade|gummibär|chips|keks|süß': 'Süßwaren & Snacks',
      'shampoo|seife|zahnpasta|deo|creme|kosmetik': 'Hygiene & Kosmetik',
      'putzmittel|waschmittel|toilettenpapier|küchentuch|reiniger': 'Haushalt & Reinigung'
    };

    for (const [keywords, category] of Object.entries(categories)) {
      const regex = new RegExp(keywords, 'i');
      if (regex.test(lowerName)) {
        return category;
      }
    }

    return 'Sonstiges';
  }

  private fallbackSuggestions(
    searchTerm: string, 
    currentList: ShoppingItem[]
  ): string[] {
    const commonItems: { [key: string]: string[] } = {
      'mil': ['Milch 3,5%', 'Milch 1,5%', 'Hafermilch', 'Mandelmilch'],
      'bro': ['Brot', 'Vollkornbrot', 'Brötchen', 'Toast'],
      'app': ['Äpfel', 'Apfelsaft', 'Apfelmus'],
      'tom': ['Tomaten', 'Cocktailtomaten', 'Tomatenmark', 'Tomatensauce'],
      'käs': ['Käse', 'Gouda', 'Frischkäse', 'Mozzarella'],
      'ban': ['Bananen', 'Bananenmilch'],
      'kar': ['Karotten', 'Karottensaft'],
      'häh': ['Hähnchenbrust', 'Hähnchenschenkel'],
      'rin': ['Rindfleisch', 'Rinderhack'],
      'zah': ['Zahnpasta', 'Zahnbürste'],
      'sham': ['Shampoo', 'Conditioner'],
      'bier': ['Bier', 'Alkoholfreies Bier'],
      'wass': ['Wasser', 'Mineralwasser', 'Sprudelwasser']
    };

    const term = searchTerm.toLowerCase().slice(0, 3);
    const suggestions = commonItems[term] || [];
    
    // Bereits vorhandene Artikel ausfiltern
    const currentItemNames = currentList.map(item => item.name.toLowerCase());
    return suggestions.filter(suggestion => 
      !currentItemNames.includes(suggestion.toLowerCase()) &&
      suggestion.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 5);
  }

  private fallbackPriceEstimation(shoppingList: ShoppingItem[]): PriceEstimation {
    // Einfache Preis-Schätzung basierend auf Kategorien
    const categoryPrices: { [key in CategoryType]: number } = {
      'Obst & Gemüse': 2.50,
      'Milchprodukte': 1.80,
      'Fleisch & Fisch': 8.50,
      'Brot & Backwaren': 2.20,
      'Tiefkühlprodukte': 3.50,
      'Konserven': 1.50,
      'Getränke': 1.20,
      'Süßwaren & Snacks': 2.80,
      'Hygiene & Kosmetik': 4.50,
      'Haushalt & Reinigung': 3.20,
      'Sonstiges': 2.00
    };

    const breakdown = shoppingList.map(item => {
      const basePrice = categoryPrices[item.category] || 2.00;
      // Kleine Variation für Realismus
      const variation = (Math.random() - 0.5) * 2; // -1 bis +1
      const estimatedPrice = Math.max(0.50, basePrice + variation);
      
      return {
        item: item.name,
        estimatedPrice: Math.round(estimatedPrice * 100) / 100
      };
    });

    const totalEstimate = breakdown.reduce((sum, item) => sum + item.estimatedPrice, 0);

    return {
      totalEstimate: Math.round(totalEstimate * 100) / 100,
      breakdown,
      disclaimer: 'Schätzung basierend auf durchschnittlichen Marktpreisen (Offline-Modus)'
    };
  }
}

// API Instance
const apiClient = new ApiClient(BASE_URL);

// Exported API functions
export const apiService = {
  categorizeItem: (itemName: string) => apiClient.categorizeItem(itemName),
  getItemSuggestions: (searchTerm: string, currentList?: ShoppingItem[]) => 
    apiClient.getItemSuggestions(searchTerm, currentList),
  estimatePrice: (shoppingList: ShoppingItem[]) => apiClient.estimatePrice(shoppingList),
  sendPushNotification: (subscription: any, payload: any) => 
    apiClient.sendPushNotification(subscription, payload),
  healthCheck: () => apiClient.healthCheck()
};

export default apiService;
