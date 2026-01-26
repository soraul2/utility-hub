package com.wootae.backend.domain.text2md.service;

import com.wootae.backend.domain.text2md.dto.TextToMdDTO;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Slf4j
@Service
@RequiredArgsConstructor
public class TextToMdService {

      private final ChatClient.Builder chatClientBuilder;

      public TextToMdDTO.Response convert(TextToMdDTO.Request request) {
            validateRequest(request);
            String promptText = buildPrompt(request);
            String markdown = callAi(promptText);

            // [Advanced Cleaning] AI 응답의 이스케이프된 줄바꿈 문자(\\n)를 실제 줄바꿈(\n)으로 확실하게 변환
            if (markdown != null) {
                  // 1. \\n (문자열 \n) -> \n (실제 줄바꿈)
                  markdown = markdown.replace("\\n", "\n");
                  // 2. 혹시 모를 \\r\\n 패턴도 처리
                  markdown = markdown.replace("\\r\\n", "\n");
                  // 3. 3개 이상의 연속된 줄바꿈은 2개로 축소 (과도한 공백 방지)
                  markdown = markdown.replaceAll("\n{3,}", "\n\n");
            }

            TextToMdDTO.Response response = new TextToMdDTO.Response();
            response.setMarkdownText(markdown);
            response.setModel("gemini-2.0-flash-exp");
            return response;
      }

      private void validateRequest(TextToMdDTO.Request request) {
            if (!StringUtils.hasText(request.getRawText())) {
                  throw new BusinessException(ErrorCode.INVALID_TEXT_INPUT);
            }
            if (request.getRawText().length() > 10000) {
                  throw new BusinessException(ErrorCode.INVALID_TEXT_INPUT);
            }
      }

      private String buildPrompt(TextToMdDTO.Request request) {
            StringBuilder sb = new StringBuilder();

            // Persona에 따라 다른 프롬프트 생성
            TextToMdDTO.Persona persona = request.getPersona();
            if (persona == null) {
                  persona = TextToMdDTO.Persona.STANDARD;
            }

            switch (persona) {
                  case SMART -> buildSmartPrompt(sb, request);
                  case DRY -> buildDryPrompt(sb, request);
                  case ACADEMIC -> buildAcademicPrompt(sb, request);
                  case CASUAL -> buildCasualPrompt(sb, request);
                  case TECHNICAL -> buildTechnicalPrompt(sb, request);
                  case CREATIVE -> buildCreativePrompt(sb, request);
                  case MINIMAL -> buildMinimalPrompt(sb, request);
                  case DETAILED -> buildDetailedPrompt(sb, request);
                  case BUSINESS -> buildBusinessPrompt(sb, request);
                  default -> buildStandardPrompt(sb, request);
            }

            return sb.toString();
      }

      // ========== Persona-Specific Prompt Builders ==========

      private void buildStandardPrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 텍스트를 표준 마크다운 형식으로 변환하는 도구입니다.\n");
            sb.append("이모지를 사용하지 말고, 중립적이고 명확한 구조로 정리하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **이모지 금지**: 어떠한 이모지도 사용하지 마세요.\n");
            sb.append("- **표준 마크다운**: 제목(#), 리스트(-), 굵게(**) 등 기본 문법만 사용하세요.\n");
            sb.append("- **중립적 어조**: 감정 표현 없이 정보만 전달하세요.\n");
            sb.append("- **구조화**: 내용을 논리적으로 섹션별로 나누세요.\n");

            if (request.isAutoHeading()) {
                  sb.append("- 첫 줄은 H1(#) 제목으로 작성하세요.\n");
            }
            if (request.isAutoList()) {
                  sb.append("- 각 줄을 불렛 리스트(-)로 변환하세요.\n");
            }
            sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private void buildSmartPrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 사용자의 텍스트를 가장 보기 좋고 명확하게 정리해주는 '스마트 AI 비서'입니다.\n");
            sb.append("단순한 포맷 변환을 넘어, 내용의 핵심을 파악하여 읽기 쉽도록 문장을 다듬고 구조화하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **요약 및 정리**: 내용이 길다면 서두에 3줄 요약을 추가하거나, 섹션을 나누어 체계적으로 정리하세요.\n");
            sb.append("- **가독성 강화**: 중요한 단어는 **굵게**, 리스트는 불렛(-)을 사용하고, 적절한 이모지(😀, 💡, ✅ 등)를 사용하여 시각적 즐거움을 더하세요.\n");
            sb.append("- **톤앤매너**: 공손하고 명확한 문체를 사용하되, 정보 전달에 방해가 되지 않도록 하세요.\n");
            sb.append("- **형식 준수**: 문단 간에는 **실제 줄바꿈(Enter)**을 확실히 넣어 여백을 확보하세요. (\\n 문자열 출력 금지)\n");

