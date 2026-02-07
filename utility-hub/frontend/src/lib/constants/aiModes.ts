export type AiScheduleMode = 'BASIC' | 'NEUROSCIENCE' | 'DEEP_WORK' | 'POMODORO';

export interface AiModeConfig {
      value: AiScheduleMode;
      label: string;
      icon: string;
      description: string;
}

export const AI_MODE_OPTIONS: AiModeConfig[] = [
      {
            value: 'BASIC',
            label: 'Basic',
            icon: '⚡',
            description: '우선순위와 카테고리를 기반으로 균등하게 배치합니다.',
      },
      {
            value: 'NEUROSCIENCE',
            label: '뇌과학',
            icon: '🧬',
            description: '90분 집중 + 20분 휴식의 울트라디안 리듬으로 배치합니다.',
      },
      {
            value: 'DEEP_WORK',
            label: '딥워크',
            icon: '🎯',
            description: '오전에 2-4시간 연속 집중 블록을 확보합니다.',
      },
      {
            value: 'POMODORO',
            label: '포모도로',
            icon: '🍅',
            description: '25분 작업 + 5분 휴식 단위로 잘게 분할하여 배치합니다.',
      },
];

export const DEFAULT_AI_MODE: AiScheduleMode = 'BASIC';
