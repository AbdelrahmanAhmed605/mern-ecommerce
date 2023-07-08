import { create } from "zustand";
import AuthService from "../utils/auth";

// Checks the user's logged in status so we can perform actions that require the user to log in
const useLoginStatusStore = create((set) => ({
  isLoggedIn: AuthService.loggedIn(),
  setIsLoggedIn: (value) => set(() => ({ isLoggedIn: value })),
}));

// Handles the visibility of the UserForm modal to allow users to sign up or log in
const useSignUpAndLoginStore = create((set) => ({
  userFormVisibility: false,
  setUserFormVisibility: (value) => set(() => ({ userFormVisibility: value })),
}));

export { useSignUpAndLoginStore, useLoginStatusStore };
