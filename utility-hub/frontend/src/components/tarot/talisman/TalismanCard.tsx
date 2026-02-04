import { forwardRef } from 'react';
import classNames from 'classnames';

export type TalismanTheme = 'MYSTIC' | 'ORION' | 'LUNA' | 'SYLVIA' | 'NOCTIS' | 'FORTUNA' | 'ELARA' | 'VANCE' | 'KLAUS';

interface TalismanCardProps {
      userName: string;
      wishText: string;
      assistantType?: TalismanTheme;
      tarotKeyword?: string;
      scale?: number;
      cardImageUrl?: string;
}

const BLESSING_CONFIG: Record<TalismanTheme, string> = {
      MYSTIC: "진실의 빛이 그대와 함께하길",
      SYLVIA: "현명한 지혜가 성공을 부를지니",
      LUNA: "달빛의 가호가 그대를 감싸안길",
      ORION: "찬란한 태양의 행운이 함께하길",
      NOCTIS: "심연의 끝에서 진정한 빛을 찾으라",
      VANCE: "전략적인 수로 승리를 쟁취하라",
      ELARA: "꿈결 같은 축복이 별처럼 내리길",
      KLAUS: "정당한 노력이 합당한 보답을 받기를",
      FORTUNA: "전능한 우주의 기적이 쏟아지길",
};

// Unique Signature Styles for each Professional Persona
const SIGNATURE_STYLE: Record<TalismanTheme, { fontFamily: string; fontSize: number; rotate: string; color: string; fontWeight?: string }> = {
      MYSTIC: { fontFamily: "'Pinyon Script', cursive", fontSize: 28, rotate: '-3deg', color: 'text-amber-200/60' },
      SYLVIA: { fontFamily: "'Caveat', cursive", fontSize: 26, rotate: '-1deg', color: 'text-slate-300/60', fontWeight: 'bold' },
      LUNA: { fontFamily: "'Dancing Script', cursive", fontSize: 24, rotate: '-2deg', color: 'text-blue-100/60', fontWeight: 'bold' },
      ORION: { fontFamily: "'Pacifico', cursive", fontSize: 22, rotate: '-4deg', color: 'text-yellow-100/60' },
      NOCTIS: { fontFamily: "'Rock Salt', cursive", fontSize: 16, rotate: '-6deg', color: 'text-purple-200/60' },
      FORTUNA: { fontFamily: "'Great Vibes', cursive", fontSize: 32, rotate: '-3deg', color: 'text-amber-400/60' },
      ELARA: { fontFamily: "'Shadows Into Light', cursive", fontSize: 24, rotate: '-2deg', color: 'text-rose-100/60', fontWeight: 'bold' },
      VANCE: { fontFamily: "'Mr Dafoe', cursive", fontSize: 30, rotate: '-4deg', color: 'text-emerald-100/60' },
      KLAUS: { fontFamily: "'Grand Hotel', cursive", fontSize: 28, rotate: '-1deg', color: 'text-gray-200/60' },
};

const INSCRIPTION_STYLE = {
      color: '#FFFFFF',
      textShadow: '0 0 5px rgba(255, 255, 255, 0.4), 0 0 10px rgba(184, 134, 11, 0.1)',
      letterSpacing: '0.45em',
      fontWeight: 300,
};

