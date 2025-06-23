// Custom Hook für Einkaufslisten-Management mit React Query für robuste Daten-Synchronisierung
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import type { ShoppingItem, AddItemFormData, UseShoppingListReturn } from '../types';
import supabase from "../services/supabase";

const PUBLIC_LIST_ID = '00000000-0000-0000-0000-000000000001';
const shoppingListQueryKey = ['shopping_list', PUBLIC_LIST_ID];

// --- API Funktionen ---
const fetchShoppingList = async (): Promise<ShoppingItem[]> => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .select('*')
    .eq('list_id', PUBLIC_LIST_ID)
    .order('sort_order', { ascending: true, nullsFirst: false });
  if (error) {
    console.error("Supabase fetch error:", error);
    throw new Error(error.message);
  }
  // Map snake_case 'assigned_to' from DB to camelCase 'assignedTo' for the app
  return (data || []).map(item => ({ ...item, assignedTo: item.assigned_to }));
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8787';

// Holt die KI-basierte Kategorie für einen Artikel
const getAICategory = async (itemName: string): Promise<string> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/ai/categorize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item: itemName }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }
    const data = await response.json();
    return data.category || 'Sonstiges';
  } catch (error) {
    console.error('Fehler beim Aufruf der KI-Kategorisierungs-API:', error);
    return 'Sonstiges'; // Fallback-Kategorie
  }
};

// Speichert einen neuen Artikel als Favorit
const addFavorite = async (name: string, category: string) => {
  try {
    await fetch(`${API_BASE_URL}/api/favorites`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category }),
    });
  } catch (error) {
    console.error('Fehler beim Speichern des Favoriten:', error);
    // Kein Fehler werfen, da dies eine Hintergrundaufgabe ist
  }
};

// Ruft die Favoriten vom Backend ab
export const getFavorites = async (): Promise<{ name: string; category: string }[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/favorites`);
    if (!response.ok) {
      throw new Error('Fehler beim Abrufen der Favoriten');
    }
    return response.json();
  } catch (error) {
    console.error('Fehler beim Abrufen der Favoriten:', error);
    return []; // Leeres Array als Fallback
  }
};

// Löscht einen Favoriten
const deleteFavoriteApi = async (favoriteName: string) => {
  const response = await fetch(`${API_BASE_URL}/api/favorites/${encodeURIComponent(favoriteName)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Failed to parse error response' }));
    throw new Error(errorData.error || `API Error: ${response.status}`);
  }
};

const addShoppingItem = async (itemData: AddItemFormData) => {
  const itemName = itemData.name.trim();
  
  const categoryPromise = getAICategory(itemName);
  toast.promise(categoryPromise, {
     loading: `"${itemName}" wird kategorisiert...`,
     success: (category) => `"${itemName}" als "${category}" hinzugefügt!`,
     error: 'Kategorisierung fehlgeschlagen',
  });

  const category = await categoryPromise;

  const { data, error } = await supabase
    .from('shopping_list_items')
    .insert({
      list_id: PUBLIC_LIST_ID,
      name: itemName,
      quantity: itemData.quantity?.trim() || null,
      notes: itemData.notes?.trim() || null,
      assigned_to: itemData.assignedTo || null,
      store: itemData.store || 'Andere',
      category: category,
    })
    .select()
    .single();
    
  if (error) {
    throw error;
  }

  addFavorite(itemName, category);

  return data;
};

const addShoppingItemFromFavorite = async ({ name, category }: { name: string; category: string }) => {
  const itemName = name.trim();

  const { data, error } = await supabase
    .from('shopping_list_items')
    .insert({
      list_id: PUBLIC_LIST_ID,
      name: itemName,
      category: category,
      store: 'Andere',
    })
    .select()
    .single();

  if (error) {
    toast.error(`Fehler: ${error.message}`);
    throw error;
  }

  toast.success(`Favorit "${itemName}" hinzugefügt!`);
  return data;
};

