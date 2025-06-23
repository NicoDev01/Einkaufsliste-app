// Haupt-App Komponente für die Einkaufslisten-App (Vereinfachte Version)

import React, { useState, useEffect, Fragment } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster, toast } from 'react-hot-toast';
import { ShoppingCart, Bell, Sparkles, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Transition } from '@headlessui/react';

import ShoppingList from './components/ShoppingList';
import FilterControls from './components/FilterControls';
import LoadingSpinner from './components/LoadingSpinner';
import { useAppStorage } from './hooks/useLocalStorage';
import ErrorBoundary from './components/ErrorBoundary';

// Query Client für React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1 * 60 * 1000, // 1 Minute
      gcTime: 5 * 60 * 1000, // 5 Minuten
    },
  },
});

// Helper-Funktion zum Konvertieren des VAPID-Keys
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [isFilterOpen, setFilterOpen] = useState(false);
  const [theme, setTheme] = useAppStorage.useTheme();
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');
  const [filters, setFilters] = useAppStorage.useFilters();

  // ID der einzigen, öffentlichen Einkaufsliste
  const publicListId = '1b9d6bcd-bbfd-4b2d-9b5d-ab8dfbbd4bed'; // Feste ID aus dem SQL-Schema

  // Funktion zum Speichern des Abonnements auf dem Backend
  const saveSubscription = async (subscription: PushSubscription) => {
    // Die URL muss auf deinen Cloudflare Worker zeigen
    const API_URL = import.meta.env.VITE_API_BASE_URL || '';
    
    const response = await fetch(`${API_URL}/api/save-subscription`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ subscription }),
    });

    if (!response.ok) {
      throw new Error('Failed to save subscription on server.');
    }
    return response.json();
  };

  // Funktion zum Abonnieren von Push-Benachrichtigungen
  const handleSubscription = async () => {
    if (!('serviceWorker' in navigator)) {
      toast.error('Push Notifications are not supported in this browser.');
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const existingSubscription = await registration.pushManager.getSubscription();

      if (existingSubscription) {
        await existingSubscription.unsubscribe();
        // Optional: Backend über das De-Abonnement informieren
        setNotificationsEnabled(false);
        toast.success('Notifications disabled.');
      } else {
        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
        if (!vapidPublicKey) {
          console.error('VAPID public key not found.');
          toast.error('Notification setup is incomplete.');
          return;
        }

        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
        });

        await saveSubscription(subscription);
        setNotificationsEnabled(true);
        toast.success('Notifications enabled!');
      }
    } catch (error) { 
      console.error('Failed to handle subscription:', error);
      toast.error('Failed to enable notifications. Please grant permission.');
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap items-center justify-between h-auto min-h-16 py-2">
              {/* Left side */}
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                  <ShoppingCart size={18} className="text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Einkaufsliste</h1>
                  <p className="text-sm text-gray-500">Gemeinsame Liste</p>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="hidden sm:flex items-center px-4 py-2 bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl border border-purple-100">
                  <Sparkles size={16} className="text-purple-600 mr-2" />
                  <span className="text-sm font-medium text-purple-700">KI-gestützt</span>
                </div>

                <button
                  onClick={handleSubscription}
                  className={`p-2 rounded-lg transition-colors ${
                    notificationsEnabled
                      ? 'text-green-500 bg-green-50 hover:bg-green-100'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  title={notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
                >
                  <Bell size={20} />
                </button>

                {/* Filter Button & Popover */}
                <div className="relative">
                  <button
                    onClick={() => setFilterOpen(!isFilterOpen)}
                    className={`p-2 rounded-lg transition-colors ${
                      isFilterOpen
                        ? 'bg-blue-100 text-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                    title="Filter & Sort"
                  >
                    <Filter size={20} />
                  </button>
                  
                  {isFilterOpen && (
                    <div
                      className="fixed inset-0 bg-black bg-opacity-25 z-40"
                      onClick={() => setFilterOpen(false)}
                      aria-hidden="true"
                    ></div>
                  )}

                  <Transition
                    show={isFilterOpen}
                    as={Fragment}
                    enter="transition ease-out duration-300"
                    enterFrom="transform opacity-0 scale-95 translate-x-full"
                    enterTo="transform opacity-100 scale-100 translate-x-0"
                    leave="transition ease-in duration-200"
                    leaveFrom="transform opacity-100 scale-100 translate-x-0"
                    leaveTo="transform opacity-0 scale-95 translate-x-full"
                  >
                    <div className="fixed top-4 right-4 z-50">
                      <FilterControls 
                        onClose={() => setFilterOpen(false)} 
                        filters={filters}
                        onFilterChange={setFilters}
                      />
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <ShoppingList filters={filters} />
        </main>

        {/* Toast Notifications */}
        <Toaster
          position="bottom-center"
          reverseOrder={false}
          gutter={8}
          toastOptions={{
            duration: 3000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '8px',
            },
            success: {
              style: { background: '#10B981' },
            },
            error: {
              style: { background: '#EF4444' },
            },
          }}
        />
      </div>
    </QueryClientProvider>
  );
}

export default App;
