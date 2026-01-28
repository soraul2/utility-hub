import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const TarotLayout: React.FC = () => {
      return (
            <div className="min-h-screen bg-[#050816] text-slate-100 relative overflow-hidden font-sans">
                  {/* Background Effects */}
                  <div className="absolute inset-0 z-0">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-[#050816] to-[#050816]"></div>
                        <div className="absolute top-[20%] left-[20%] w-72 h-72 bg-purple-600/10 rounded-full blur-[100px]"></div>
                        <div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-blue-600/10 rounded-full blur-[100px]"></div>
                        {/* Stars (CSS or SVG can be added here, keeping it simple for now) */}
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col min-h-screen">
                        <header className="p-4 border-b border-white/10 backdrop-blur-md bg-black/20">
                              <div className="container mx-auto flex items-center justify-between">
                                    <Link to="/tarot" className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-200 to-blue-200" style={{ fontFamily: '"Chakra Petch", sans-serif' }}>
                                          Mystic Tarot
                                    </Link>
                                    <Link to="/" className="text-sm text-slate-400 hover:text-white transition-colors">
                                          <i className="fas fa-home mr-2"></i>메인으로
                                    </Link>
                              </div>
                        </header>

                        <main className="flex-grow container mx-auto p-4 md:p-8">
                              <Outlet />
                        </main>

                        <footer className="p-4 text-center text-slate-500 text-sm border-t border-white/5">
                              <p>© 2024 Mystic Tarot - AI Powered Reading</p>
                              <p className="text-xs mt-1 text-slate-600">이 리딩은 참고용 조언이며, 중요한 결정은 전문가와 상의하세요.</p>
                        </footer>
                  </div>
            </div>
      );
};

export default TarotLayout;