const updateShoppingItem = async ({ id, updates }: { id: string, updates: Partial<ShoppingItem> }) => {
  const { data, error } = await supabase
    .from('shopping_list_items')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

const deleteShoppingItem = async (id: string) => {
  const { error } = await supabase
    .from('shopping_list_items')
    .delete()
    .eq('id', id);
  if (error) throw error;
};

const deletePurchasedItems = async (ids: string[]) => {
    const { error } = await supabase
        .from('shopping_list_items')
        .delete()
        .in('id', ids);
    if (error) throw error;
};

const updateSortOrderInDb = async (itemIds: string[]) => {
  const updatePromises = itemIds.map((id, index) =>
    supabase
      .from('shopping_list_items')
      .update({ sort_order: index })
      .eq('id', id)
  );

  const results = await Promise.all(updatePromises);
  const firstError = results.find(result => result.error);

  if (firstError) {
    console.error('Supabase sort order update error:', firstError.error);
    throw firstError.error;
  }
};

// --- Custom Hook ---
export const useShoppingList = (): UseShoppingListReturn => {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading, error } = useQuery<ShoppingItem[], Error>({
    queryKey: shoppingListQueryKey,
    queryFn: fetchShoppingList,
  });

  useEffect(() => {
    if (error) {
      toast.error(`Fehler beim Laden der Liste: ${error.message}`);
    }
  }, [error]);

  useEffect(() => {
    const channel = supabase
      .channel('shopping_list_items_public_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'shopping_list_items', filter: `list_id=eq.${PUBLIC_LIST_ID}` },
        () => {
          queryClient.invalidateQueries({ queryKey: shoppingListQueryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  const addItemMutation = useMutation({
    mutationFn: addShoppingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListQueryKey });
    }
  });

  const addItemFromFavoriteMutation = useMutation({
    mutationFn: addShoppingItemFromFavorite,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListQueryKey });
    },
  });

  const deleteFavoriteMutation = useMutation({
    mutationFn: deleteFavoriteApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
      toast.success('Favorit gelöscht!');
    },
    onError: (err: Error) => {
      toast.error(`Löschen fehlgeschlagen: ${err.message}`);
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: updateShoppingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListQueryKey });
    },
    onError: (err: Error) => {
      toast.error(`Update-Fehler: ${err.message}`);
    },
  });

  const deleteItemMutation = useMutation({ 
    mutationFn: deleteShoppingItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListQueryKey });
    }
  });

  const removePurchasedMutation = useMutation({ 
    mutationFn: deletePurchasedItems,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListQueryKey });
    }
  });

  const updateSortOrderMutation = useMutation({
    mutationFn: updateSortOrderInDb,
    onMutate: async (newItemIds: string[]) => {
      await queryClient.cancelQueries({ queryKey: shoppingListQueryKey });
      const previousItems = queryClient.getQueryData<ShoppingItem[]>(shoppingListQueryKey);
      if (previousItems) {
        const newItemMap = new Map(newItemIds.map((id, index) => [id, index]));
        const reordered = [...previousItems].sort((a, b) => (newItemMap.get(a.id) ?? Infinity) - (newItemMap.get(b.id) ?? Infinity));
        queryClient.setQueryData(shoppingListQueryKey, reordered);
      }
      return { previousItems };
    },
    onError: (err, newItemIds, context) => {
      if (context?.previousItems) {
        queryClient.setQueryData(shoppingListQueryKey, context.previousItems);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: shoppingListQueryKey });
    }
  });

  const toggleCompletedMutation = useMutation({
    mutationFn: async (id: string) => {
      const item = items?.find(i => i.id === id);
      if (!item) return;
      await updateItemMutation.mutateAsync({id, updates: { completed: !item.completed }});
    },
    onError: (err: Error) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  // Async Wrapper-Funktionen
  const addItem = async (itemData: AddItemFormData): Promise<void> => {
    await addItemMutation.mutateAsync(itemData);
  };

  const addItemFromFavorite = async (item: { name: string; category: string }): Promise<void> => {
    await addItemFromFavoriteMutation.mutateAsync(item);
  };

  const deleteFavorite = async (favoriteName: string): Promise<void> => {
    await deleteFavoriteMutation.mutateAsync(favoriteName);
  };

  const updateItem = async (id: string, updates: Partial<ShoppingItem>): Promise<void> => {
    await updateItemMutation.mutateAsync({ id, updates });
  };

  const deleteItem = async (id: string): Promise<void> => {
    await toast.promise(deleteItemMutation.mutateAsync(id), {
        loading: 'Lösche...',
        success: 'Artikel gelöscht.',
        error: (err: Error) => `Fehler: ${err.message}`,
    });
  };

  const toggleCompleted = async (id: string): Promise<void> => {
    await toggleCompletedMutation.mutateAsync(id);
  };

  const removePurchasedItems = async (): Promise<void> => {
      const purchasedIds = items.filter(item => item.completed).map(item => item.id);
      if (purchasedIds.length > 0) {
          await toast.promise(removePurchasedMutation.mutateAsync(purchasedIds), {
              loading: 'Entferne gekaufte Artikel...',
              success: `${purchasedIds.length} Artikel entfernt.`,
              error: (err: Error) => `Fehler: ${err.message}`,
          });
      }
  };

  return {
    items,
    isLoading,
    error,
    addItem,
    addItemFromFavorite,
    deleteFavorite,
    updateItem,
    deleteItem,
    toggleCompleted,
    removePurchasedItems,
    updateSortOrder: updateSortOrderMutation.mutate,
  };
};
