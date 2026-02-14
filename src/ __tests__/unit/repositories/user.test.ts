import mongoose from "mongoose";
import { UserModel } from "../../../models/user.model";
import { UserRepository } from "./../../../repository/user.repository";

describe("User Repository Unit Tests", () => {
  let userRepository: UserRepository;

  beforeAll(() => {
    userRepository = new UserRepository();
  });
  afterEach(async () => {
    await UserModel.deleteMany({});
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });
  test("should create a new user", async () => {
    const userData = {
      username: "testuser",
      email: "test@example.com",
      password: "Password123!",
      fullName: "Test User",
    };

    const newUser = await userRepository.createUser(userData);
    expect(newUser).toBeDefined();
    expect(newUser.username).toBe(userData.username);
    expect(newUser.email).toBe(userData.email);
  });
});