export const TalismanCard = forwardRef<HTMLDivElement, TalismanCardProps>(
      ({ userName, wishText, assistantType = 'MYSTIC', scale = 1, cardImageUrl }, ref) => {
            const blessing = BLESSING_CONFIG[assistantType] || BLESSING_CONFIG['MYSTIC'];
            const sig = SIGNATURE_STYLE[assistantType] || SIGNATURE_STYLE['MYSTIC'];
            const formattedName = userName.slice(-1).match(/[가-힣]/) ? `${userName}님` : userName;

            return (
                  <div
                        ref={ref}
                        className="relative overflow-hidden flex flex-col items-center justify-start"
                        style={{
                              width: `${360 * scale}px`,
                              height: `${640 * scale}px`,
                              backgroundColor: '#050505',
                              fontFamily: "'Nanum Myeongjo', serif"
                        }}
                  >
                        {/* Google Fonts Import for Signatures */}
                        <style>
                              {`
            @import url('https://fonts.googleapis.com/css2?family=Caveat:wght@400;700&family=Dancing+Script:wght@700&family=Great+Vibes&family=Pacifico&family=Pinyon+Script&family=Rock+Salt&family=Shadows+Into+Light&family=Mr+Dafoe&family=Grand+Hotel&display=swap');
          `}
                        </style>

                        {/* 1. Background Image */}
                        {cardImageUrl && (
                              <div className="absolute inset-0 z-0">
                                    <img
                                          src={cardImageUrl}
                                          alt="Background"
                                          className="w-full h-full object-cover brightness-[0.55] contrast-[1.05]"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-black/60" />
                              </div>
                        )}

                        {/* 2. Top Header */}
                        <div className="pt-12 z-20 text-center px-4 w-full">
                              <p
                                    className="text-[14px] tracking-[0.9em] text-white/50 uppercase leading-relaxed font-serif"
                                    style={{ fontSize: `${14 * scale}px` }}
                              >
                                    {assistantType}
                              </p>
                              <div className="mt-1 mx-auto w-16 h-[0.5px] bg-white/20" />
                        </div>

                        <div className="flex-1" />

                        {/* 3. Content Area */}
                        <div className="relative z-20 w-full px-12 pb-24 flex flex-col items-center gap-14">
                              <div className="absolute top-0 w-full h-[120%] bg-black/70 blur-[65px] rounded-full pointer-events-none -z-10 transform translate-y-[-40px]" />

                              {/* A. The Wish */}
                              <div className="relative text-center">
                                    <p
                                          className="break-keep text-white leading-loose font-bold"
                                          style={{
                                                ...INSCRIPTION_STYLE,
                                                fontSize: `${18 * scale}px`,
                                                lineHeight: 1.8
                                          }}
                                    >
                                          {wishText}
                                    </p>
                                    <div className="mt-5 flex flex-col items-center opacity-[0.15]">
                                          <div className="w-16 h-[0.5px] bg-white" />
                                    </div>
                              </div>

                              {/* B. The Blessing & Real Signature */}
                              <div className="text-center">
                                    <p className="text-[11px] text-white/40 tracking-widest font-serif mb-3 opacity-80">
                                          {formattedName}에게,
                                    </p>

                                    <p className="text-[14px] text-amber-100/70 tracking-wide font-serif italic leading-relaxed break-keep px-2 mb-6">
                                          "{blessing}"
                                    </p>

                                    {/* Unique Signature Section */}
                                    <div className="flex flex-col items-center">
                                          <p
                                                className={classNames("italic select-none", sig.color)}
                                                style={{
                                                      fontFamily: sig.fontFamily,
                                                      fontSize: `${sig.fontSize * scale}px`,
                                                      transform: `rotate(${sig.rotate})`,
                                                      fontWeight: sig.fontWeight || 'normal',
                                                      textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
                                                }}
                                          >
                                                {assistantType}
                                          </p>
                                          <p className="text-[6.5px] text-white/20 tracking-[0.4em] uppercase mt-2">
                                                {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                          </p>
                                    </div>
                              </div>
                        </div>

                        {/* 4. Corner Ornaments */}
                        <div className="absolute inset-5 z-40 pointer-events-none opacity-[0.08]">
                              <div className="absolute top-0 left-0 w-5 h-5 border-t border-l border-white" />
                              <div className="absolute top-0 right-0 w-5 h-5 border-t border-r border-white" />
                              <div className="absolute bottom-0 left-0 w-5 h-5 border-b border-l border-white" />
                              <div className="absolute bottom-0 right-0 w-5 h-5 border-b border-r border-white" />
                        </div>
                  </div>
            );
      }
);

TalismanCard.displayName = 'TalismanCard';
