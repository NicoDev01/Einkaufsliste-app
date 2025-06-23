// Einzelner Einkaufsartikel Komponente

import React, { useState } from 'react';
import { motion } from 'framer-motion';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Check,
  X,
  Edit3,
  Star,
  GripVertical,
  MapPin,
  User,
  MessageCircle,
  Plus,
  Minus,
} from 'lucide-react';

import type { ShoppingItem as ShoppingItemType } from '../types';
import { getStoreLogo, getUserAvatar } from '../utils/helpers';
import { USERS } from '../utils/constants';

interface ShoppingItemProps {
  item: ShoppingItemType;
  onToggleCompleted: (id: string, currentState: boolean) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ShoppingItemType>) => void;
  isDraggable?: boolean;
}

const getCategoryIcon = (category: string | null): string => {
  switch (category) {
    case 'Obst & Gemüse':
      return '🥕';
    case 'Brot & Backwaren':
      return '🍞';
    case 'Milchprodukte & Eier':
      return '🥛';
    case 'Fleisch & Wurst':
      return '🥩';
    case 'Geflügel & Fisch':
      return '🐟';
    case 'Kühlregal & Feinkost':
      return '🥗';
    case 'Tiefkühlkost':
      return '❄️';
    case 'Nudeln, Reis & Getreide':
      return '🍝';
    case 'Konserven & Fertiggerichte':
      return '🥫';
    case 'Saucen, Öle & Gewürze':
      return '🌶️';
    case 'Süßwaren & Snacks':
      return '🍫';
    case 'Kaffee, Tee & Kakao':
      return '☕';
    case 'Getränke':
      return '🥤';
    case 'Haushalt & Reinigung':
      return '🧽';
    case 'Körperpflege & Drogerie':
      return '🧴';
    case 'Tierbedarf':
      return '🐾';
    default:
      return '🛒';
  }
};

