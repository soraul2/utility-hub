import { useEffect, useState } from 'react';
import { useShopStore } from '../../stores/useShopStore';
import { useTheme } from '../../context/ThemeContext';
import { THEME_STYLES } from '../../lib/constants/themes';
import type { ThemeItem } from '../../types/shop';
import { Coins, Check, ShoppingBag, Sparkles, Palette, Grid3X3, Crown, ArrowLeft, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

const CATEGORY_META: Record<string, { label: string; icon: typeof Palette; description: string }> = {
      COLOR: { label: '컬러 테마', icon: Palette, description: '앱 전체 색상을 변경합니다' },
      PATTERN: { label: '배경 패턴', icon: Grid3X3, description: '배경에 패턴 효과를 추가합니다' },
      PREMIUM: { label: '프리미엄', icon: Crown, description: '컬러 + 배경 패턴 통합 테마' },
};

const ThemeShopPage = () => {
      const { shopData, isLoading, error, loadShopData, purchaseTheme, setActiveTheme, clearError } = useShopStore();
      const { setColorTheme, theme: currentMode } = useTheme();
      const [confirmTheme, setConfirmTheme] = useState<ThemeItem | null>(null);
      const [purchasing, setPurchasing] = useState(false);

      useEffect(() => {
            loadShopData();
      }, [loadShopData]);

      const handlePurchase = async () => {
            if (!confirmTheme) return;
            setPurchasing(true);
            const success = await purchaseTheme(confirmTheme.key);
            setPurchasing(false);
            setConfirmTheme(null);
            if (success) {
                  // Auto-equip after purchase
                  await handleEquip(confirmTheme.key);
            }
      };

      const handleEquip = async (themeKey: string) => {
            const success = await setActiveTheme(themeKey === 'default' ? null : themeKey);
            if (success) {
                  setColorTheme(themeKey);
            }
      };

      if (isLoading && !shopData) {
            return (
                  <div className="min-h-screen flex items-center justify-center bg-mystic-bg">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent" />
                  </div>
            );
      }

      const points = shopData?.points;
      const themes = shopData?.themes || [];
      const categories = ['COLOR', 'PATTERN', 'PREMIUM'] as const;

      return (
            <div className="min-h-screen bg-mystic-bg transition-colors">
                  {/* Header */}
                  <div className="sticky top-0 z-40 bg-mystic-bg-secondary/80 backdrop-blur-xl border-b border-mystic-border">
                        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                    <Link
                                          to="/routine/monthly"
                                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                                    >
                                          <ArrowLeft className="w-5 h-5" />
                                    </Link>
                                    <div className="flex items-center gap-2">
                                          <ShoppingBag className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                          <h1 className="text-lg font-black text-gray-900 dark:text-white">Theme Shop</h1>
                                    </div>
                              </div>

                              {/* Point Balance Badge */}
                              {points && (
                                    <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/30">
                                          <Coins className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                                          <span className="text-sm font-black text-amber-700 dark:text-amber-300">
                                                {points.available.toLocaleString()}
                                          </span>
                                          <span className="text-xs text-amber-500 dark:text-amber-500">P</span>
                                    </div>
                              )}
                        </div>
                  </div>

                  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-8">
                        {/* Point Summary Card */}
                        {points && (
                              <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
                                    <div className="flex items-center gap-3 mb-4">
                                          <div className="p-2 bg-white/20 rounded-lg">
                                                <Sparkles className="w-5 h-5" />
                                          </div>
                                          <h2 className="text-lg font-bold">My Points</h2>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                          <div>
                                                <p className="text-white/60 text-xs font-medium mb-1">사용 가능</p>
                                                <p className="text-2xl font-black">{points.available.toLocaleString()}</p>
                                          </div>
                                          <div>
                                                <p className="text-white/60 text-xs font-medium mb-1">총 획득</p>
                                                <p className="text-lg font-bold text-white/80">{points.totalEarned.toLocaleString()}</p>
                                          </div>
                                          <div>
                                                <p className="text-white/60 text-xs font-medium mb-1">사용</p>
                                                <p className="text-lg font-bold text-white/80">{points.totalSpent.toLocaleString()}</p>
                                          </div>
                                    </div>
                                    <p className="mt-4 text-xs text-white/50">
                                          포인트는 루틴 활동(계획, 태스크 완료, 회고 등)으로 XP와 함께 획득됩니다.
                                    </p>
                              </div>
                        )}

                        {/* Error Message */}
                        {error && (
                              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-center justify-between">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                    <button onClick={clearError} className="text-red-400 hover:text-red-600 text-sm font-medium">
                                          닫기
                                    </button>
                              </div>
                        )}

                        {/* Default Theme Card */}
                        {(() => {
                              const defaultTheme = themes.find((t) => t.key === 'default');
                              const isDefaultActive = defaultTheme?.active ?? !themes.some((t) => t.active);
                              return (
                                    <section>
                                          <div className="flex items-center gap-2 mb-4">
                                                <RotateCcw className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                <h2 className="text-base font-black text-gray-900 dark:text-white">기본 테마</h2>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">무료 기본 테마로 되돌립니다</span>
                                          </div>
                                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                <div
                                                      className={classNames(
                                                            'group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg',
                                                            isDefaultActive
                                                                  ? 'border-indigo-400 dark:border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-none ring-2 ring-indigo-400/30'
                                                                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                                                      )}
                                                >
                                                      <div
                                                            className="h-28 relative overflow-hidden"
                                                            style={{
                                                                  background: currentMode === 'dark'
                                                                        ? 'linear-gradient(135deg, #050816, #0f172a)'
                                                                        : 'linear-gradient(135deg, #f8f9fa, #ffffff)',
                                                            }}
                                                      >
                                                            <div className="absolute inset-3 flex flex-col gap-1.5">
                                                                  <div className="flex gap-1.5">
                                                                        <div className="h-2 rounded-full" style={{ background: currentMode === 'dark' ? '#818cf8' : '#4338ca', width: '40%', opacity: 0.9 }} />
                                                                        <div className="h-2 rounded-full" style={{ background: currentMode === 'dark' ? '#a5b4fc' : '#6366f1', width: '25%', opacity: 0.5 }} />
                                                                  </div>
                                                                  <div className="flex-1 rounded-lg" style={{ background: currentMode === 'dark' ? '#0f172a' : '#ffffff', opacity: 0.6 }} />
                                                                  <div className="flex gap-1">
                                                                        <div className="h-1.5 rounded-full" style={{ background: currentMode === 'dark' ? '#818cf8' : '#4338ca', width: '30%', opacity: 0.7 }} />
                                                                        <div className="h-1.5 rounded-full" style={{ background: currentMode === 'dark' ? '#a5b4fc' : '#6366f1', width: '20%', opacity: 0.4 }} />
                                                                  </div>
                                                            </div>
                                                            {isDefaultActive && (
                                                                  <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                                                                        <Check className="w-3 h-3" />
                                                                  </div>
                                                            )}
                                                      </div>
                                                      <div className="p-3 bg-mystic-bg-secondary space-y-2">
                                                            <div>
                                                                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">Default</h3>
                                                                  <p className="text-[11px] text-gray-400 dark:text-gray-500">기본 인디고 테마</p>
                                                            </div>
                                                            {isDefaultActive ? (
                                                                  <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                                                        <Check className="w-3.5 h-3.5" />
                                                                        사용 중
                                                                  </div>
                                                            ) : (
                                                                  <button
                                                                        onClick={() => handleEquip('default')}
                                                                        className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                                  >
                                                                        장착하기
                                                                  </button>
                                                            )}
                                                      </div>
                                                </div>
                                          </div>
                                    </section>
                              );
                        })()}

                        {/* Theme Categories */}
                        {categories.map((category) => {
                              const categoryThemes = themes.filter((t) => t.category === category && t.price > 0);
                              if (categoryThemes.length === 0) return null;
                              const meta = CATEGORY_META[category];
                              const Icon = meta.icon;

                              return (
                                    <section key={category}>
                                          <div className="flex items-center gap-2 mb-4">
                                                <Icon className="w-5 h-5 text-gray-400 dark:text-gray-500" />
                                                <h2 className="text-base font-black text-gray-900 dark:text-white">{meta.label}</h2>
                                                <span className="text-xs text-gray-400 dark:text-gray-500">{meta.description}</span>
                                          </div>
                                          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                                                {categoryThemes.map((item) => (
                                                      <ThemeCard
                                                            key={item.key}
                                                            item={item}
                                                            currentMode={currentMode}
                                                            onBuy={() => setConfirmTheme(item)}
                                                            onEquip={() => handleEquip(item.key)}
                                                            availablePoints={points?.available || 0}
                                                      />
                                                ))}
                                          </div>
                                    </section>
                              );
                        })}
                  </div>

                  {/* Purchase Confirmation Modal */}
                  {confirmTheme && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                              <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 space-y-4">
                                    <h3 className="text-lg font-bold text-gray-900 dark:text-white">테마 구매</h3>
                                    <div className="flex items-center gap-4">
                                          <div
                                                className="w-16 h-16 rounded-xl"
                                                style={{ background: confirmTheme.previewColor }}
                                          />
                                          <div>
                                                <p className="font-bold text-gray-900 dark:text-white">{confirmTheme.name}</p>
                                                <p className="text-sm text-gray-500">{confirmTheme.description}</p>
                                          </div>
                                    </div>
                                    <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                                          <span className="text-sm text-gray-500">가격</span>
                                          <div className="flex items-center gap-1">
                                                <Coins className="w-4 h-4 text-amber-500" />
                                                <span className="font-bold text-gray-900 dark:text-white">{confirmTheme.price}</span>
                                          </div>
                                    </div>
                                    {(points?.available || 0) < confirmTheme.price && (
                                          <p className="text-sm text-red-500 font-medium">포인트가 부족합니다.</p>
                                    )}
                                    <div className="flex gap-3">
                                          <button
                                                onClick={() => setConfirmTheme(null)}
                                                className="flex-1 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 font-bold text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                          >
                                                취소
                                          </button>
                                          <button
                                                onClick={handlePurchase}
                                                disabled={purchasing || (points?.available || 0) < confirmTheme.price}
                                                className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                          >
                                                {purchasing ? '구매 중...' : '구매하기'}
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}
            </div>
      );
};

// Theme Card Component
const ThemeCard = ({
      item,
      currentMode,
      onBuy,
      onEquip,
      availablePoints,
}: {
      item: ThemeItem;
      currentMode: 'light' | 'dark';
      onBuy: () => void;
      onEquip: () => void;
      availablePoints: number;
}) => {
      const themeStyle = THEME_STYLES[item.key];
      const vars = themeStyle
            ? currentMode === 'dark'
                  ? themeStyle.variables.dark
                  : themeStyle.variables.light
            : {};

      const bgPrimary = vars['--mystic-bg-primary'] || item.previewColor;
      const bgSecondary = vars['--mystic-bg-secondary'] || item.previewColor;
      const accent = vars['--mystic-accent'] || '#6366f1';
      const accentLight = vars['--mystic-accent-light'] || '#818cf8';

      const bgPattern = themeStyle?.backgroundCss?.[currentMode];

      const canAfford = availablePoints >= item.price;

      return (
            <div
                  className={classNames(
                        'group relative rounded-2xl overflow-hidden border transition-all duration-300 hover:shadow-lg',
                        item.active
                              ? 'border-indigo-400 dark:border-indigo-500 shadow-md shadow-indigo-100 dark:shadow-none ring-2 ring-indigo-400/30'
                              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  )}
            >
                  {/* Preview Area */}
                  <div
                        className="h-28 relative overflow-hidden"
                        style={{
                              background: `linear-gradient(135deg, ${bgPrimary}, ${bgSecondary})`,
                              backgroundImage: bgPattern || undefined,
                        }}
                  >
                        {/* Mini UI Preview */}
                        <div className="absolute inset-3 flex flex-col gap-1.5">
                              <div className="flex gap-1.5">
                                    <div className="h-2 rounded-full" style={{ background: accent, width: '40%', opacity: 0.9 }} />
                                    <div className="h-2 rounded-full" style={{ background: accentLight, width: '25%', opacity: 0.5 }} />
                              </div>
                              <div className="flex-1 rounded-lg" style={{ background: bgSecondary, opacity: 0.6 }} />
                              <div className="flex gap-1">
                                    <div className="h-1.5 rounded-full" style={{ background: accent, width: '30%', opacity: 0.7 }} />
                                    <div className="h-1.5 rounded-full" style={{ background: accentLight, width: '20%', opacity: 0.4 }} />
                              </div>
                        </div>

                        {/* Active Badge */}
                        {item.active && (
                              <div className="absolute top-2 right-2 bg-indigo-600 text-white rounded-full p-1">
                                    <Check className="w-3 h-3" />
                              </div>
                        )}

                        {/* Owned Badge */}
                        {item.owned && !item.active && (
                              <div className="absolute top-2 right-2 bg-green-500/90 text-white rounded-full px-2 py-0.5 text-[10px] font-bold">
                                    보유
                              </div>
                        )}
                  </div>

                  {/* Info Area */}
                  <div className="p-3 bg-mystic-bg-secondary space-y-2">
                        <div>
                              <h3 className="text-sm font-bold text-gray-900 dark:text-white truncate">{item.name}</h3>
                              <p className="text-[11px] text-gray-400 dark:text-gray-500 truncate">{item.description}</p>
                        </div>

                        {/* Action */}
                        {item.active ? (
                              <div className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                                    <Check className="w-3.5 h-3.5" />
                                    사용 중
                              </div>
                        ) : item.owned ? (
                              <button
                                    onClick={onEquip}
                                    className="w-full py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                              >
                                    장착하기
                              </button>
                        ) : (
                              <button
                                    onClick={onBuy}
                                    disabled={!canAfford}
                                    className={classNames(
                                          'w-full py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5',
                                          canAfford
                                                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'
                                    )}
                              >
                                    <Coins className="w-3.5 h-3.5" />
                                    {item.price}
                              </button>
                        )}
                  </div>
            </div>
      );
};

export default ThemeShopPage;