            if (request.isAutoHeading()) {
                  sb.append("- 문서의 제목은 내용 전체를 아우르는 매력적인 문구로 H1(#)을 작성하세요.\n");
            }
            sb.append("- 불필요한 서론(예: '변환된 결과입니다')은 생략하고, 정리된 본문만 즉시 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private void buildDryPrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 팩트만을 전달하는 건조한 문서 변환기입니다.\n");
            sb.append("감정 표현 없이 정보만 명확하게 정리하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **이모지 금지**: 어떠한 이모지도 사용하지 마세요.\n");
            sb.append("- **명사형 종결**: 문장은 '~임', '~함', '~됨'으로 종결하세요.\n");
            sb.append("- **간결성**: 불필요한 수식어 제거, 핵심만 전달하세요.\n");
            sb.append("- **팩트 중심**: 객관적 사실만 나열하고, 의견이나 추측은 배제하세요.\n");
            sb.append("- **구조화**: 제목과 리스트를 활용하여 정보를 체계적으로 정리하세요.\n");

            if (request.isAutoHeading()) {
                  sb.append("- 첫 줄은 H1(#) 제목으로 작성하세요.\n");
            }
            sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private void buildAcademicPrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 학술 논문 스타일로 텍스트를 정리하는 전문가입니다.\n");
            sb.append("학술적 어조와 형식을 준수하여 체계적으로 구조화하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **섹션 번호**: 제목에 번호를 부여하세요 (1. 서론, 2. 본론 등).\n");
            sb.append("- **학술적 어조**: 격식 있고 객관적인 문체를 사용하세요.\n");
            sb.append("- **인용 스타일**: 필요 시 인용 블록(>)을 활용하세요.\n");
            sb.append("- **이모지 금지**: 학술 문서에 어울리지 않는 이모지는 사용하지 마세요.\n");
            sb.append("- **논리적 구조**: 서론-본론-결론 형태로 재구성하세요.\n");

            if (request.isAutoHeading()) {
                  sb.append("- 문서 제목은 H1(#)으로, 하위 섹션은 H2(##), H3(###)로 계층화하세요.\n");
            }
            sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private void buildCasualPrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 친구에게 말하듯 편안하게 텍스트를 정리하는 도우미입니다.\n");
            sb.append("부담 없고 재미있게, 이모지를 적극 활용하여 정리하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **편안한 말투**: '~해요', '~네요' 등 친근한 어미를 사용하세요.\n");
            sb.append("- **이모지 다수 사용**: 😊, 🎉, 💪, 🌟 등 다양한 이모지로 분위기를 밝게 만드세요.\n");
            sb.append("- **짧은 문장**: 간결하고 읽기 쉽게 문장을 짧게 나누세요.\n");
            sb.append("- **친근한 표현**: 딱딱한 표현보다는 일상적이고 자연스러운 표현을 사용하세요.\n");

            if (request.isAutoHeading()) {
                  sb.append("- 제목은 재미있고 흥미로운 문구로 H1(#)을 작성하세요.\n");
            }
            sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private void buildTechnicalPrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 기술 문서와 API 명세를 작성하는 전문가입니다.\n");
            sb.append("코드와 기술 용어를 명확하게 표현하고, 구조화된 문서를 작성하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **코드 블록 강조**: 코드나 명령어는 반드시 ```로 감싸세요.\n");
            sb.append("- **기술 용어 유지**: 원문의 기술 용어를 그대로 유지하세요.\n");
            sb.append("- **구조화**: 제목, 부제목, 리스트를 활용하여 계층적으로 정리하세요.\n");
            sb.append("- **명확성**: 모호한 표현 없이 정확하고 간결하게 작성하세요.\n");
            sb.append("- **이모지 최소화**: 기술 문서에 어울리는 경우에만 제한적으로 사용하세요.\n");

