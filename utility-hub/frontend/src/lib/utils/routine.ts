/**
 * 완료율에 따른 Tailwind 색상 클래스 반환
 */
export function getCompletionRateColor(rate: number): {
      text: string;
      gradient: string;
      bar: string;
} {
      if (rate >= 80) {
            return {
                  text: 'text-emerald-600 dark:text-emerald-400',
                  gradient: 'bg-gradient-to-r from-emerald-500 to-green-400',
                  bar: 'bg-gradient-to-r from-emerald-400 to-green-400',
            };
      }
      if (rate >= 50) {
            return {
                  text: 'text-amber-600 dark:text-amber-400',
                  gradient: 'bg-gradient-to-r from-amber-500 to-yellow-400',
                  bar: 'bg-gradient-to-r from-amber-400 to-yellow-400',
            };
      }
      return {
            text: 'text-rose-600 dark:text-rose-400',
            gradient: 'bg-gradient-to-r from-rose-500 to-red-400',
            bar: 'bg-gradient-to-r from-rose-400 to-red-400',
      };
}

/**
 * 시간 문자열(HH:mm:ss)을 분으로 변환
 */
export function timeToMinutes(timeStr?: string): number {
      if (!timeStr) return 0;
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
}

/**
 * 분을 HH:mm 형태 문자열로 변환
 */
export function minutesToTimeStr(totalMinutes: number): string {
      const h = Math.floor(totalMinutes / 60);
      const m = totalMinutes % 60;
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Priority에 따른 bar 색상 클래스 반환
 */
export function getPriorityBarColor(priority?: string): string {
      if (priority === 'HIGH') return 'bg-red-500';
      if (priority === 'MEDIUM') return 'bg-amber-500';
      return 'bg-blue-400';
}
