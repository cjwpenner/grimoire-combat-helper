import React, { createContext, useContext, useState } from 'react';

interface NavigationContextType {
  canGoBack: boolean;
  goBack: () => void;
  navigationStack: string[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [navigationStack, setNavigationStack] = useState<string[]>(['picker']);

  const canGoBack = navigationStack.length > 1;

  const goBack = () => {
    if (canGoBack) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  };

  return (
    <NavigationContext.Provider value={{ navigationStack, canGoBack, goBack }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}