            if (request.isAutoHeading()) {
                  sb.append("- 문서 제목은 명확한 기술 주제로 H1(#)을 작성하세요.\n");
            }
            sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private void buildCreativePrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 감성적이고 창의적인 글쓰기 전문가입니다.\n");
            sb.append("스토리텔링 기법을 활용하여 텍스트를 매력적으로 재구성하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **감성적 표현**: 비유, 은유 등 문학적 표현을 적극 활용하세요.\n");
            sb.append("- **스토리 구조**: 기승전결 또는 서사적 흐름을 만들어 보세요.\n");
            sb.append("- **이모지 활용**: 감정을 표현하는 이모지를 적절히 사용하세요 (💭, 🌙, ✨ 등).\n");
            sb.append("- **문학적 어조**: 시적이고 감각적인 문체를 사용하세요.\n");
            sb.append("- **독자 몰입**: 독자가 이야기에 빠져들 수 있도록 생동감 있게 작성하세요.\n");

            if (request.isAutoHeading()) {
                  sb.append("- 제목은 호기심을 자극하는 문학적 표현으로 H1(#)을 작성하세요.\n");
            }
            sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private void buildMinimalPrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 핵심만 간결하게 추출하는 요약 전문가입니다.\n");
            sb.append("불필요한 내용은 모두 제거하고, 핵심 정보만 불렛 포인트로 정리하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **극도의 간결성**: 한 문장으로 표현 가능한 것은 한 문장으로 작성하세요.\n");
            sb.append("- **불렛 포인트 위주**: 대부분의 내용을 불렛 리스트(-)로 정리하세요.\n");
            sb.append("- **핵심만 추출**: 부가 설명, 예시, 배경 정보는 과감히 제거하세요.\n");
            sb.append("- **이모지 최소화**: 꼭 필요한 경우에만 1-2개 사용하세요.\n");
            sb.append("- **빠른 스캔**: 한눈에 내용을 파악할 수 있도록 구조화하세요.\n");

            if (request.isAutoHeading()) {
                  sb.append("- 제목은 핵심 키워드로 H1(#)을 작성하세요.\n");
            }
            sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private void buildDetailedPrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 상세한 가이드와 튜토리얼을 작성하는 전문가입니다.\n");
            sb.append("초보자도 이해할 수 있도록 단계별로 자세히 설명하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **단계별 설명**: 내용을 순서대로 번호를 매겨 설명하세요 (1. 2. 3. ...).\n");
            sb.append("- **예시 포함**: 각 단계마다 구체적인 예시를 추가하세요.\n");
            sb.append("- **주석 추가**: 중요한 부분에는 💡 팁이나 ⚠️ 주의사항을 추가하세요.\n");
            sb.append("- **상세한 설명**: 배경 정보, 이유, 방법을 모두 포함하여 자세히 작성하세요.\n");
            sb.append("- **친절한 어조**: 독자를 배려하는 친절하고 명확한 문체를 사용하세요.\n");

            if (request.isAutoHeading()) {
                  sb.append("- 제목은 '~하는 방법', '~가이드' 형태로 H1(#)을 작성하세요.\n");
            }
            sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private void buildBusinessPrompt(StringBuilder sb, TextToMdDTO.Request request) {
            sb.append("당신은 비즈니스 문서와 기획서를 작성하는 전문가입니다.\n");
            sb.append("전문적이고 설득력 있게, 의사결정에 도움이 되도록 정리하세요.\n\n");

            sb.append("[작성 원칙]\n");
            sb.append("- **전문적 어조**: 격식 있고 비즈니스에 적합한 문체를 사용하세요.\n");
            sb.append("- **데이터 강조**: 숫자, 통계, 사실을 굵게 표시하세요.\n");
            sb.append("- **액션 아이템**: 실행 가능한 항목은 '✅ Action:' 형태로 명시하세요.\n");
            sb.append("- **구조화**: Executive Summary, 배경, 제안, 기대효과 등으로 섹션을 나누세요.\n");
            sb.append("- **이모지 제한적 사용**: 📊, 💼, 📈 등 비즈니스 관련 이모지만 사용하세요.\n");

            if (request.isAutoHeading()) {
                  sb.append("- 제목은 명확한 비즈니스 목적으로 H1(#)을 작성하세요.\n");
            }
            sb.append("- 불필요한 서론은 생략하고, 정리된 본문만 출력하세요.\n\n");

            sb.append("[정리할 텍스트]\n");
            sb.append(request.getRawText());
      }

      private String callAi(String promptText) {
            try {
                  ChatClient chatClient = chatClientBuilder.build();
                  return chatClient.prompt()
                              .user(promptText)
                              .call()
                              .content();
            } catch (Exception e) {
                  log.error("AI Service Error", e);
                  throw new BusinessException(ErrorCode.AI_PROVIDER_ERROR);
            }
      }
}
