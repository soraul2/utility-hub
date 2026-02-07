import { format } from 'date-fns';
import { MOOD_CONFIG } from '../../../lib/constants/routine';

interface MiniSparklineProps {
      data: { rating: number; mood: string; date: string }[];
}

const MiniSparkline = ({ data }: MiniSparklineProps) => {
      if (data.length < 2) return null;
      const labelW = 22;
      const padR = 8;
      const padY = 6;
      const viewW = 400, viewH = 120;
      const maxR = 5, minR = 1;
      const chartW = viewW - labelW - padR;
      const chartH = viewH - padY * 2;

      const points = data.map((d, i) => ({
            x: labelW + (i / (data.length - 1)) * chartW,
            y: padY + chartH - ((d.rating - minR) / (maxR - minR)) * chartH
      }));
      const pathD = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ');
      const areaD = pathD + ` L${points[points.length - 1].x},${viewH - padY} L${labelW},${viewH - padY} Z`;

      const yLines = [1, 2, 3, 4, 5].map(r => ({
            rating: r,
            y: padY + chartH - ((r - minR) / (maxR - minR)) * chartH
      }));

      return (
            <svg viewBox={`0 0 ${viewW} ${viewH}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                  <defs>
                        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.25" />
                              <stop offset="100%" stopColor="#818cf8" stopOpacity="0.02" />
                        </linearGradient>
                  </defs>
                  {/* Y-axis grid + labels */}
                  {yLines.map(({ rating, y }) => (
                        <g key={rating}>
                              <line x1={labelW} y1={y} x2={viewW - padR} y2={y}
                                    stroke="currentColor" strokeOpacity={rating % 2 === 1 ? 0.12 : 0.06} strokeWidth="1" strokeDasharray="4,4" />
                              <text x={labelW - 5} y={y + 4} textAnchor="end"
                                    className="fill-gray-400 dark:fill-gray-500" fontSize="11" fontWeight="700">
                                    {rating}
                              </text>
                        </g>
                  ))}
                  {/* Area + Line */}
                  <path d={areaD} fill="url(#sparkGrad)" />
                  <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Data points + labels */}
                  {points.map((p, i) => (
                        <g key={i}>
                              <circle cx={p.x} cy={p.y} r="5"
                                    fill={MOOD_CONFIG[data[i].mood]?.chartColor || '#6366f1'}
                                    stroke="white" strokeWidth="2" />
                              <text x={p.x} y={viewH - padY + 13} textAnchor="middle"
                                    className="fill-gray-400 dark:fill-gray-500" fontSize="10" fontWeight="600">
                                    {data[i].date ? format(new Date(data[i].date), 'M/d') : ''}
                              </text>
                        </g>
                  ))}
            </svg>
      );
};

export default MiniSparkline;
