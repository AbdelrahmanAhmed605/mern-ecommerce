// userStore.js
import {create} from "zustand";

const useUserStore = create((set) => ({
  isLoggedIn: false,
  setIsLoggedIn: (value) => set(() => ({ isLoggedIn: value })),
}));

export default useUserStore;
