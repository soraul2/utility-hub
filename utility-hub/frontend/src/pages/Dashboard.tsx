import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { GlassInput } from '../components/ui/GlassInput';
import classNames from 'classnames';

interface Tool {
      id: string;
      name: string;
      description: string;
      icon: string;
      to: string;
      color: string;
}

const tools: Tool[] = [
      {
            id: 'pomodoro',
            name: '뽀모도로 타이머',
            description: '집중력을 높이는 강력한 타이머',
            icon: 'fa-regular fa-clock',
            to: '/tools/pomodoro',
            color: 'from-orange-400 to-red-500'
      },
      {
            id: 'mulching-film',
            name: '멀칭 비닐 계산기',
            description: '농업용 비닐 소요량 자동 계산',
            icon: 'fa-solid fa-seedling',
            to: '/tools/mulching-film',
            color: 'from-green-400 to-emerald-600'
      },
      {
            id: 'text-to-md',
            name: '텍스트 변환기',
            description: '깔끔한 마크다운 문서 생성',
            icon: 'fa-brands fa-markdown',
            to: '/tools/text-to-md',
            color: 'from-blue-400 to-indigo-600'
      },
      {
            id: 'phone-cost',
            name: '휴대폰 요금 계산기',
            description: '합리적인 통신비 선택을 위한 계산기',
            icon: 'fa-solid fa-coins',
            to: '/tools/phone-cost',
            color: 'from-yellow-400 to-amber-600'
      },
      {
            id: 'mystic-tarot',
            name: '미스틱 타로',
            description: 'AI와 함께하는 신비로운 타로 리딩',
            icon: 'fa-solid fa-moon',
            to: '/tarot',
            color: 'from-fuchsia-500 to-purple-600'
      },
      {
            id: 'routine-hub',
            name: '루틴 허브',
            description: '계획과 회고로 완성하는 나만의 루틴',
            icon: 'fa-solid fa-calendar-check',
            to: '/routine',
            color: 'from-teal-400 to-cyan-600'
      }
];

const Dashboard: React.FC = () => {
      const [searchTerm, setSearchTerm] = useState('');

      const filteredTools = tools.filter(tool =>
            tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            tool.description.toLowerCase().includes(searchTerm.toLowerCase())
      );

      return (
            <div className="py-8">
                  <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight">
                              Utility Hub
                        </h1>
                        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto mb-8">
                              생산성, 농업, 문서화를 위한 도구 모음.
                        </p>

                        <div className="max-w-md mx-auto">
                              <GlassInput
                                    placeholder="도구 검색..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    suffix={<i className="fa-solid fa-search"></i>}
                                    className="pl-5"
                              />
                        </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredTools.map(tool => (
                              <Link key={tool.id} to={tool.to} className="group block">
                                    <GlassCard className="h-full hover:scale-105 hover:bg-white/60 dark:hover:bg-gray-800/60 cursor-pointer">
                                          <div className={classNames(
                                                'w-16 h-16 rounded-2xl flex items-center justify-center text-3xl text-white shadow-lg mb-6',
                                                'bg-gradient-to-br', tool.color
                                          )}>
                                                <i className={tool.icon}></i>
                                          </div>
                                          <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                                                {tool.name}
                                          </h3>
                                          <p className="text-gray-600 dark:text-gray-400">
                                                {tool.description}
                                          </p>
                                          <div className="mt-6 flex items-center text-sm font-bold text-gray-400 group-hover:text-gray-800 dark:group-hover:text-white transition-colors">
                                                실행하기 <i className="fa-solid fa-arrow-right ml-2 transition-transform group-hover:translate-x-1"></i>
                                          </div>
                                    </GlassCard>
                              </Link>
                        ))}
                  </div>

                  {filteredTools.length === 0 && (
                        <div className="text-center py-20 opacity-50">
                              <p className="text-xl">검색 결과가 없습니다.</p>
                        </div>
                  )}
            </div>
      );
};

export default Dashboard;
