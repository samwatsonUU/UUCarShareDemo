import type { SQLiteDatabase } from "expo-sqlite";
import type { AuthUser } from "@/context/AuthContext";

export type CreateUserInput = {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  gender: string;
  role: string;
  canDrive: number;
  prefersSameGender: number;
  smokingAllowed: number;
};

export type UpdateUserProfileInput = {
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  role: string;
  canDrive: number;
  prefersSameGender: number;
  smokingAllowed: number;
};

export async function authenticateUser(
  db: SQLiteDatabase,
  email: string,
  password: string
): Promise<AuthUser | null> {
  return await db.getFirstAsync<AuthUser>(
    `SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ?`,
    [email, password]
  );
}

export async function emailExists(
  db: SQLiteDatabase,
  email: string
): Promise<boolean> {
  const result = await db.getFirstAsync(
    `SELECT 1 FROM users WHERE email = ? LIMIT 1`,
    [email]
  );

  return !!result;
}

export async function createUser(
  db: SQLiteDatabase,
  user: CreateUserInput
): Promise<void> {
  await db.runAsync(
    `INSERT INTO users (
      email, password, firstName, lastName, gender, role, canDrive, prefersSameGender, smokingAllowed
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      user.email,
      user.password,
      user.firstName,
      user.lastName,
      user.gender,
      user.role,
      user.canDrive,
      user.prefersSameGender,
      user.smokingAllowed,
    ]
  );
}

export async function getUserById(
  db: SQLiteDatabase,
  userID: number
): Promise<AuthUser | null> {
  return await db.getFirstAsync<AuthUser>(
    `SELECT * FROM users WHERE userID = ?`,
    [userID]
  );
}

export async function updateUserProfile(
  db: SQLiteDatabase,
  userID: number,
  updates: UpdateUserProfileInput
): Promise<void> {
  await db.runAsync(
    `UPDATE users
     SET email = ?, firstName = ?, lastName = ?, gender = ?, role = ?, canDrive = ?, prefersSameGender = ?, smokingAllowed = ?
     WHERE userID = ?`,
    [
      updates.email,
      updates.firstName,
      updates.lastName,
      updates.gender,
      updates.role,
      updates.canDrive,
      updates.prefersSameGender,
      updates.smokingAllowed,
      userID,
    ]
  );
}