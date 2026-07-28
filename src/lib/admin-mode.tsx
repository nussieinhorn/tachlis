"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

type AdminModeContextValue = {
  isAdmin: boolean;
  setIsAdmin: (value: boolean) => void;
};

const AdminModeContext = createContext<AdminModeContextValue | null>(null);

export function AdminModeProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  return (
    <AdminModeContext.Provider value={{ isAdmin, setIsAdmin }}>
      {children}
    </AdminModeContext.Provider>
  );
}

export function useAdminMode() {
  const ctx = useContext(AdminModeContext);
  if (!ctx) throw new Error("useAdminMode must be used within AdminModeProvider");
  return ctx;
}
