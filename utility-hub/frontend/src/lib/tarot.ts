export type TarotTopic = 'LOVE' | 'MONEY' | 'CAREER' | 'HEALTH' | 'GENERAL';
export type UserGender = 'FEMALE' | 'MALE' | 'UNKNOWN';

export interface TarotCard {
      id: string;
      nameKo: string;
      nameEn: string;
      arcana: 'MAJOR' | 'MINOR';
      suit: 'WANDS' | 'CUPS' | 'SWORDS' | 'PENTACLES' | null;
      number: number;
      imagePath: string;
      keywords: string;
      uprightMeaning: string;
      reversedMeaning: string;
}

export interface DrawnCardDto {
      position: string;
      isReversed: boolean;
      cardInfo: TarotCard;
}

export interface DailyCardResponse {
      sessionId: number;
      card: DrawnCardDto;
      aiReading: string;
      createdAt: string;
}

export interface ThreeCardRequest {
      question: string;
      topic: TarotTopic;
      userName?: string;
      userAge?: number;
      userGender?: UserGender;
}

export interface ThreeCardResponse {
      sessionId: number;
      cards: DrawnCardDto[];
      aiReading: string;
      createdAt: string;
}

export const TAROT_TOPICS: { value: TarotTopic; label: string }[] = [
      { value: 'LOVE', label: '연애/관계' },
      { value: 'MONEY', label: '재물/금전' },
      { value: 'CAREER', label: '커리어/진로' },
      { value: 'HEALTH', label: '건강/컨디션' },
      { value: 'GENERAL', label: '기타/일반' },
];

export const TAROT_GENDERS: { value: UserGender; label: string }[] = [
      { value: 'FEMALE', label: '여성' },
      { value: 'MALE', label: '남성' },
      { value: 'UNKNOWN', label: '말하고 싶지 않음' },
];
