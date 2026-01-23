/**
 * 멀칭 비닐 계산 로직
 * 
 * 이 모듈은 농업용 멀칭 비닐 계산기의 핵심 비즈니스 로직을 포함합니다.
 * UI 컴포넌트와 분리하여 테스트 가능성과 재사용성을 높였습니다.
 */

/** 평(坪)을 제곱미터로 변환하는 상수 */
export const PYEONG_TO_M2 = 3.305785;

/**
 * 멀칭 비닐 계산 입력 데이터
 */
export interface MulchingInput {
      /** 밭의 면적 (평) */
      fieldAreaPyeong: number;
      /** 비닐 폭 (cm) */
      mulchWidthCm: number;
      /** 비닐 길이 (m) */
      mulchLengthM: number;
      /** 롤당 가격 (원) */
      pricePerRollWon: number;
}

/**
 * 멀칭 비닐 계산 결과
 */
export interface MulchingResult {
      /** 필요한 롤 수 (원값) */
      requiredRolls: number;
      /** 필요한 롤 수 (소수 둘째 자리 반올림) */
      requiredRollsRounded: number;
      /** 예상 비용 (원) - 올림 처리된 롤 수 기준 */
      estimatedCostWon: number;
      /** 밭 전체 면적 (㎡) */
      fieldAreaM2: number;
      /** 한 롤당 커버 가능 면적 (㎡) */
      areaPerRollM2: number;
}

/**
 * 입력값 유효성 검증
 * 
 * @param input - 검증할 입력 데이터
 * @returns 유효하면 true, 그렇지 않으면 false
 */
export function validateMulchingInput(input: Partial<MulchingInput>): boolean {
      const { fieldAreaPyeong, mulchWidthCm, mulchLengthM, pricePerRollWon } = input;

      return !!(
            fieldAreaPyeong && fieldAreaPyeong > 0 &&
            mulchWidthCm && mulchWidthCm > 0 &&
            mulchLengthM && mulchLengthM > 0 &&
            pricePerRollWon !== undefined && pricePerRollWon >= 0
      );
}

/**
 * 멀칭 비닐 필요량 및 비용 계산
 * 
 * 계산 공식:
 * 1. 밭 전체 면적(㎡) = 면적(평) × 3.305785
 * 2. 한 롤당 면적(㎡) = 비닐 폭(m) × 비닐 길이(m)
 * 3. 필요 롤 수 = 밭 전체 면적 ÷ 한 롤당 면적
 * 4. 예상 비용 = 올림(필요 롤 수) × 롤당 가격
 * 
 * @param input - 계산에 필요한 입력 데이터
 * @returns 계산 결과
 * @throws {Error} 입력값이 유효하지 않은 경우
 */
export function calculateMulching(input: MulchingInput): MulchingResult {
      if (!validateMulchingInput(input)) {
            throw new Error('Invalid input: All values must be positive numbers');
      }

      const { fieldAreaPyeong, mulchWidthCm, mulchLengthM, pricePerRollWon } = input;

      // 1. 밭 전체 면적 계산 (평 → ㎡)
      const fieldAreaM2 = fieldAreaPyeong * PYEONG_TO_M2;

      // 2. 비닐 폭을 미터로 변환
      const mulchWidthM = mulchWidthCm / 100;

      // 3. 한 롤당 커버 가능 면적 계산
      const areaPerRollM2 = mulchWidthM * mulchLengthM;

      if (areaPerRollM2 === 0) {
            throw new Error('Roll area cannot be zero');
      }

      // 4. 필요한 롤 수 계산
      const requiredRolls = fieldAreaM2 / areaPerRollM2;
      const requiredRollsRounded = Number(requiredRolls.toFixed(2));

      // 5. 예상 비용 계산 (소수점 반올림된 롤 수 기준)
      const estimatedCostWon = requiredRollsRounded * pricePerRollWon;

      return {
            requiredRolls,
            requiredRollsRounded,
            estimatedCostWon,
            fieldAreaM2,
            areaPerRollM2,
      };
}

/**
 * 금액을 한국어 형식으로 포맷팅
 * 
 * @param amount - 포맷팅할 금액
 * @returns 포맷팅된 문자열 (예: "1,234,567원")
 */
export function formatWon(amount: number): string {
      return `${amount.toLocaleString()}원`;
}

/**
 * 금액을 한국어 간략 형식으로 포맷팅
 * 
 * @param amount - 포맷팅할 금액
 * @returns 포맷팅된 문자열 (예: "19만 원", "19만 5,000원")
 */
export function formatWonSimple(amount: number): string {
      const flooredAmount = Math.floor(amount);
      if (flooredAmount < 10000) return formatWon(flooredAmount);

      const units = ['', '만', '억', '조', '경'];
      let result = '';
      let temp = flooredAmount;

      for (let i = 0; i < units.length; i++) {
            const part = temp % 10000;
            if (part > 0) {
                  const partStr = i === 0
                        ? part.toLocaleString()
                        : part.toLocaleString() + units[i];

                  result = result ? `${partStr} ${result}` : partStr;
            }
            temp = Math.floor(temp / 10000);
            if (temp === 0) break;
      }

      return result + '원';
}
