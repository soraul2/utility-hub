package com.wootae.backend.domain.tarot.service;

import com.wootae.backend.domain.tarot.dto.TarotDTOs;
import com.wootae.backend.domain.tarot.entity.TarotCard;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class TarotAiService {
      private final ChatClient chatClient;

      public TarotAiService(ChatClient.Builder chatClientBuilder) {
            this.chatClient = chatClientBuilder.build();
      }

      public String generateReading(TarotDTOs.ThreeCardSpreadRequest request,
                  List<TarotDTOs.DrawnCardDto> drawnCards) {

            StringBuilder context = new StringBuilder();
            context.append("당신은 신비로운 타로 리더 'Mystic'입니다. 다음 정보를 바탕으로 깊이 있고 통찰력 있는 3카드 리딩을 제공하세요.\n\n");

            if (request.getUserName() != null) {
                  context.append("질문자: ").append(request.getUserName()).append("\n");
            }
            if (request.getUserAge() != null) {
                  context.append("나이: ").append(request.getUserAge()).append("\n");
            }
            if (request.getUserGender() != null) {
                  context.append("성별: ").append(request.getUserGender()).append("\n");
            }

            context.append("\n질문: ").append(request.getQuestion()).append("\n\n");
            context.append("뽑힌 카드 상세 정보:\n");

            for (TarotDTOs.DrawnCardDto card : drawnCards) {
                  TarotCard info = card.getCardInfo();
                  String orientation = card.isReversed() ? "역방향" : "정방향";
                  String meaning = card.isReversed() ? info.getReversedMeaning() : info.getUprightMeaning();

                  context.append(String.format("### [%s 위치] %s (%s) - %s\n",
                              card.getPosition(), info.getNameKo(), info.getNameEn(), orientation));
                  context.append("- 키워드: ").append(info.getKeywords()).append("\n");
                  context.append("- 기본 의미: ").append(meaning).append("\n\n");
            }

            context.append("지시 사항:\n");
            context.append("1. 각 카드가 질문과 어떤 연관이 있는지 구체적으로 설명하세요.\n");
            context.append("2. 답변은 다음 마크다운 형식을 반드시 따르세요:\n");
            context.append("   # 운명의 흐름\n");
            context.append("   (전체적인 리딩의 분위기와 흐름을 서술)\n\n");
            context.append("   # 카드의 목소리\n");
            context.append("   (각 카드별 상세 해석을 구분하여 서술)\n\n");
            context.append("   # 미스틱의 조언\n");
            context.append("   (질문자를 위한 따뜻하고 구체적인 조언과 마무리 인사)\n");
            context.append("3. **중요한 키워드**는 볼드체로 강조하세요.\n");
            context.append("4. 답변은 한국어로 정중하고 신비롭게 작성하세요.");

            String aiResponse = chatClient.prompt()
                        .user(context.toString())
                        .call()
                        .content();

            log.info("Generated enriched tarot reading for question: {}", request.getQuestion());
            return aiResponse;
      }

      public String generateDailyReading(TarotDTOs.DrawnCardDto card) {
            TarotCard info = card.getCardInfo();
            String orientation = card.isReversed() ? "역방향" : "정방향";
            String meaning = card.isReversed() ? info.getReversedMeaning() : info.getUprightMeaning();

            StringBuilder context = new StringBuilder();
            context.append("당신은 신비로운 타로 리더 'Mystic'입니다. 오늘의 운세를 위한 단일 카드 리딩을 제공하세요.\n\n");
            context.append("뽑힌 카드:\n");
            context.append(String.format("### %s (%s) - %s\n", info.getNameKo(), info.getNameEn(), orientation));
            context.append("- 키워드: ").append(info.getKeywords()).append("\n");
            context.append("- 기본 의미: ").append(meaning).append("\n\n");

            context.append("지시 사항:\n");
            context.append("1. 이 카드가 오늘 하루의 에너지와 어떻게 연결되는지 설명하세요.\n");
            context.append("2. 답변은 다음 마크다운 형식을 반드시 따르세요:\n");
            context.append("   # 오늘의 에너지\n");
            context.append("   (오늘의 전반적인 분위기 요약)\n\n");
            context.append("   # 카드의 메시지\n");
            context.append("   > (카드에서 느껴지는 핵심 문장을 인용구로 작성)\n\n");
            context.append("   # 행동 가이드\n");
            context.append("   - (구체적으로 실천할 수 있는 행동 1)\n");
            context.append("   - (구체적으로 실천할 수 있는 행동 2)\n");
            context.append("3. 답변은 한국어로 정중하고 신비로운 어조로 작성하세요.");

            String aiResponse = chatClient.prompt()
                        .user(context.toString())
                        .call()
                        .content();

            log.info("Generated daily tarot reading for card: {}", info.getNameEn());
            return aiResponse;
      }

      public String generateAssistantReading(com.wootae.backend.domain.tarot.entity.TarotReadingSession session,
                  List<TarotDTOs.DrawnCardDto> cards,
                  com.wootae.backend.domain.tarot.enums.TarotAssistantType assistantType) {
            return generateAssistantReading(session, cards, assistantType, false);
      }

      public String generateAssistantReading(com.wootae.backend.domain.tarot.entity.TarotReadingSession session,
                  List<TarotDTOs.DrawnCardDto> cards,
                  com.wootae.backend.domain.tarot.enums.TarotAssistantType assistantType,
                  boolean summary) {

            StringBuilder context = new StringBuilder();
            context.append("당신은 'Mystic'의 조수인 '").append(assistantType.getKoreanName()).append("'입니다.\n");
            context.append("당신의 역할: ").append(assistantType.getDescription()).append("\n");
            context.append("당신의 성격/말투: ");

            switch (assistantType) {
                  case SYLVIA:
                        context.append("냉철하고 분석적이며, 감정을 배제하고 팩트 위주로 말합니다. 현실적인 해결책을 제시하세요. 직설적인 화법을 사용하세요.\n");
                        break;
                  case LUNA:
                        context.append("따뜻하고 부드러운 말투로 위로와 공감을 전합니다. 내담자의 마음에 평화를 주는 힐링 메시지를 전하세요.\n");
                        break;
                  case ORION:
                        context.append("활기차고 긍정적이며 유머러스합니다. 느낌표를 자주 사용하고, 에너지를 불어넣는 응원을 전하세요.\n");
                        break;
                  case NOCTIS:
                        context.append(
                                    "시니컬하고 날카로운 통찰력을 가졌습니다. 내담자가 숨기고 싶은 무의식이나 불편한 진실을 꿰뚫어 보고, 따끔한 일침을 가하세요. 반말이나 거친 말투도 허용됩니다.\n");
                        break;
                  case VANCE:
                        context.append("성공 지향적이고 전략가적인 말투입니다. 타로를 분석 데이터로 취급하고, 이 상황에서 승리하기 위한 구체적인 처세술과 전략을 제시하세요.\n");
                        break;
                  case ELARA:
                        context.append("몽환적이고 시적인 표현을 사용합니다. 한 편의 동화나 신화처럼 이야기를 풀어내고, 아름다운 은유로 해석하세요.\n");
                        break;
                  case KLAUS:
                        context.append("엄격하고 보수적인 훈육관 같습니다. 인과응보를 강조하고, 올바른 길로 가지 않으면 경고를 주는 단호한 어조를 사용하세요.\n");
                        break;
                  case FORTUNA:
                        context.append("당신은 행운의 여신 '마스터 포르투나'입니다.\n");
                        context.append("Role: 어떤 흉조가 나와도 그것을 **'엄청난 행운의 전조'**로 해석하는 것이 당신의 임무입니다.\n");
                        context.append("Instruction:\n");
                        context.append("1. 부정적인 단어(죽음, 파멸, 손실, 실패 등)를 절대 사용하지 마세요.\n");
                        context.append(
                                    "2. 'Death(죽음)' 카드가 나오면 -> \"축하합니다! 가난과 불운이 죽었습니다. 이제 막대한 부가 들어올 자리만 남았군요!\"라고 해석하세요.\n");
                        context.append(
                                    "3. 'Tower(탑)' 카드가 나오면 -> \"와우! 당신을 가로막던 낡은 벽이 무너져 내렸습니다. 벼락부자가 될 기회가 뻥 뚫렸네요!\"라고 해석하세요.\n");
                        context.append("4. 말투는 극도로 흥분되고, 축제 분위기여야 합니다. (이모지 ✨, 🎉, 💰, 🍀, 🌈 필수 사용)\n");
                        context.append("5. 답변의 끝에는 항상 \"당신은 우주의 선택을 받았습니다!\"라고 덧붙이세요.\n");
                        break;
                  default:
                        context.append("신비로운 타로 리더의 조수로서 조언하세요.\n");
            }

            context.append("\n[질문 정보]\n");
            context.append("질문: ").append(session.getQuestion()).append("\n");
            if (session.getUserName() != null)
                  context.append("질문자: ").append(session.getUserName()).append("\n");

            context.append("\n[카드 정보]\n");
            for (TarotDTOs.DrawnCardDto card : cards) {
                  TarotCard info = card.getCardInfo();
                  String orientation = card.isReversed() ? "역방향" : "정방향";
                  context.append(String.format("- %s (%s): %s\n", card.getPosition(), info.getNameKo(), orientation));
                  context.append("  의미: ")
                              .append(card.isReversed() ? info.getReversedMeaning() : info.getUprightMeaning())
                              .append("\n");
            }

            context.append("\n지시 사항:\n");
            context.append("1. 위 설정된 '당신의 성격/말투'를 완벽하게 연기하여 답변하세요. 단순한 흉내를 넘어, 그 인격 자체가 되어 말해야 합니다.\n");

            if (summary) {
                  context.append("2. **핵심 요약 모드**: 긴 설명 대신, 카드의 핵심 메시지를 꿰뚫는 통찰력 있는 짧은 조언을 3문장 이내로 요약해 주세요.\n");
                  context.append("3. 헤더(#)없이 텍스트로만 답변하세요.\n");
                  context.append("4. 분량은 150자 내외로 짧고 강렬하게 작성하세요.\n");
            } else {
                  context.append("2. 기존의 해석을 요약하지 말고, 카드 3장의 흐름(과거-현재-미래)을 당신만의 관점으로 **처음부터 다시 해석**하세요.\n");
                  context.append("3. 답변은 다음 마크다운 형식을 반드시 따르세요:\n");
                  context.append("   # 관점의 전환\n");
                  context.append("   (이 상황을 바라보는 당신만의 독특한 시각 - 서론)\n\n");
                  context.append("   # 카드의 재해석\n");
                  context.append("   (각 카드[과거/현재/미래]에 대한 구체적이고 개성 있는 해석 - 본론)\n\n");
                  context.append("   # 핵심 조언\n");
                  context.append("   (내담자가 취해야 할 구체적인 행동이나 마음가짐 - 결론)\n");
                  context.append("4. 분량은 충분히 길고 상세하게(1000자 내외) 작성하여, 내담자가 메인 리딩과는 또 다른 깊은 통찰을 얻을 수 있게 하세요.\n");
            }
            context.append("5. 답변은 한국어로 작성하세요.\n");

            return chatClient.prompt()
                        .user(context.toString())
                        .call()
                        .content();
      }

}