const ShoppingItem: React.FC<ShoppingItemProps> = ({
  item,
  onToggleCompleted,
  onDelete,
  onUpdate,
  isDraggable = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValues, setEditValues] = useState({
    name: item.name,
    quantity: item.quantity || '',
    notes: item.notes || ''
  });

  // Handlers for the new quantity stepper
  const handleQuantityChange = (newValue: string) => {
    setEditValues(prev => ({ ...prev, quantity: newValue }));
  };

  const handleIncrement = () => {
    const currentVal = parseInt(editValues.quantity, 10);
    if (!isNaN(currentVal)) {
      handleQuantityChange(String(currentVal + 1));
    } else if (editValues.quantity.trim() === '') {
      handleQuantityChange('1');
    }
  };

  const handleDecrement = () => {
    const currentVal = parseInt(editValues.quantity, 10);
    if (!isNaN(currentVal) && currentVal > 1) {
      handleQuantityChange(String(currentVal - 1));
    } else if (currentVal === 1) {
      handleQuantityChange(''); // Clear if decrementing from 1
    }
  };

  // Drag & Drop Setup
  // Swipe to delete state
  const [swipeX, setSwipeX] = useState(0);
  const [dragStartX, setDragStartX] = useState(0);
  const swipeThreshold = -100; // 100px nach links wischen

  // Drag & Drop Setup
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ 
    id: item.id,
    disabled: !isDraggable
  });

  const dndTransform = CSS.Transform.toString(transform);
  const style = {
    transform: dndTransform ? `${dndTransform} translateX(${swipeX}px)` : `translateX(${swipeX}px)`,
    transition,
    opacity: isDragging ? 0.8 : 1,
    zIndex: isDragging ? 10 : 'auto',
  };

  // Handle edit save
  const handleSaveEdit = () => {
    onUpdate(item.id, editValues);
    setIsEditing(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (isDragging) return;
    setDragStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (isDragging || dragStartX === 0) return;
    const touchX = e.touches[0].clientX;
    const deltaX = touchX - dragStartX;
    // Nur nach links wischen erlauben
    if (deltaX < 0) {
      setSwipeX(deltaX);
    }
  };

  const handleTouchEnd = () => {
    if (isDragging) {
      setSwipeX(0);
      setDragStartX(0);
      return;
    }

    if (swipeX < swipeThreshold) {
      onDelete(item.id);
    } else {
      // Reset swipe position
      setSwipeX(0);
      setDragStartX(0);
    }
  };

  // Handle edit cancel
  const handleCancelEdit = () => {
    setEditValues({
      name: item.name,
      quantity: item.quantity || '',
      notes: item.notes || ''
    });
    setIsEditing(false);
  };

  

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -300, transition: { duration: 0.3 } }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className={`
        bg-white rounded-2xl shadow-soft border border-gray-100 transition-all duration-200
        ${item.completed ? 'opacity-60 bg-gray-50' : ''}
        ${isDragging ? 'shadow-elevated scale-105' : 'hover:shadow-gentle'}
      `}
    >
      <div className="p-4">
        {isEditing ? (
          // Edit Mode - Compact
          <div className="space-y-3">
            <input
              type="text"
              value={editValues.name}
              onChange={(e) => setEditValues({ ...editValues, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Artikelname"
            />
            <div className="flex items-start space-x-2">
              {/* Quantity Input with Stepper - narrower and non-shrinking */}
              <div className="relative flex-none w-24">
                <input
                  type="text" // Use text to allow units like 'kg' or 'Stück'
                  value={editValues.quantity}
                  onChange={(e) => handleQuantityChange(e.target.value)}
                  className="w-full pl-3 pr-8 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                  placeholder="Menge"
                />
                <div className="absolute inset-y-0 right-0 flex flex-col items-center justify-center pr-1">
                  <button type="button" onClick={handleIncrement} className="h-1/2 px-1 text-gray-500 hover:text-gray-800">
                    <Plus size={12} />
                  </button>
                  <button type="button" onClick={handleDecrement} className="h-1/2 px-1 text-gray-500 hover:text-gray-800">
                    <Minus size={12} />
                  </button>
                </div>
              </div>

              {/* Notes Input - allow it to shrink properly */}
              <input
                type="text"
                value={editValues.notes}
                onChange={(e) => setEditValues({ ...editValues, notes: e.target.value })}
                className="flex-1 min-w-0 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notizen"
              />
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
              >
                Speichern
              </button>
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                Abbrechen
              </button>
            </div>
          </div>
        ) : (
          // Display Mode - Compact
          <div className="flex items-start space-x-2 sm:space-x-3">
            {/* Drag Handle */}
            {isDraggable && (
              <div {...attributes} {...listeners} className="cursor-grab touch-none p-2 text-gray-400 hover:text-gray-600">
                <GripVertical size={18} />
              </div>
            )}

            {/* Checkbox */}
            <button
              onClick={() => onToggleCompleted(item.id, item.completed)} 
              className={`
                w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200
                ${item.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 hover:border-green-400'
                }
              `}
            >
              {item.completed && <Check size={14} />}
            </button>

            {/* Content */}
            <div className="flex-1 min-w-0">
              {/* Item Name */}
              <div className="flex items-center justify-between">
                <h3 className={`font-medium truncate ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.name}
                </h3>
                
                {/* Action Buttons */}
                <div className="flex flex-shrink-0 items-center space-x-1 ml-2">
                  
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1 text-gray-400 hover:text-blue-500 rounded-full transition-colors"
                    title="Bearbeiten"
                  >
                    <Edit3 size={14} />
                  </button>
                  
                  <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                    title="Löschen"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Visual Meta Info - Conditional Rendering */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2 mt-2 text-xs text-gray-600">
                {/* Category Icon */}
                {item.category && item.category !== 'Sonstiges' && (
                  <span title={item.category} className="text-lg">{getCategoryIcon(item.category)}</span>
                )}

                {/* Store Logo */}
                {item.store && getStoreLogo(item.store) && (
                  <img src={getStoreLogo(item.store)!} alt={item.store} title={item.store} className="h-5 w-auto rounded-sm" />
                )}

                {/* Assigned User Avatar */}
                {item.assignedTo && getUserAvatar(item.assignedTo) && (
                  (() => {
                    const avatar = getUserAvatar(item.assignedTo);
                    return avatar ? (
                      <img
                        src={avatar.src}
                        alt={avatar.alt}
                        title={avatar.alt}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                    ) : null;
                  })()
                )}

                {/* Quantity */}
                {item.quantity && (
                  <span className="px-2 py-1 bg-gray-100 rounded-md font-medium">{item.quantity}</span>
                )}

                {/* Notes */}
                {item.notes && (
                  <span title={item.notes} className="text-gray-400 hover:text-gray-600">
                    <MessageCircle size={14} />
                  </span>
                )}
              </div>

              {/* Notes (if any) */}
              {item.notes && (
                <p className="text-sm text-gray-600 mt-1 italic">"{item.notes}"</p>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ShoppingItem;
