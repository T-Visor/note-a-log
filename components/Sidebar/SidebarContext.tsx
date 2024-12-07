import React, { createContext, useContext, useState, useReducer } from "react";

type SidebarContextType = {
  isLoading: boolean;
  setLoading: (loading: boolean) => void;
  forceUpdate: () => void; // Function to trigger re-renders
  updateCounter: number;   // Counter to indicate updates for listeners
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Dummy state to force re-renders
  const [updateCounter, triggerUpdate] = useReducer(x => x + 1, 0);

  return (
    <SidebarContext.Provider
      value={{
        isLoading,
        setLoading: setIsLoading,
        forceUpdate: triggerUpdate, // Function to trigger re-renders
        updateCounter,             // Expose counter for components to listen
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
};

export const useSidebarContext = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebarContext must be used within a SidebarProvider");
  }
  return context;
};
