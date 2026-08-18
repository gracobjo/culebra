import type { UserRole, UserStatus } from "@culebra/domain";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  roles: UserRole[];
  status: UserStatus;
};

export type AuthSessionResult = {
  user: AuthUser;
  sessionToken: string;
  accessToken: string;
  expiresAt: Date;
};

export type JwtPayload = {
  sub: string;
  email: string;
  roles: UserRole[];
};
