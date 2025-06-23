// Empty State Komponente

import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingCart, Plus, Search } from 'lucide-react';

interface EmptyStateProps {
  message?: string;
  action?: string;
  onActionClick?: () => void;
  type?: 'empty-list' | 'no-results' | 'error';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'Keine Artikel vorhanden',
  action,
  onActionClick,
  type = 'empty-list'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'no-results':
        return <Search size={48} className="text-gray-400" />;
      case 'error':
        return <div className="text-4xl">⚠️</div>;
      default:
        return <ShoppingCart size={48} className="text-gray-400" />;
    }
  };

  const getSubMessage = () => {
    switch (type) {
      case 'no-results':
        return 'Versuchen Sie einen anderen Suchbegriff oder passen Sie die Filter an.';
      case 'error':
        return 'Etwas ist schiefgelaufen. Bitte versuchen Sie es erneut.';
      default:
        return 'Fügen Sie Ihren ersten Artikel hinzu, um mit dem Einkaufen zu beginnen.';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-12 px-6"
    >
      <div className="max-w-sm mx-auto">
        {/* Icon */}
        <div className="mb-4 flex justify-center">
          {getIcon()}
        </div>

        {/* Main Message */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {message}
        </h3>

        {/* Sub Message */}
        <p className="text-gray-500 mb-6">
          {getSubMessage()}
        </p>

        {/* Action Button */}
        {action && onActionClick && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onActionClick}
            className="inline-flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} className="mr-2" />
            {action}
          </motion.button>
        )}

        {/* Illustration */}
        {type === 'empty-list' && (
          <div className="mt-8 opacity-50">
            <img
              src="/images/empty-state.jpg"
              alt="Leere Einkaufsliste"
              className="mx-auto max-w-48 rounded-lg"
              onError={(e) => {
                // Hide image if it fails to load
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
