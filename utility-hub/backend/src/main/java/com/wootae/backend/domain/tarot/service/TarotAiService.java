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
@RequiredArgsConstructor
public class TarotAiService {

      private final ChatClient.Builder chatClientBuilder;

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
            context.append("2. 카드들 간의 관계를 파악하여 전체적인 흐름을 해석하세요.\n");
            context.append("3. 질문자에게 따뜻하면서도 신비로운 조언을 건네며 마무리하세요.\n");
            context.append("4. 답변은 한국어로 정중하게 작성하세요.");

            ChatClient chatClient = chatClientBuilder.build();
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
            context.append("2. 오늘 하루를 어떻게 보내면 좋을지 구체적인 행동 조언을 제공하세요.\n");
            context.append("3. 답변은 한국어로 정중하고 신비로운 어조로 작성하세요.");

            ChatClient chatClient = chatClientBuilder.build();
            String aiResponse = chatClient.prompt()
                        .user(context.toString())
                        .call()
                        .content();

            log.info("Generated daily tarot reading for card: {}", info.getNameEn());
            return aiResponse;
      }
}
