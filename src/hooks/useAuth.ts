import { useLocalStorage } from './useLocalStorage';

export interface AuthUser {
  id?: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  userType?: string;
  isAuthenticated: boolean;
  authToken:string;
  loginAt: string;
}

export interface SignupData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  deviceId:string
  authToken:string
}

interface RegisteredUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone: string;
  deviceId:string
}

export const useAuth = () => {
  const [user, setUser] =
    useLocalStorage<AuthUser | null>('auth-user', null);

  const [registeredUsers, setRegisteredUsers] =
    useLocalStorage<RegisteredUser[]>('registered-users', []);

  const login = (data: any) => {
    const authUser: AuthUser = {
      id: data.id,
      email: data.email,
      name: `${data.fName} ${data.lName}`,
      firstName: data.fName,
      lastName: data.lName,
      phone: data.phone,
      userType: data.userType,
      isAuthenticated: true,
      authToken: data.authToken,
      loginAt: new Date().toISOString(),
    };

    setUser(authUser);
    localStorage.setItem('auth-token', data.authToken);

    return { success: true };
  };

  const signup = (data: SignupData) => {
    // unchanged logic
    setUser({
      email: data.email,
      name: `${data.firstName} ${data.lastName}`,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      isAuthenticated: true,
      authToken: data.authToken,
      loginAt: new Date().toISOString(),
    });

    localStorage.setItem('auth-token', data.authToken);

    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth-token');
  };

  return {
    user,
    token: localStorage.getItem('auth-token'),
    isAuthenticated: !!user?.isAuthenticated,
    login,
    signup,
    logout,
  };
};

