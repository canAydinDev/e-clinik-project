import { account } from "./appwrite";

export const signUp = async (email: string, password: string, name: string) => {
  return await account.create("unique()", email, password, name);
};

export const signIn = async (email: string, password: string) => {
  return await account.createEmailPasswordSession(email, password);
};

export const getCurrentUser = async () => {
  return await account.get();
};

export const logout = async () => {
  return await account.deleteSession("current");
};
