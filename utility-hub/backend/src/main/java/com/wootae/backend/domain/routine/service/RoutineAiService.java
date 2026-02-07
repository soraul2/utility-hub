package com.wootae.backend.domain.routine.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.wootae.backend.domain.routine.dto.AiArrangeResult;
import com.wootae.backend.domain.routine.dto.AiTaskArrangement;
import com.wootae.backend.domain.routine.entity.Task;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.extern.slf4j.Slf4j;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class RoutineAiService {

      private final ChatClient chatClient;
      private final ObjectMapper objectMapper;

      public RoutineAiService(ChatClient.Builder chatClientBuilder, ObjectMapper objectMapper) {
            this.chatClient = chatClientBuilder.build();
            this.objectMapper = objectMapper;
      }

      public AiArrangeResult arrangeTasks(
                  List<Task> existingUnassigned,
                  List<Task> alreadyScheduled,
                  String additionalTaskText,
                  int startHour, int endHour,
                  String mode) {

            String prompt = buildPrompt(existingUnassigned, alreadyScheduled, additionalTaskText, startHour, endHour, mode);

            log.info("AI arrange request: {} unassigned tasks, {} scheduled tasks, additionalText={}",
                        existingUnassigned.size(), alreadyScheduled.size(),
                        additionalTaskText != null && !additionalTaskText.isBlank());

            String aiResponse;
            try {
                  aiResponse = chatClient.prompt()
                              .user(prompt)
                              .call()
                              .content();
            } catch (Exception e) {
                  log.error("AI arrange call failed: {}", e.getMessage());
                  throw new BusinessException(ErrorCode.AI_ARRANGE_FAILED);
            }

            log.debug("AI arrange raw response: {}", aiResponse);

            return parseResponse(aiResponse);
      }

      private String buildPrompt(List<Task> unassigned, List<Task> scheduled,
                  String additionalText, int startHour, int endHour, String mode) {

            String effectiveMode = (mode != null) ? mode : "BASIC";

            StringBuilder sb = new StringBuilder();

            // Mode-specific intro
            switch (effectiveMode) {
                  case "NEUROSCIENCE":
                        sb.append("당신은 뇌과학 기반 스케줄링 AI입니다. 울트라디안 리듬과 인지 부하 이론에 따라 배치합니다.\n");
                        break;
                  case "DEEP_WORK":
                        sb.append("당신은 딥워크 전문 스케줄링 AI입니다. 오전 집중 블록을 최대화하고 깊은 작업 시간을 확보합니다.\n");
                        break;
                  case "POMODORO":
                        sb.append("당신은 포모도로 전문 스케줄링 AI입니다. 25분 작업 + 5분 휴식 단위로 태스크를 분할하여 배치합니다.\n");
                        break;
                  default:
                        sb.append("당신은 일일 계획 스케줄링 AI입니다. 태스크 목록과 시간 범위를 받아 최적의 시간을 배정합니다.\n");
                        break;
            }
            sb.append("반드시 JSON 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요.\n\n");

            // Time range
            sb.append("[시간 범위]\n");
            sb.append(String.format("시작: %02d:00, 종료: %02d:00\n\n", startHour, endHour));

            // Already scheduled tasks (fixed)
            if (!scheduled.isEmpty()) {
                  sb.append("[이미 배정된 태스크 — 이동 불가, 이 시간대는 비워두세요]\n");
                  for (Task t : scheduled) {
                        sb.append(String.format("- \"%s\" %s-%s\n",
                                    t.getTitle(),
                                    t.getStartTime() != null ? t.getStartTime().toString() : "?",
                                    t.getEndTime() != null ? t.getEndTime().toString() : "?"));
                  }
                  sb.append("\n");
            }

            // Unassigned tasks from inventory
            if (!unassigned.isEmpty()) {
                  sb.append("[배정할 태스크 — 인벤토리]\n");
                  int idx = 1;
                  for (Task t : unassigned) {
                        sb.append(String.format("%d. id:%d \"%s\" %d분 %s %s\n",
                                    idx++,
                                    t.getId(),
                                    t.getTitle(),
                                    t.getDurationMinutes() != null ? t.getDurationMinutes() : 60,
                                    t.getCategory() != null ? t.getCategory() : "PERSONAL",
                                    t.getPriority() != null ? t.getPriority() : "MEDIUM"));
                  }
                  sb.append("\n");
            }

            // Additional tasks from text
            if (additionalText != null && !additionalText.isBlank()) {
                  sb.append("[배정할 태스크 — 추가 입력 (자유 텍스트, 파싱 필요)]\n");
                  sb.append(additionalText.trim());
                  sb.append("\n\n");
                  sb.append("위 텍스트에서 태스크명과 소요시간을 추출하세요. ");
                  sb.append("소요시간이 명시되지 않으면 60분으로 설정하세요. ");
                  sb.append("카테고리와 우선순위도 내용에 맞게 추론하세요.\n\n");
            }

            // Shared rules + mode-specific rules
            sb.append("[규칙]\n");
            sb.append("1. 15분 단위로 스냅 (09:00, 09:15, 09:30, 09:45 등)\n");
            sb.append("2. 이미 배정된 태스크와 시간이 겹치지 않도록\n");
            sb.append("3. 12:00-13:00은 점심 시간으로 비워두기\n");
            sb.append("4. 총 소요시간이 가용 시간을 초과하면 우선순위 낮은 태스크를 뒤로\n");

            switch (effectiveMode) {
                  case "NEUROSCIENCE":
                        sb.append("5. 울트라디안 리듬 적용: 90분 집중 블록 + 20분 휴식을 반복 (90-20-90-20 패턴)\n");
                        sb.append("6. 인지 부하가 높은 태스크(HIGH priority, WORK/STUDY)는 오전 첫 90분 블록에 배치\n");
                        sb.append("7. 주의력 저하 구간(14:00-15:30)에는 가벼운 태스크(LOW priority, PERSONAL/HEALTH) 배치\n");
                        sb.append("8. 각 90분 블록 내에서는 비슷한 카테고리를 묶어 컨텍스트 스위칭 최소화\n");
                        sb.append("9. 20분 휴식 시간에는 태스크를 배치하지 않음 (뇌의 회복 시간)\n");
                        sb.append("10. 하루의 마지막 블록에는 정리/리뷰 성격의 태스크 배치\n\n");
                        break;
                  case "DEEP_WORK":
                        sb.append("5. 오전 시간대(시작~12:00)에 2-4시간의 연속된 딥워크 블록을 먼저 확보\n");
                        sb.append("6. 딥워크 블록에는 HIGH priority + WORK/STUDY 카테고리 태스크만 배치, 중간에 휴식 없음\n");
                        sb.append("7. 딥워크 블록 내 태스크 사이에는 휴식을 넣지 않고 연속 배치\n");
                        sb.append("8. 딥워크 블록 종료 후 30분 휴식\n");
                        sb.append("9. 오후 시간대에 나머지 태스크(MEDIUM/LOW, PERSONAL/HEALTH)를 15분 간격으로 배치\n");
                        sb.append("10. 가능하면 오후에 짧은 2차 딥워크 블록(60-90분)을 추가 배치\n\n");
                        break;
                  case "POMODORO":
                        sb.append("5. 포모도로 기법 적용: 25분 작업 + 5분 휴식을 1세트로 반복\n");
                        sb.append("6. 4세트(약 2시간) 완료 후 15-30분의 긴 휴식 삽입\n");
                        sb.append("7. 소요시간이 25분 이상인 태스크는 25분 단위로 분할하여 여러 포모도로 세션에 배치\n");
                        sb.append("8. 25분 미만의 짧은 태스크는 하나의 포모도로 세션에 묶어서 배치\n");
                        sb.append("9. HIGH 우선순위 태스크를 오전 첫 포모도로 세트에 배치\n");
                        sb.append("10. 5분 휴식 시간에는 태스크를 배치하지 않음\n\n");
                        break;
                  default: // BASIC
                        sb.append("5. HIGH 우선순위 태스크는 오전/집중 시간대(아침~낮)에 배정\n");
                        sb.append("6. 태스크 사이에 15분 휴식 시간 포함\n");
                        sb.append("7. 비슷한 카테고리는 가능하면 연속 배치\n\n");
                        break;
            }

            // Output format
            sb.append("[응답 형식 — 반드시 아래 JSON만 반환, 다른 텍스트 금지]\n");
            sb.append("{\n");
            sb.append("  \"reasoning\": \"전체 배치 전략에 대한 간결한 설명 (2~3문장)\",\n");
            sb.append("  \"arrangements\": [\n");
            sb.append("    {\n");
            sb.append("      \"existingTaskId\": 123,\n");
            sb.append("      \"title\": \"태스크명\",\n");
            sb.append("      \"category\": \"WORK\",\n");
            sb.append("      \"priority\": \"HIGH\",\n");
            sb.append("      \"durationMinutes\": 120,\n");
            sb.append("      \"startTime\": \"10:00:00\",\n");
            sb.append("      \"endTime\": \"12:00:00\",\n");
            sb.append("      \"reason\": \"이 시간대에 배치한 이유 (1문장)\"\n");
            sb.append("    }\n");
            sb.append("  ]\n");
            sb.append("}\n\n");
            sb.append("- existingTaskId: 인벤토리 태스크는 위의 id 값 사용, 추가 입력 태스크는 null\n");
            sb.append("- category: WORK, PERSONAL, HEALTH, STUDY 중 하나\n");
            sb.append("- priority: HIGH, MEDIUM, LOW 중 하나\n");
            sb.append("- startTime/endTime: HH:mm:ss 형식\n");
            sb.append("- reasoning: 전체 배치 전략을 요약한 설명\n");
            sb.append("- reason: 각 태스크를 해당 시간에 배치한 이유\n");

            return sb.toString();
      }

      private AiArrangeResult parseResponse(String response) {
            try {
                  String json = extractJson(response);
                  JsonNode root = objectMapper.readTree(json);
                  JsonNode arrangements = root.get("arrangements");
                  if (arrangements == null || !arrangements.isArray()) {
                        throw new BusinessException(ErrorCode.AI_ARRANGE_FAILED);
                  }
                  List<AiTaskArrangement> list = objectMapper.convertValue(arrangements,
                              new TypeReference<List<AiTaskArrangement>>() {
                              });
                  String reasoning = root.has("reasoning") ? root.get("reasoning").asText() : null;
                  return new AiArrangeResult(reasoning, list);
            } catch (BusinessException e) {
                  throw e;
            } catch (Exception e) {
                  log.error("Failed to parse AI response: {}", e.getMessage());
                  log.debug("Raw response: {}", response);
                  throw new BusinessException(ErrorCode.AI_ARRANGE_FAILED);
            }
      }

      private String extractJson(String response) {
            if (response == null || response.isBlank()) {
                  throw new BusinessException(ErrorCode.AI_ARRANGE_FAILED);
            }

            // Try to extract from ```json ... ``` code block
            Pattern codeBlockPattern = Pattern.compile("```(?:json)?\\s*\\n?(\\{[\\s\\S]*?})\\s*```");
            Matcher codeBlockMatcher = codeBlockPattern.matcher(response);
            if (codeBlockMatcher.find()) {
                  return codeBlockMatcher.group(1);
            }

            // Try to find raw JSON object
            int firstBrace = response.indexOf('{');
            int lastBrace = response.lastIndexOf('}');
            if (firstBrace >= 0 && lastBrace > firstBrace) {
                  return response.substring(firstBrace, lastBrace + 1);
            }

            // Return as-is and let Jackson handle it
            return response;
      }
}
