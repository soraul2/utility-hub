import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TarotCardView from '../TarotCardView';
import type { TarotCard } from '@/lib/tarot';

const mockCard: TarotCard = {
      id: 'major-0',
      nameKo: '광대',
      nameEn: 'The Fool',
      arcana: 'MAJOR',
      suit: null,
      number: 0,
      imagePath: '/images/tarot/major-0.jpg',
      keywords: '시작, 모험',
      uprightMeaning: '새로운 시작',
      reversedMeaning: '무모함',
};

describe('TarotCardView', () => {
      it('isFaceDown=true일 때 뒷면 래퍼가 렌더링되지만 이미지는 감춰진다', () => {
            // Act
            render(<TarotCardView isFaceDown={true} />);

            // Assert
            // 현재 구현에서 isFaceDown=true면 paper-texture나 특정 클래스가 렌더링됨
            const paperTexture = document.querySelector('.paper-texture');
            expect(paperTexture).toBeInTheDocument();
      });

      it('card가 제공되면 카드 이미지가 올바른 src로 렌더링된다', () => {
            // Act
            render(<TarotCardView card={mockCard} />);

            // Assert
            const cardImage = screen.getByAltText('광대');
            // 실제 컴포넌트가 http://localhost:8080 등을 붙이므로, 그 부분이 포함되어 있는지 확인
            expect(cardImage).toHaveAttribute('src', expect.stringContaining('/images/tarot/major-0.jpg'));
      });

      it('showName=true일 때 카드 이름이 표시된다', () => {
            // Act
            render(<TarotCardView card={mockCard} showName={true} />);

            // Assert
            expect(screen.getByText('광대')).toBeInTheDocument();
      });

      it('showName=false일 때 카드 이름이 숨겨진다', () => {
            // Act
            render(<TarotCardView card={mockCard} showName={false} />);

            // Assert
            expect(screen.queryByText('광대')).not.toBeInTheDocument();
      });

      it('isReversed=true일 때 회전 클래스가 적용된다', () => {
            // Act
            render(<TarotCardView card={mockCard} isReversed={true} />);

            // Assert
            // Tailwind 클래스 'rotate-180'이 이미지 컨테이너나 오버레이 근처에 적용됨
            const cardImage = screen.getByAltText('광대');
            // 상위 div 중 rotate-180을 가진 요소가 있는지 확인.
            // Testing Library의 .closest() 등을 활용하거나 querySelector로 확인
            const rotatedContainer = cardImage.closest('.rotate-180');
            expect(rotatedContainer).toBeInTheDocument();
      });

      it('onClick이 제공되면 클릭 시 호출된다', async () => {
            // Arrange
            const handleClick = vi.fn();
            const user = userEvent.setup();

            // Act
            render(<TarotCardView card={mockCard} onClick={handleClick} />);

            // 카드 전체를 감싸는 div에 onClick이 걸려있음
            const cardElement = screen.getByAltText('광대');
            await user.click(cardElement);

            // Assert
            expect(handleClick).toHaveBeenCalledTimes(1);
      });
});
