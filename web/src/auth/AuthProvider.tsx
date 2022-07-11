import React from 'react'
import AuthModule from 'modules/auth/auth.module'
import { Navigate, useLocation } from 'react-router-dom';

interface AuthContextType {
  user: any;
  signIn: (user: string, callback: VoidFunction) => void;
  signOut: (callback: VoidFunction) => void;
}

let AuthContext = React.createContext<AuthContextType>(null!);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  let [user, setUser] = React.useState<any>(null);

  let signIn = (newUser: string, callback: VoidFunction) => {
    return AuthModule.signIn(() => {
      setUser(newUser);
      callback();
    });
  };

  let signOut = (callback: VoidFunction) => {
    return AuthModule.signOut(() => {
      setUser(null);
      callback();
    });
  };

  let value = { user, signIn, signOut };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const RequireAuth = ({ children }: { children: JSX.Element }) => {
  let auth = useAuth();
  // const auth = {user: 'asdf'}
  let location = useLocation();
  console.log('RequireAuth', auth, location)

  if (!auth.user) {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

export default AuthProvider

const useAuth = () => {
  return React.useContext(AuthContext);
}
