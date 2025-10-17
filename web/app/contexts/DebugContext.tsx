import {createContext, useContext, useState, ReactNode, useEffect} from 'react';

interface DebugContextType {
  commentsEnabled: boolean;
  toggleComments: () => void;
}

const DebugContext = createContext<DebugContextType | undefined>(undefined);

export function DebugProvider({children}: {children: ReactNode}) {
  const [commentsEnabled, setCommentsEnabled] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const toggleComments = () => {
    if (isHydrated) {
      setCommentsEnabled((prev) => !prev);
    }
  };

  return (
    <DebugContext.Provider value={{commentsEnabled, toggleComments}}>
      {children}
    </DebugContext.Provider>
  );
}

export function useDebug() {
  const context = useContext(DebugContext);
  if (context === undefined) {
    throw new Error('useDebug must be used within a DebugProvider');
  }
  return context;
}
