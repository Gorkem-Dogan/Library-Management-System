// TypeScript
export interface UserResponse {
  id: string; // UUID
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  active: boolean;
}

export interface CreateUserRequest {
  // id is intentionally omitted; backend may generate it
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  active: boolean;
}

export interface UpdateUserRequest {
  // Backend supports partials for most fields, but active is required on update
  username?: string | null;
  password?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  role?: string | null;
  active: boolean;
}
