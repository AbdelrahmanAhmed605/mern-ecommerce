import { create } from "zustand";
import AuthService from "../utils/auth";

const useLoginStatusStore = create((set) => ({
  isLoggedIn: AuthService.loggedIn(),
  setIsLoggedIn: (value) => set(() => ({ isLoggedIn: value })),
}));

const useSignUpAndLoginStore = create((set) => ({
  userFormVisibility: false,
  setUserFormVisibility: (value) => set(() => ({ userFormVisibility: value })),
}));

export { useSignUpAndLoginStore, useLoginStatusStore };
