// Formular zum Hinzufügen von Artikeln (vereinfacht)

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import type { AddItemFormData, StoreType, CategoryType } from '../types';
import { useShoppingList } from '../hooks/useShoppingList';
import { STORES, CATEGORIES, USERS } from '../utils/constants';
import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../hooks/useShoppingList';

const AddItemForm: React.FC = () => {
  const { addItem, addItemFromFavorite, deleteFavorite, isLoading } = useShoppingList();

  const initialFormState: AddItemFormData = {
    name: '',
    quantity: '',
    notes: '',
    assignedTo: undefined,
    store: undefined,
    category: undefined,
  };

  const [formData, setFormData] = useState<AddItemFormData>(initialFormState);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  // Favoriten nur abrufen, wenn das Eingabefeld fokussiert ist
  const { data: favorites, isLoading: isFavoritesLoading } = useQuery({
    queryKey: ['favorites'],
    queryFn: getFavorites,
    staleTime: 5 * 60 * 1000, // 5 Minuten Cache
    refetchOnWindowFocus: false,
  });

  // Filtert die Favoritenliste basierend auf der aktuellen Eingabe
  const filteredFavorites = useMemo(() => {
    if (!formData.name) {
      return favorites || [];
    }
    return (
      favorites?.filter((fav) =>
        fav.name.toLowerCase().startsWith(formData.name.toLowerCase())
      ) || []
    );
  }, [formData.name, favorites]);

  // Hook, um Klicks ausserhalb des Formulars zu erkennen und das Dropdown zu schliessen
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (formRef.current && !formRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Bitte geben Sie einen Artikelnamen ein.');
      return;
    }
    await addItem(formData);
    setFormData(initialFormState);
    setIsExpanded(false);
    setIsFocused(false); // Dropdown nach dem Hinzufügen schliessen
    nameInputRef.current?.focus();
  };

  const handleQuickAdd = async () => {
    if (!formData.name.trim()) return;
    await addItem({ name: formData.name.trim() });
    setFormData(initialFormState);
    setIsFocused(false); // Dropdown nach dem Hinzufügen schliessen
    nameInputRef.current?.focus();
  };

  const handleSelectFavorite = async (favorite: { name: string; category: string }) => {
    await addItemFromFavorite(favorite);
    setFormData(initialFormState);
    setIsFocused(false); // Dropdown nach Auswahl schliessen
    nameInputRef.current?.focus(); // Fokus zurück auf das Input-Feld für gute UX
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (isExpanded) {
        handleSubmit(e as any);
      } else {
        handleQuickAdd();
      }
    }
  };

  return (
    <div className="relative" ref={formRef}>
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-4 sm:p-6 md:p-8 lg:p-10">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
            <input
              ref={nameInputRef}
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              onFocus={() => setIsFocused(true)} // Dropdown bei Fokus öffnen
              onKeyDown={handleKeyDown}
              placeholder="Neuen Artikel hinzufügen..."
              className="flex-1 w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-500 bg-gray-50"
              disabled={isLoading}
              autoComplete="off" // Verhindert Browser-eigene Vorschläge
            />
            <button
              type="button"
              onClick={handleQuickAdd}
              disabled={!formData.name.trim() || isLoading}
              className="p-2.5 sm:px-5 sm:py-3 bg-blue-500 text-white rounded-xl sm:rounded-2xl hover:bg-blue-600 disabled:opacity-50 flex-shrink-0"
            >
              <Plus size={18} className="sm:w-5 sm:h-5" />
            </button>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2.5 sm:px-4 sm:py-3 rounded-xl sm:rounded-2xl transition-colors ${isExpanded ? 'bg-blue-100' : 'bg-gray-100 hover:bg-gray-200'} flex-shrink-0`}
            >
              <svg className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 pt-4 border-t border-gray-100"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <select
                    value={formData.store || ''}
                    onChange={(e) => setFormData({ ...formData, store: e.target.value as StoreType })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl bg-gray-50"
                  >
                    <option value="">Geschäft</option>
                    {STORES.map(store => <option key={store.name} value={store.name}>{store.name}</option>)}
                  </select>
                  <select
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as CategoryType })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl bg-gray-50"
                  >
                    <option value="">Kategorie</option>
                    {CATEGORIES.map(cat => <option key={cat.name} value={cat.name}>{cat.name}</option>)}
                  </select>
                  <select
                    value={formData.assignedTo || ''}
                    onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl bg-gray-50"
                  >
                    <option value="">Für</option>
                    {USERS.map(user => <option key={user.id} value={user.id}>{user.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.quantity || ''}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    placeholder="Menge (z.B. 2x)"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl bg-gray-50"
                  />
                  <input
                    type="text"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notiz (z.B. fettarm)"
                    className="w-full px-3 py-2 sm:px-4 sm:py-3 text-sm sm:text-base border border-gray-200 rounded-xl sm:rounded-2xl bg-gray-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={!formData.name.trim() || isLoading}
                  className="w-full px-6 py-3 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 disabled:opacity-50 font-medium"
                >
                  {isLoading ? 'Wird hinzugefügt...' : 'Artikel mit Details hinzufügen'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </div>

      {/* Favoriten-Dropdown */}
      {isFocused && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {isFavoritesLoading && <div className="p-3 text-gray-500 text-sm">Vorschläge laden...</div>}
          {!isFavoritesLoading && filteredFavorites.length > 0 && (
            <ul className="divide-y divide-gray-100">
              {filteredFavorites.map((fav) => (
                <li
                  key={fav.name}
                  className="flex justify-between items-center p-3 hover:bg-gray-100 cursor-pointer text-sm"
                  onClick={() => handleSelectFavorite(fav)}
                >
                  <span>{fav.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Verhindert, dass handleSelectFavorite ausgelöst wird
                      deleteFavorite(fav.name);
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 text-gray-500 hover:text-gray-800"
                    aria-label={`Favorit ${fav.name} löschen`}
                  >
                    <Plus size={16} className="rotate-45" />
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!isFavoritesLoading && favorites && filteredFavorites.length === 0 && (
            <div className="p-3 text-gray-500 text-sm">
              {formData.name.length > 0
                ? 'Keine passenden Favoriten gefunden.'
                : 'Du hast noch keine Favoriten.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AddItemForm;
