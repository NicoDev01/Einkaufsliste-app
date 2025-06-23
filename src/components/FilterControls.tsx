// Filter-Steuerungen für die Einkaufsliste

import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { FilterOptions } from '../types';
import { STORES, CATEGORIES, USERS } from '../utils/constants';

interface FilterControlsProps {
  onClose: () => void;
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onClose, filters, onFilterChange }) => {
  

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    const newFilters = { ...filters };

    if (key === 'completed') {
      // Allow toggling boolean filter
      newFilters[key] = newFilters[key] === value ? undefined : value;
    } else {
      newFilters[key] = value === 'all' ? undefined : value;
    }

    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    onFilterChange({
      searchTerm: undefined,
      assignedTo: undefined,
      store: undefined,
      category: undefined,
      completed: undefined,
    });
  };

  const hasActiveFilters = 
    !!filters.searchTerm ||
    !!filters.assignedTo || 
    !!filters.store || 
    !!filters.category ||
    filters.completed !== undefined;


  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.assignedTo) count++;
    if (filters.store) count++;
    if (filters.category) count++;
    if (filters.completed !== undefined) count++;

    return count;
  };

  return (
    <div className="w-80 bg-white rounded-3xl shadow-elevated border border-gray-100 p-6">
      <div className="space-y-6">
        {/* Header */}
        {/* Search Input */}
        <div className="relative">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Artikel suchen..."
            value={filters.searchTerm || ''}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
          />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Filter</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>

        {/* Person Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            👤 Person
          </label>
          <select
            value={filters.assignedTo || 'all'}
            onChange={(e) => handleFilterChange('assignedTo', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
          >
            <option value="all">Alle Personen</option>
            {USERS.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        {/* Store Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            🏪 Geschäft
          </label>
          <select
            value={filters.store || 'all'}
            onChange={(e) => handleFilterChange('store', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
          >
            <option value="all">Alle Geschäfte</option>
            {STORES.map(store => (
              <option key={store.name} value={store.name}>
                {store.icon} {store.name}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">
            🏷️ Kategorie
          </label>
          <select
            value={filters.category || 'all'}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50 transition-all duration-200"
          >
            <option value="all">Alle Kategorien</option>
            {CATEGORIES.map(category => (
              <option key={category.name} value={category.name}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filters */}
        <div>
          <label className="text-sm font-medium text-gray-700 mb-3 block">
            📋 Status
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFilterChange('completed', false)}
              className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200 ${
                filters.completed === false
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              📋 Offen
            </button>
          </div>
        </div>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={clearAllFilters}
            className="w-full px-4 py-3 bg-red-50 text-red-700 rounded-2xl text-sm font-medium hover:bg-red-100 transition-all duration-200 border border-red-200"
          >
            Alle Filter zurücksetzen
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default FilterControls;
