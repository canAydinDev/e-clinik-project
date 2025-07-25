import bcrypt from "bcrypt";
import { getUserByUsername } from "./actions/patient.actions";

export async function verifyUserCredentials(
  username: string,
  password: string
) {
  const user = await getUserByUsername(username);

  if (!user) return null;

  const isPasswordCorrect = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordCorrect) return null;

  return user;
}

// "node-appwrite": "^17.1.0",
