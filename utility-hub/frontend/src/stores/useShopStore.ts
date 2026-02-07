import { create } from 'zustand';
import { shopApi } from '../services/shop/api';
import type { ShopData } from '../types/shop';

interface ShopState {
      shopData: ShopData | null;
      isLoading: boolean;
      error: string | null;

      loadShopData: () => Promise<void>;
      purchaseTheme: (themeKey: string) => Promise<boolean>;
      setActiveTheme: (themeKey: string | null) => Promise<boolean>;
      clearError: () => void;
}

export const useShopStore = create<ShopState>((set, get) => ({
      shopData: null,
      isLoading: false,
      error: null,

      loadShopData: async () => {
            set({ isLoading: true, error: null });
            try {
                  const res = await shopApi.getShopData();
                  set({ shopData: res.data.data, isLoading: false });
            } catch {
                  set({ error: '상점 데이터를 불러올 수 없습니다.', isLoading: false });
            }
      },

      purchaseTheme: async (themeKey: string) => {
            try {
                  await shopApi.purchaseTheme(themeKey);
                  await get().loadShopData();
                  return true;
            } catch (err: any) {
                  const msg = err.response?.data?.error?.message || '구매에 실패했습니다.';
                  set({ error: msg });
                  return false;
            }
      },

      setActiveTheme: async (themeKey: string | null) => {
            try {
                  await shopApi.setActiveTheme(themeKey);
                  // Update local state optimistically
                  set((state) => {
                        if (!state.shopData) return state;
                        return {
                              shopData: {
                                    ...state.shopData,
                                    themes: state.shopData.themes.map((t) => ({
                                          ...t,
                                          active: t.key === (themeKey || 'default'),
                                    })),
                              },
                        };
                  });
                  return true;
            } catch {
                  set({ error: '테마 변경에 실패했습니다.' });
                  return false;
            }
      },

      clearError: () => set({ error: null }),
}));
