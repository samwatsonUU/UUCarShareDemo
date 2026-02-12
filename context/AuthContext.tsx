/*

AuthContext.tsx

  Manages authentication for the application

  When a user logs in, any component that has imported the AuthContext will be able to
  retrieve user details, perhaps most importantly the user's ID

  AuthContext also provides login and logout functions to set and reset the details of the
  current logged in user as needed

*/

import React, { createContext, useContext, useState } from "react";

export type AuthUser = {
  
  userID: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  gender: string;
  role: string;
  bio: string;
  canDrive: number;
  prefersSameGender: number;
  smokingAllowed: number;

};

type AuthContextType = {

  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;

};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  const [user, setUser] = useState<AuthUser | null>(null);

  const login = (user: AuthUser) => {

    setUser(user);

  };

  const logout = () => {

    setUser(null);

  };

  return (

    <AuthContext.Provider

      value={{

        user,
        isLoggedIn: user !== null,
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
