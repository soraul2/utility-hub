package com.wootae.backend.domain.text2md.controller;

import com.wootae.backend.domain.text2md.dto.TextToMdDTO;
import com.wootae.backend.domain.text2md.service.TextToMdService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Text to Markdown", description = "텍스트를 마크다운 형식으로 변환하는 API")
@RestController
@RequestMapping("/api/text-to-md")
@RequiredArgsConstructor
public class TextToMdController {

      private final TextToMdService textToMdService;

      @Operation(summary = "텍스트 → 마크다운 변환", description = "원본 텍스트를 AI를 사용해 마크다운 형식으로 변환합니다.")
      @PostMapping
      public ResponseEntity<TextToMdDTO.Response> convert(
                  @RequestBody @Valid TextToMdDTO.Request request) {
            TextToMdDTO.Response response = textToMdService.convert(request);
            return ResponseEntity.ok(response);
      }
}
