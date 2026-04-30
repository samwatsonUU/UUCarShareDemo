/*
  User Service

  This service manages all database operations related to user accounts.

  It provides functionality for:
  - authenticating users during login
  - checking if an email already exists
  - creating new user accounts
  - retrieving user profile data
  - updating user profile information
  
*/

import type { SQLiteDatabase } from "expo-sqlite";
import type { AuthUser } from "@/context/AuthContext";

/*
  Input structure used when creating a new user account.
*/
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

/*
  Input structure used when updating a user's profile.

  The password is not included here because profile updates only
  modify personal preferences and contact information.
*/
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

/*
  Authenticate a user during login.

  The query searches for a user with the provided email and password.
  Email comparison is case-insensitive using LOWER().

  If a matching user is found, their account information is returned.
  Otherwise, null is returned.
*/
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

/*
  Check whether an email address is already registered.

  This is used during account registration to prevent duplicate users.
*/
export async function emailExists(
  db: SQLiteDatabase,
  email: string
): Promise<boolean> {

  const result = await db.getFirstAsync(
    `SELECT 1 FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1`,
    [email]
  );

  return !!result;
}

/*
  Create a new user account.

  This inserts a new record into the users table using the
  values provided during registration.
*/
export async function createUser(
  db: SQLiteDatabase,
  user: CreateUserInput
): Promise<void> {

  await db.runAsync(
    `INSERT INTO users (
      email,
      password,
      firstName,
      lastName,
      gender,
      role,
      canDrive,
      prefersSameGender,
      smokingAllowed
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

/*
  Retrieve a user by their unique user ID.

  This is commonly used when loading profile information
  for the currently authenticated user.
*/
export async function getUserById(
  db: SQLiteDatabase,
  userID: number
): Promise<AuthUser | null> {

  return await db.getFirstAsync<AuthUser>(
    `SELECT * FROM users WHERE userID = ?`,
    [userID]
  );

}

/*
  Update an existing user's profile.

  Only editable profile fields are updated. The userID is used
  to ensure the correct user record is modified.
*/
export async function updateUserProfile(
  db: SQLiteDatabase,
  userID: number,
  updates: UpdateUserProfileInput
): Promise<void> {

  await db.runAsync(
    `UPDATE users
     SET email = ?,
         firstName = ?,
         lastName = ?,
         gender = ?,
         role = ?,
         canDrive = ?,
         prefersSameGender = ?,
         smokingAllowed = ?
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

/*
  Check whether an email address is already in-used by another user.

  This is used on the profile page to check that the email provided by the user is not in use by any OTHER user.
*/
export async function emailExistsForOtherUser(
  db: SQLiteDatabase,
  email: string,
  userID: number
): Promise<boolean> {
  const result = await db.getFirstAsync(
    `SELECT 1
     FROM users
     WHERE LOWER(email) = LOWER(?)
       AND userID != ?
     LIMIT 1`,
    [email, userID]
  );

  return !!result;
}