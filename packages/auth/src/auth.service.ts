import { AuditAction, UserRole, type UserStatus } from "@culebra/domain";
import { prisma } from "@culebra/db";

import { signAccessToken } from "./jwt.js";
import { hashPassword, verifyPassword } from "./password.js";
import type { LoginInput, RegisterInput } from "./schemas.js";
import { generateSecureToken, hashToken } from "./token.js";
import type { AuthSessionResult, AuthUser } from "./types.js";
import { notifyLogin } from "./notifications.service.js";

const SESSION_MAX_AGE_DAYS = Number(process.env.SESSION_MAX_AGE_DAYS ?? 7);

type UserWithRoles = {
  id: string;
  email: string;
  passwordHash: string | null;
  firstName: string | null;
  lastName: string | null;
  status: UserStatus;
  deletedAt: Date | null;
  roles: Array<{ role: { name: UserRole } }>;
};

function mapUser(user: UserWithRoles): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    roles: user.roles.map((entry) => entry.role.name),
    status: user.status,
  };
}

async function findUserByEmail(email: string): Promise<UserWithRoles | null> {
  return prisma.user.findFirst({
    where: {
      email: email.toLowerCase(),
      deletedAt: null,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  }) as Promise<UserWithRoles | null>;
}

async function findUserById(id: string): Promise<UserWithRoles | null> {
  return prisma.user.findFirst({
    where: {
      id,
      deletedAt: null,
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  }) as Promise<UserWithRoles | null>;
}

async function writeAuditLog(params: {
  actorUserId?: string;
  actorIp?: string;
  entityType: string;
  entityId: string;
  action: AuditAction;
  metadata?: Record<string, unknown>;
}) {
  await prisma.auditLog.create({
    data: {
      actorUserId: params.actorUserId,
      actorIp: params.actorIp,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      metadata: params.metadata,
    },
  });
}

function getSessionExpiryDate(): Date {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + SESSION_MAX_AGE_DAYS);
  return expiresAt;
}

async function createSession(
  user: AuthUser,
  context?: { ipAddress?: string; userAgent?: string },
): Promise<AuthSessionResult> {
  const sessionToken = generateSecureToken();
  const expiresAt = getSessionExpiryDate();

  await prisma.userSession.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(sessionToken),
      expiresAt,
      ipAddress: context?.ipAddress,
      userAgent: context?.userAgent,
    },
  });

  const accessToken = await signAccessToken(user);

  return {
    user,
    sessionToken,
    accessToken,
    expiresAt,
  };
}

export async function registerUser(
  input: RegisterInput,
  context?: { ipAddress?: string; userAgent?: string },
): Promise<AuthSessionResult> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error("EMAIL_ALREADY_EXISTS");
  }

  const consumerRole = await prisma.role.findUnique({
    where: { name: UserRole.CONSUMER },
  });
  if (!consumerRole) {
    throw new Error("CONSUMER_ROLE_NOT_FOUND");
  }

  const passwordHash = await hashPassword(input.password);

  const userRecord = (await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      roles: {
        create: {
          roleId: consumerRole.id,
        },
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  })) as UserWithRoles;

  const user = mapUser(userRecord);

  await writeAuditLog({
    actorUserId: user.id,
    actorIp: context?.ipAddress,
    entityType: "User",
    entityId: user.id,
    action: AuditAction.CREATE,
    metadata: { email: user.email, source: "register" },
  });

  return createSession(user, context);
}

export async function validateCredentials(
  input: LoginInput,
): Promise<AuthUser | null> {
  const user = await findUserByEmail(input.email);
  if (!user?.passwordHash) {
    return null;
  }

  if (user.status !== "ACTIVE") {
    return null;
  }

  const valid = await verifyPassword(input.password, user.passwordHash);
  if (!valid) {
    return null;
  }

  return mapUser(user);
}

export async function loginUser(
  input: LoginInput,
  context?: { ipAddress?: string; userAgent?: string },
): Promise<AuthSessionResult | null> {
  const user = await validateCredentials(input);
  if (!user) {
    await writeAuditLog({
      actorIp: context?.ipAddress,
      entityType: "User",
      entityId: input.email.toLowerCase(),
      action: AuditAction.LOGIN,
      metadata: { success: false },
    });
    notifyLogin({ email: input.email, role: "?", ipAddress: context?.ipAddress, userAgent: context?.userAgent, success: false });
    return null;
  }

  const session = await createSession(user, context);

  await writeAuditLog({
    actorUserId: user.id,
    actorIp: context?.ipAddress,
    entityType: "User",
    entityId: user.id,
    action: AuditAction.LOGIN,
    metadata: { success: true },
  });

  notifyLogin({
    email: user.email,
    role: user.roles[0] ?? "CONSUMER",
    ipAddress: context?.ipAddress,
    userAgent: context?.userAgent,
    success: true,
  });

  return session;
}

export async function validateSessionToken(
  sessionToken: string,
): Promise<AuthUser | null> {
  const session = (await prisma.userSession.findUnique({
    where: { tokenHash: hashToken(sessionToken) },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  })) as
    | {
        expiresAt: Date;
        user: UserWithRoles;
      }
    | null;

  if (!session || session.expiresAt < new Date()) {
    return null;
  }

  if (session.user.deletedAt || session.user.status !== "ACTIVE") {
    return null;
  }

  return mapUser(session.user);
}

export async function revokeSession(sessionToken: string): Promise<void> {
  await prisma.userSession.deleteMany({
    where: { tokenHash: hashToken(sessionToken) },
  });
}

export async function logoutUser(
  sessionToken: string,
  context?: { ipAddress?: string; userId?: string },
): Promise<void> {
  await revokeSession(sessionToken);

  if (context?.userId) {
    await writeAuditLog({
      actorUserId: context.userId,
      actorIp: context?.ipAddress,
      entityType: "User",
      entityId: context.userId,
      action: AuditAction.LOGOUT,
    });
  }
}

export async function getUserById(userId: string): Promise<AuthUser | null> {
  const user = await findUserById(userId);
  return user ? mapUser(user) : null;
}

export async function getActiveUserById(userId: string): Promise<AuthUser | null> {
  const user = await findUserById(userId);
  if (!user || user.status !== "ACTIVE") {
    return null;
  }
  return mapUser(user);
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
  await prisma.userSession.deleteMany({
    where: { userId },
  });
}

export async function requestPasswordReset(
  email: string,
): Promise<{ token?: string; userId?: string }> {
  const user = await findUserByEmail(email);
  if (!user) {
    return {};
  }

  const resetToken = generateSecureToken();
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 1);

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(resetToken),
      expiresAt,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    entityType: "User",
    entityId: user.id,
    action: AuditAction.CREATE,
    metadata: { source: "password_reset_request" },
  });

  return { token: resetToken, userId: user.id };
}

export async function seedAdminUser(): Promise<void> {
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;

  if (!email || !password) {
    return;
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return;
  }

  const adminRole = await prisma.role.findUnique({
    where: { name: UserRole.ADMIN },
  });
  if (!adminRole) {
    throw new Error("ADMIN_ROLE_NOT_FOUND");
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName: "Admin",
      lastName: "Marketplace",
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
  });
}
