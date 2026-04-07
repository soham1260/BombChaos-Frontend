import { create } from 'zustand';

const STORAGE_KEY = 'bombchaos_auth';

export const useAuthStore = create((set) => ({
    token: null,
    user: null,  // { userId, username, rating }

    /* Set auth state and persist to localStorage */
    setAuth: (user, token) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, token }));
        set({ user, token });
    },

    updateRating: (newRating) => {
        set((state) => {
            if (!state.user) return {};
            const updated = { ...state.user, rating: newRating };
            const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, user: updated }));
            return { user: updated };
        });
    },

    logout: () => {
        localStorage.removeItem(STORAGE_KEY);
        set({ user: null, token: null });
    },

    loadFromStorage: () => {
        try {
            const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
            if (saved?.token && saved?.user) {
                set({ token: saved.token, user: saved.user });
                return { token: saved.token, user: saved.user };
            }
        } catch { }
        return null;
    },
}));
