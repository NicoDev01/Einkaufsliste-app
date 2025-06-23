// src/hooks/useAIFeatures.ts
// This file provides dummy implementations for AI-related hooks to prevent the app from crashing.
// All AI functionality is disabled.

export const useAIFeatures = () => ({
  isLoading: false,
  error: null,
  categorizeItem: async () => {
    console.warn("AI feature 'categorizeItem' is disabled.");
    return null;
  },
  getSuggestions: async () => {
    console.warn("AI feature 'getSuggestions' is disabled.");
    return [];
  },
  getPriceEstimate: async () => {
    console.warn("AI feature 'getPriceEstimate' is disabled.");
    return null;
  },
});

export const useItemSuggestions = () => ({
  suggestions: [],
  isLoading: false,
  refresh: () => console.warn("AI feature 'useItemSuggestions' is disabled."),
});

export const useAutoCategorization = () => ({
  category: null,
  isLoading: false,
  refresh: () => console.warn("AI feature 'useAutoCategorization' is disabled."),
});

export default useAIFeatures;

