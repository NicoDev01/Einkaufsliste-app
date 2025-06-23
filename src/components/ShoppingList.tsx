// Haupt-Komponente für die Einkaufsliste (vereinfacht)

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import type { ShoppingItem as ShoppingItemType, CategoryType, FilterOptions } from '../types';
import { useShoppingList } from '../hooks/useShoppingList';
import { useAppStorage } from '../hooks/useLocalStorage';
import { filterItems, sortItems, groupItemsByCategory, getCategoryIcon } from '../utils/helpers';

import ShoppingItemComponent from './ShoppingItem';
import AddItemForm from './AddItemForm';

import PriceCalculator from './PriceCalculator';
import EmptyState from './EmptyState';
import LoadingSpinner from './LoadingSpinner';

// listId prop ist nicht mehr nötig
interface ShoppingListProps {
  filters: FilterOptions;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ filters }) => {
  const { items, isLoading, error, updateItem, deleteItem, toggleCompleted, removePurchasedItems, updateSortOrder } = useShoppingList();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

    const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      // Find indices based on the VISIBLE list. This is safe because D&D is disabled when filters are active.
      const oldIndex = processedItems.findIndex((item) => item.id === String(active.id));
      const newIndex = processedItems.findIndex((item) => item.id === String(over.id));

      if (oldIndex !== -1 && newIndex !== -1) {
        // Create the new list of items in the desired order
        const reorderedItems = arrayMove(processedItems, oldIndex, newIndex);
        
        // Extract just the IDs in the new order
        const itemIds = reorderedItems.map((item) => item.id);
        
        // Call the mutation. React Query will handle the optimistic update.
        updateSortOrder(itemIds);
      }
    }
  };

  
  const [appSettings] = useAppStorage.useAppSettings();
  
  // Lokaler State
  
  
  

  // Gefilterte und sortierte Items
    const processedItems = useMemo(() => {
    const filtered = filterItems(items, filters);
    // Wenn die Sortierung manuell ist, verwenden wir die Reihenfolge aus dem Hook (sort_order).
    // Ansonsten wenden wir die ausgewählte Sortierung an.
    if (appSettings.sortOrder === 'manual') {
      return filtered;
    }
    return sortItems(filtered, appSettings.sortOrder as any);
  }, [items, filters, appSettings.sortOrder]);

  const isDragAndDropEnabled = useMemo(() => {
    // D&D ist nur aktiv, wenn manuelle Sortierung gewählt ist und keine Filter aktiv sind.
    // Ein einfacher Proxy für "keine Filter": die gefilterte Liste ist so lang wie die Gesamtliste.
    const noFiltersActive = items.length === processedItems.length;
    return appSettings.sortOrder === 'manual' && noFiltersActive;
  }, [items, processedItems, appSettings.sortOrder]);

  // Gruppierte Items (falls aktiviert)
  const groupedItems = useMemo(() => {
    if (!appSettings.groupByCategory) return null;
    return groupItemsByCategory(processedItems);
  }, [processedItems, appSettings.groupByCategory]);

  // Statistiken
  const stats = useMemo(() => {
    const total = items.length;
    const completed = items.filter(item => item.completed).length;
    const remaining = total - completed;
    return { total, completed, remaining };
  }, [items]);

  // Event Handlers
    const handleToggleCompleted = async (itemId: string) => {
    await toggleCompleted(itemId);
  };

  const handleDeleteItem = async (itemId: string) => {
    await deleteItem(itemId);
  };

  const handleUpdateItem = async (itemId: string, updates: Partial<ShoppingItemType>) => {
    await updateItem(itemId, updates);
  };

  const handleClearCompleted = async () => {
    if (stats.completed === 0) return;
    if (window.confirm(`${stats.completed} gekaufte Artikel entfernen?`)) {
      await removePurchasedItems();
    }
  };

  // Ladezustand
  if (isLoading && items.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  // Fehlerzustand
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-600 font-medium">Fehler beim Laden der Einkaufsliste</p>
        <p className="text-red-500 text-sm mt-1">{error.message}</p>
      </div>
    );
  }

  // Rendern der gruppierten Items
  const renderGroupedItems = () => {
    if (!groupedItems) return null;
    return Object.entries(groupedItems).map(([category, categoryItems]) => {
      if (categoryItems.length === 0) return null;
      return (
        <motion.div key={category} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="mr-2">{getCategoryIcon(category as CategoryType)}</span>
            {category}
            <span className="ml-2 bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
              {categoryItems.length}
            </span>
          </h3>
          <div className="space-y-2">
            {categoryItems.map(item => (
              <ShoppingItemComponent
                key={item.id}
                item={item}
                onToggleCompleted={handleToggleCompleted}
                onDelete={handleDeleteItem}
                onUpdate={handleUpdateItem}
                isDraggable={false}
              />
            ))}
          </div>
        </motion.div>
      );
    });
  };

  // Rendern der normalen (nicht gruppierten) Items
  const renderRegularItems = () => (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={processedItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {processedItems.map((item) => (
              <ShoppingItemComponent
                key={item.id}
                item={item}
                onToggleCompleted={handleToggleCompleted}
                onDelete={handleDeleteItem}
                onUpdate={handleUpdateItem}
                isDraggable={isDragAndDropEnabled}
              />
            ))}
        </div>
      </SortableContext>
    </DndContext>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      {/* AddItemForm benötigt keine listId mehr */}
      <AddItemForm />

      

      <AnimatePresence>
        {appSettings.showPriceEstimates && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
            <PriceCalculator />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        {processedItems.length === 0 ? (
          <EmptyState 
            message={filters.searchTerm ? 'Keine Artikel gefunden' : 'Einkaufsliste ist leer'}
            action={filters.searchTerm ? 'Suchbegriff ändern' : 'Ersten Artikel hinzufügen'}
          />
        ) : (
          <>
            {appSettings.groupByCategory ? renderGroupedItems() : renderRegularItems()}
          </>
        )}
      </div>

      {isLoading && items.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Wird synchronisiert...</p>
          </div>
        </div>
      )}
    </div>
  );
};



export default ShoppingList;
