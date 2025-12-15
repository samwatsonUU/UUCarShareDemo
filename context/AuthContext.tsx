import React, { createContext, useContext, useState } from "react";

type AuthContextType = {
  isLoggedIn: boolean;
  login: (userId: number) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {




  // FOR TESTING!!!
  const [userId, setUserId] = useState<number | null>(null);
  //const [userId, setUserId] = useState<number | null>(1);




  const login = (id: number) => {
    setUserId(id);
  };

  const logout = () => {
    setUserId(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn: userId !== null,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
