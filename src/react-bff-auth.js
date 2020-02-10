import React, { useState, useEffect, useContext } from "react";
import axios from 'axios';

// import { EventEmitter } from "events";

let staticUser = null;

const fetchUser = async () => {
  if (staticUser) {
    console.log('already have profile', staticUser);
    return staticUser;
  }

  try {
    const response = await axios.get('/backend/userinfo');
    console.log(response);
    staticUser = response.data;
  } catch(e) {
    console.error(e);
  }

  return staticUser;
};

export const AuthContext = React.createContext();
export const useAuth = () => useContext(AuthContext);
export const AuthProvider = ({
  children
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState();
  const [user, setUser] = useState();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      // This should call userinfo to get the user
      const user = await fetchUser();

      const isAuthenticated = !!user;

      setIsAuthenticated(isAuthenticated);

      setUser(user);

      setLoading(false);
    };

    initAuth()
      .catch(console.error);
    //// eslint-disable-next-line
  }, []);

  const loginWithRedirect = () => {
    window.location = '/login';
  };

  const logout = () => {
    staticUser = null;
    setUser(null);
    setIsAuthenticated(null);
    setLoading(true);
    window.location = '/logout';
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        loginWithRedirect,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
