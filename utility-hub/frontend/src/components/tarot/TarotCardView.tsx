import React from 'react';
import type { TarotCard } from '../../lib/tarot';
// @ts-ignore
import tarotBackImage from '../../assets/tarot_back.png';

interface TarotCardViewProps {
      card?: TarotCard;
      isReversed?: boolean; // From DrawnCardDto
      position?: string; // From DrawnCardDto
      showName?: boolean;
      className?: string;
      onClick?: () => void;
      isFaceDown?: boolean;
}

const TarotCardView: React.FC<TarotCardViewProps> = ({
      card,
      isReversed = false,
      position,
      showName = true,
      className = '',
      onClick,
      isFaceDown = false
}) => {
      // If face down or no card provided, show back
      if (isFaceDown || !card) {
            return (
                  <div className={`flex flex-col items-center ${className}`} onClick={onClick}>
                        <div className="relative w-full h-full transition-transform duration-500 ease-out transform hover:scale-[1.02] cursor-pointer group perspective-1000">
                              {/* Card Container with Premium Border */}
                              <div className="w-full h-full rounded-xl bg-[#0a0a0f] relative overflow-hidden shadow-2xl border-[3px] border-[#b8860b] flex items-center justify-center">

                                    {/* Inner Gold Frame */}
                                    <div className="absolute inset-2 border border-[#b8860b]/50 rounded-lg z-10" />
                                    <div className="absolute inset-3 border border-[#b8860b]/30 rounded-lg z-10" />

                                    {/* Corner Accents */}
                                    <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-[#b8860b] z-20" />
                                    <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-[#b8860b] z-20" />
                                    <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-[#b8860b] z-20" />
                                    <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-[#b8860b] z-20" />

                                    {/* Galaxy/Glow Background Effect */}
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-[#0a0a0f] to-[#0a0a0f]" />

                                    {/* Central Mystic Eye */}
                                    <div className="relative z-20 flex flex-col items-center justify-center gap-2">
                                          <div className="relative">
                                                <div className="absolute inset-0 bg-[#b8860b] blur-xl opacity-20 animate-pulse" />
                                                <i className="fas fa-eye text-3xl md:text-4xl text-[#b8860b] drop-shadow-[0_0_10px_rgba(184,134,11,0.5)]"></i>
                                          </div>
                                          <span className="text-[10px] md:text-xs text-[#b8860b]/70 font-chakra uppercase tracking-[0.2em] animate-pulse">Tap to flip</span>
                                    </div>

                                    {/* Decorative Rotating Mandala (Subtle) */}
                                    <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                                          <i className="fas fa-sun text-[120px] text-[#b8860b] animate-spin-slow"></i>
                                    </div>
                              </div>
                        </div>
                  </div>
            );
      }

      // Rest of the logic for face-up card
      if (!card) return null; // Should be handled by isFaceDown check above, but safe to keep

      const imageUrl = (card.imagePath && card.imagePath.startsWith('http'))
            ? card.imagePath
            : (card.imagePath ? `http://localhost:8080${card.imagePath}` : 'https://placehold.co/300x500/1e1e2e/FFF?text=No+Image');

      return (
            <div className={`flex flex-col items-center ${className}`} onClick={onClick}>
                  <div className={`relative transition-transform duration-700 ease-in-out transform hover:scale-105 perspective-1000`}>
                        <div className={`group/card w-full h-auto rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] overflow-hidden border border-white/20 transition-all duration-500 hover:shadow-[0_0_30px_rgba(217,119,6,0.4)] relative ${isReversed ? 'rotate-180' : ''}`}>
                              {/* Reflection Overlay */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-700 pointer-events-none z-10" />
                              <img
                                    src={imageUrl}
                                    alt={card.nameKo}
                                    className="w-full h-full object-cover relative z-0"
                                    onError={(e) => {
                                          (e.target as HTMLImageElement).src = 'https://placehold.co/300x500/1e1e2e/FFF?text=Tarot+Card';
                                    }}
                              />
                        </div>
                        {/* Overlay for Reversed label if needed, or just visual rotation */}
                        {isReversed && (
                              <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded backdrop-blur-sm rotate-180">
                                    Reversed
                              </div>
                        )}

                        {/* Position badge if available */}
                        {position && (
                              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-amber-600 to-amber-700 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg z-10 uppercase tracking-[0.2em] border border-amber-400/50">
                                    {position}
                              </div>
                        )}
                  </div>

                  {showName && (
                        <div className="mt-6 text-center bg-black/60 backdrop-blur-md px-6 py-2 rounded-full border border-amber-500/20 shadow-xl inline-flex flex-col items-center min-w-[160px]">
                              <h3 className="text-lg md:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 to-white font-chakra">
                                    {card.nameKo}
                              </h3>
                              <p className="text-[10px] text-amber-500/50 font-chakra uppercase tracking-widest leading-tight">
                                    {card.nameEn} {isReversed ? '(Reversed)' : ''}
                              </p>
                        </div>
                  )}
            </div>
      );
};

export default TarotCardView;
