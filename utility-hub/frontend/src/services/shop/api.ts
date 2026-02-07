import axiosInstance from '../../api/axiosInstance';
import type { ShopData, PurchaseResponse, PointBalance } from '../../types/shop';

const BASE_URL = '/v1/shop';

export const shopApi = {
      getShopData: () =>
            axiosInstance.get<{ success: boolean; data: ShopData }>(BASE_URL),

      getPointBalance: () =>
            axiosInstance.get<{ success: boolean; data: PointBalance }>(`${BASE_URL}/points`),

      purchaseTheme: (themeKey: string) =>
            axiosInstance.post<{ success: boolean; data: PurchaseResponse }>(
                  `${BASE_URL}/purchase`,
                  { themeKey }
            ),

      setActiveTheme: (themeKey: string | null) =>
            axiosInstance.post<{ success: boolean }>(
                  `${BASE_URL}/active-theme`,
                  { themeKey }
            ),
};
