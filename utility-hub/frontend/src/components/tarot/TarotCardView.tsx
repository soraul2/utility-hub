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
                              <div className="w-full h-full rounded-xl bg-[#0a0a0f] relative overflow-hidden shadow-2xl border-[3px] border-amber-900/50 flex items-center justify-center">
                                    {/* Paper Texture Overlay (Requirement 3: Material) */}
                                    <div className="paper-texture" />

                                    {/* Esoteric Background Pattern (Requirement 1 & 2) */}
                                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                                          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_#b8860b22_0%,_transparent_70%)]" />
                                          {/* Symmetrical Grid lines */}
                                          <div className="absolute inset-x-0 top-1/2 h-[1px] bg-amber-500/20" />
                                          <div className="absolute inset-y-0 left-1/2 w-[1px] bg-amber-500/20" />
                                          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border border-amber-500/10 rounded-full" />
                                    </div>

                                    {/* Premium Double Border (Material Feel) - Using Gold Foil */}
                                    <div className="absolute inset-1.5 border-[1.5px] border-transparent gold-foil-border rounded-[10px] z-10 opacity-70" />
                                    <div className="absolute inset-2 border border-amber-900/40 rounded-[9px] z-10" />

                                    {/* Perfect Symmetry: Corner Accents (Vintage Overlay) */}
                                    {[
                                          "top-2 left-2",
                                          "top-2 right-2",
                                          "bottom-2 left-2",
                                          "bottom-2 right-2"
                                    ].map((pos, i) => (
                                          <div key={i} className={`absolute ${pos} w-6 h-6 z-20`}>
                                                <div className={`absolute inset-0 border-transparent gold-foil-border ${pos.includes('top') ? 'border-t-2' : 'border-b-2'} ${pos.includes('left') ? 'border-l-2' : 'border-r-2'} rounded-sm opacity-80`} />
                                                <div className="absolute inset-[3px] border border-amber-900/40 opacity-50" />
                                          </div>
                                    ))}

                                    {/* Symmetrical Middle Icons (Requirement 1: Secretive Symmetry) */}
                                    <div className="absolute inset-y-8 left-1/2 -translate-x-1/2 flex flex-col justify-between items-center z-20 opacity-40">
                                          <i className="fas fa-star text-[8px] text-amber-500"></i>
                                          <i className="fas fa-star text-[8px] text-amber-500"></i>
                                    </div>

                                    {/* Central Mandala (Main Esoteric Pattern) */}
                                    <div className="relative z-20 flex items-center justify-center">
                                          {/* Outer Rotating layer */}
                                          <div className="absolute w-32 h-32 border border-amber-500/10 rounded-full animate-spin-slow" />

                                          {/* Core Symmetrical Design */}
                                          <div className="relative w-24 h-24 flex items-center justify-center">
                                                <div className="absolute inset-0 bg-amber-900/20 rounded-full blur-xl animate-pulse" />
                                                <div className="relative">
                                                      <i className="fas fa-circle-notch text-5xl gold-foil-text drop-shadow-[0_0_15px_rgba(184,134,11,0.4)]"></i>
                                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                                            <i className="fas fa-eye text-xl gold-foil-text animate-blink"></i>
                                                      </div>
                                                </div>
                                                {/* Symmetrical Orbitals */}
                                                <div className="absolute inset-[-10px] border border-dashed border-amber-500/30 rounded-full animate-spin-reverse" style={{ animationDuration: '20s' }} />
                                          </div>
                                    </div>

                                    {/* Symmetrical Side Markers */}
                                    <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 flex justify-between items-center z-10 opacity-20">
                                          <div className="w-1 h-8 bg-gradient-to-b from-transparent via-fcf6ba to-transparent" />
                                          <div className="w-1 h-8 bg-gradient-to-b from-transparent via-fcf6ba to-transparent" />
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
