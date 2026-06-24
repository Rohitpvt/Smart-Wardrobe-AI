"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AiQuotaContextProps {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

const AiQuotaContext = createContext<AiQuotaContextProps | undefined>(undefined);

export function AiQuotaProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const [quotaData, setQuotaData] = useState<any>(null);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);

  useEffect(() => {
    const handleQuotaExceeded = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setQuotaData(customEvent.detail);
      }
      setIsOpen(true);
    };

    window.addEventListener('ai_quota_exceeded', handleQuotaExceeded);
    return () => {
      window.removeEventListener('ai_quota_exceeded', handleQuotaExceeded);
    };
  }, []);

  return (
    <AiQuotaContext.Provider value={{ isOpen, openModal, closeModal }}>
      {children}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white dark:bg-neutral-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-neutral-200 dark:border-neutral-800 zoom-in-95 animate-in">
            <h2 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Gemini quota reached
            </h2>
            <p className="text-neutral-600 dark:text-neutral-400 mb-6">
              Your Gemini API key has reached its quota or rate limit. Check Google AI Studio or add another key.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  closeModal();
                  router.push('/settings/ai-access');
                }}
                className="flex-1 bg-black dark:bg-white text-white dark:text-black font-semibold py-2.5 px-4 rounded-xl hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
              >
                Manage Gemini Key
              </button>
              <button
                onClick={closeModal}
                className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-white font-semibold py-2.5 px-4 rounded-xl hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AiQuotaContext.Provider>
  );
}

export function useAiQuotaModal() {
  const context = useContext(AiQuotaContext);
  if (!context) {
    throw new Error('useAiQuotaModal must be used within an AiQuotaProvider');
  }
  return context;
}
