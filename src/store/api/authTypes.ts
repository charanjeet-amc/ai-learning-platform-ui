export interface AuthResponse {
  token: string;
  userId: string;
  username: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  roles: string[];
}
