import type { TarotAssistantType } from './tarot';

export interface AssistantInfo {
  type: TarotAssistantType | 'MYSTIC';
  name: string;
  title: string;
  desc: string;
  image: string;
  introQuote: string;
  confirmBtn: string;
  cancelBtn: string;
}

export const ASSISTANTS: AssistantInfo[] = [
  {
    type: 'SYLVIA',
    name: '실비아',
    title: '냉철한 분석가',
    desc: '팩트 중심의 현실적인 조언',
    image: '/assets/tarot/assistants/silvia.png',
    introQuote: "감정을 배제하고 오직 논리와 이성으로만 분석하겠습니다. 달콤한 거짓말보다는 차가운 진실을 들을 준비가 되셨습니까?",
    confirmBtn: "진실을 들려줘",
    cancelBtn: "아직은 무서워"
  },
  {
    type: 'LUNA',
    name: '루나',
    title: '다정한 치유자',
    desc: '마음을 어루만지는 위로',
    image: '/assets/tarot/assistants/luna.png',
    introQuote: "마음이 많이 다치셨군요... 제 따뜻한 달빛으로 당신의 상처를 어루만져 드려도 될까요? 아프지 않게 말씀드릴게요.",
    confirmBtn: "응, 위로가 필요해",
    cancelBtn: "아니, 괜찮아"
  },
  {
    type: 'ORION',
    name: '오리온',
    title: '쾌활한 예언가',
    desc: '긍정 에너지와 유머',
    image: '/assets/tarot/assistants/orion.png',
    introQuote: "어두운 표정 짓지 마! 태양은 언제나 다시 뜨니까. 내가 네 운명에서 가장 빛나는 부분을 찾아줄게. 갈 준비 됐어?",
    confirmBtn: "가자! 에너지 충전!",
    cancelBtn: "조금 부담스러워"
  },
  {
    type: 'NOCTIS',
    name: '녹티스',
    title: '그림자 독설가',
    desc: '뼈 때리는 직설 화법',
    image: '/assets/tarot/assistants/noctis.png',
    introQuote: "당신조차 모르는 당신의 무의식... 그 깊은 심연을 들여다볼 용기가 있는가? 내가 보는 진실은 다소 어둡고 날카로울 것이다.",
    confirmBtn: "심연을 마주할게",
    cancelBtn: "다음에 볼게"
  },
  {
    type: 'VANCE',
    name: '반스',
    title: '야망의 전략가',
    desc: '성공을 위한 구체적 전략',
    image: '/assets/tarot/assistants/vance.png',
    introQuote: "운명은 기다리는 게 아니라 쟁취하는 것입니다. 이 판을 뒤집고 승리할 수 있는 확실한 전략을 원하십니까? 승리의 수를 알려드리죠.",
    confirmBtn: "전략을 알려줘",
    cancelBtn: "그냥 흘러갈래"
  },
  {
    type: 'ELARA',
    name: '엘라라',
    title: '몽환의 시인',
    desc: '감성적인 은유와 표현',
    image: '/assets/tarot/assistants/elara.png',
    introQuote: "현실의 경계 너머, 꿈속의 이야기를 들려드릴게요. 별들이 속삭이는 운명의 시를 함께 들어보시겠어요?",
    confirmBtn: "꿈을 꾸고 싶어",
    cancelBtn: "현실에 있을래"
  },
  {
    type: 'KLAUS',
    name: '클라우스',
    title: '엄격한 규율자',
    desc: '원칙 중심의 단호한 경고',
    image: '/assets/tarot/assistants/klaus.png',
    introQuote: "모든 결과에는 원인이 있는 법. 당신이 지은 업보와 마주할 시간이다. 핑계 댈 생각 말고, 내 심판을 받아들이겠나?",
    confirmBtn: "심판을 받아들인다",
    cancelBtn: "너무 무거워"
  },
];

export const HIDDEN_ASSISTANT: AssistantInfo = {
  type: 'FORTUNA',
  name: '마스터 포르투나',
  title: '행운의 여신',
  desc: '무조건적인 축복과 행운',
  image: '/assets/tarot/assistants/fortuna.png',
  introQuote: "어머나! 저를 찾으셨군요? 이건 우연이 아니에요. 당신에게 쏟아질 기적 같은 행운을 지금 바로 축복해 드릴게요! 준비되셨나요?",
  confirmBtn: "기적을 받을게! ✨",
  cancelBtn: ""
};

export const MYSTIC_INFO: AssistantInfo = {
  type: 'MYSTIC',
  name: 'Mystic',
  title: '운명의 관찰자',
  desc: '정석적인 타로 리딩',
  image: '/assets/tarot/assistants/mystic.png',
  introQuote: "운명의 흐름을 읽는 자로서, 당신의 질문에 담긴 진실만을 전하겠습니다. 허상 없는 가장 투명한 거울을 마주할 준비가 되셨습니까?",
  confirmBtn: "진실을 보여줘",
  cancelBtn: "아직 준비 안 됐어"
};
