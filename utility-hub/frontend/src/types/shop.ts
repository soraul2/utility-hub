export interface PointBalance {
      totalEarned: number;
      totalSpent: number;
      available: number;
}

export interface ThemeItem {
      key: string;
      name: string;
      description: string;
      price: number;
      category: 'COLOR' | 'PATTERN' | 'PREMIUM';
      previewColor: string;
      owned: boolean;
      active: boolean;
}

export interface ShopData {
      points: PointBalance;
      themes: ThemeItem[];
}

export interface PurchaseResponse {
      themeKey: string;
      pointsSpent: number;
      remainingPoints: number;
}
