/*

AuthContext.tsx

  Manages authentication for the application

  When a user logs in, any component that has imported the AuthContext will be able to
  retrieve user details, perhaps most importantly the user's ID

  AuthContext also provides login and logout functions to set and reset the details of the
  current logged in user as needed

*/

import React, { createContext, useContext, useState } from "react";

// Structure representing the authenticated user - This mirrors the structure of the user record stored in the database.
export type AuthUser = {
  
  userID: number;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  gender: string;
  role: string;
  canDrive: number;
  prefersSameGender: number;
  smokingAllowed: number;

};


//Structure of the values stored in the auth context.
type AuthContextType = {

  user: AuthUser | null;
  isLoggedIn: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;

};


// Create the React Context - Initially set to null until it is provided by AuthProvider.
const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {

  // Stores the currently logged-in user
  const [user, setUser] = useState<AuthUser | null>(null);

  // Login function that stores authenticated user's info in state
  // Makes it accessible app-wide
  const login = (user: AuthUser) => {

    setUser(user);

  };

  // Logout function that clears the details in state of the store user 
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


// Hook for accessing the auth context
export function useAuth() {

  const context = useContext(AuthContext);

  if (!context) {

    throw new Error("useAuth must be used within AuthProvider");

  }

  return context;
  
}
