import { useState, useCallback } from 'react';
import type { TarotTopic, UserGender } from '../lib/tarot';

export interface ThreeCardFormState {
      question: string;
      topic: TarotTopic;
      userName: string;
      userAge: string;
      userGender: UserGender | '';
}

export interface ThreeCardFormActions {
      setQuestion: (value: string) => void;
      setTopic: (value: TarotTopic) => void;
      setUserName: (value: string) => void;
      setUserAge: (value: string) => void;
      setUserGender: (value: UserGender | '') => void;
      resetForm: () => void;
}

const initialState: ThreeCardFormState = {
      question: '',
      topic: 'GENERAL',
      userName: '',
      userAge: '',
      userGender: '',
};

export const useThreeCardForm = (): ThreeCardFormState & ThreeCardFormActions => {
      const [question, setQuestion] = useState(initialState.question);
      const [topic, setTopic] = useState<TarotTopic>(initialState.topic);
      const [userName, setUserName] = useState(initialState.userName);
      const [userAge, setUserAge] = useState(initialState.userAge);
      const [userGender, setUserGender] = useState<UserGender | ''>(initialState.userGender);

      const resetForm = useCallback(() => {
            setQuestion(initialState.question);
            setTopic(initialState.topic);
            setUserName(initialState.userName);
            setUserAge(initialState.userAge);
            setUserGender(initialState.userGender);
      }, []);

      return {
            question,
            topic,
            userName,
            userAge,
            userGender,
            setQuestion,
            setTopic,
            setUserName,
            setUserAge,
            setUserGender,
            resetForm,
      };
};
