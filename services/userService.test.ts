
import { authenticateUser, emailExists, createUser, getUserById, updateUserProfile, CreateUserInput, UpdateUserProfileInput } from "./userService"

describe("authenticateUser", () => {

    it("tests the getFirstAsync is called with the correct parameters", async () => {

        const mockUser = {

            userID: 1,
            email: "email",
            firstName: "Test",
            lastName: "User",
            password: "password",
            gender: "Male",
            role: "Student",
            canDrive: 1,
            prefersSameGender: 0,
            smokingAllowed: 1,

        };

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue(mockUser)

        } as any;

        const result = await(authenticateUser(mockDb, "email", "password"));

        expect(result).toEqual(mockUser);
        expect(mockDb.getFirstAsync).toHaveBeenLastCalledWith(`SELECT * FROM users WHERE LOWER(email) = LOWER(?) AND password = ?`,
    ["email", "password"])

    })

    it("returns null when credentials do not match", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue(null),

        } as any;

        const result = await authenticateUser(mockDb, "email", "password");

        expect(result).toBeNull();

    });

})

describe("emailExists", () => {

    it("returns true when the email provided is found", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue({

                email: 1

            })

        } as any;

        const result = await(emailExists(mockDb, "testEmail"));

        expect(result).toBe(true);
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith("SELECT 1 FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1", ["testEmail"])

    })

    it("returns false when the email provided cannot be found", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue(null),

        } as any;

        const result = await(emailExists(mockDb, "testEmail"));

        expect(result).toBe(false);
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith("SELECT 1 FROM users WHERE LOWER(email) = LOWER(?) LIMIT 1", ["testEmail"])

    })

})

describe("createUser", () => {

    it("tests the the createUser function uses the correct SQL query with expected parameters", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined),

        } as any;

        const user = <CreateUserInput> {

            email: "",
            password: "",
            firstName: "",
            lastName: "",
            gender: "",
            role: "",
            canDrive: 1,
            prefersSameGender: 1,
            smokingAllowed: 1,

        }

        await createUser(mockDb, user)

        expect(mockDb.runAsync).toHaveBeenCalledWith(`INSERT INTO users (
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
      "",
      "",
      "",
      "",
      "",
      "",
      1,
      1,
      1,
    ])

    })

})

describe("getUserById", () => {

    it("returns the user if found", async () => {

        const mockUser = {

            userID: 1,
            email: "",
            firstName: "",
            lastName: "",
            password: "",
            gender: "",
            role: "",
            canDrive: 1,
            prefersSameGender: 1,
            smokingAllowed: 1,

        }

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue(mockUser)

        } as any;

        const result = await getUserById(mockDb, 1);

        expect(result).toEqual(mockUser);
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith(`SELECT * FROM users WHERE userID = ?`, [1])

    })

    it("returns null when user is not found", async () => {

        const mockDb = {

            getFirstAsync: jest.fn().mockResolvedValue(null),

        } as any;

        const result = await getUserById(mockDb, 1);
        expect(result).toBeNull();
        expect(mockDb.getFirstAsync).toHaveBeenCalledWith(`SELECT * FROM users WHERE userID = ?`, [1])
    });

})

describe("updateUserProfile", () => {

    it("tests that the updateUserProfile calls the correct SQL query and that params are passed correctly", async () => {

        const mockDb = {

            runAsync: jest.fn().mockResolvedValue(undefined)

        } as any;

        const user = <UpdateUserProfileInput> {

            email: "",
            firstName: "",
            lastName: "",
            gender: "",
            role: "",
            canDrive: 1,
            prefersSameGender: 1,
            smokingAllowed: 1,

        }

        await updateUserProfile(mockDb, 1, user)

        expect(mockDb.runAsync).toHaveBeenCalledWith(`UPDATE users
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
      "",
      "",
      "",
      "",
      "",
      1,
      1,
      1,
      1,
    ])

    })

})