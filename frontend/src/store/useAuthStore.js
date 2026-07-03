import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
    persist(
        (set) => ({
            user: null,
            token: null,
            isAuthenticated: false,

            login: (userData, token) =>
                set({
                    user: userData,
                    token,
                    isAuthenticated: true,
                }),

            logout: () =>
                set({
                    user: null,
                    token: null,
                    isAuthenticated: false,
                }),
        }),
        {
            name: 'auth-storage',
            storage: {
                getItem: (name) => {
                    const value = sessionStorage.getItem(name);
                    return value ?? null;
                },
                setItem: (name, value) => sessionStorage.setItem(name, value),
                removeItem: (name) => sessionStorage.removeItem(name),
            },
        }
    )
);

export default useAuthStore;
