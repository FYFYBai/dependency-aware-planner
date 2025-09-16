export interface User {
  id: string;
  username: string;
  email: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: { username: string; password: string }) => Promise<void>;
  register: (userData: { username: string; email: string; password: string }) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}
