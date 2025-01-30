import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Store } from "../../models/store";

const useStore = create<Store>()(
  persist(
    (set) => ({
      user: "",
      auth: false,
      initialize: (user: string) => set({ user, auth: true }),
      logout: () => set({ user: "", auth: false }),
    }),
    { name: "auth", storage: createJSONStorage(() => sessionStorage) }
  )
);

export default useStore;
