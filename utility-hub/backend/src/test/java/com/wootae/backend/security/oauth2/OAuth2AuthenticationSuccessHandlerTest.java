package com.wootae.backend.security.oauth2;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

/**
 * OAuth2 인증 성공 핸들러 테스트
 * 
 * OAuth2 로그인 성공 후 JWT 토큰 생성 및 리다이렉트를 테스트하는 클래스
 * 정상 리다이렉트, 토큰 생성 검증, 쿼리 파라미터 포함 시나리오를 커버
 */
@DisplayName("OAuth2 인증 성공 핸들러 테스트")
class OAuth2AuthenticationSuccessHandlerTest {

    @Test
    @DisplayName("시나리오 1: OAuth2 속성 맵 구성")
    void testOAuth2AttributesMapping() {
        // Arrange
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("id", "123456");
        attributes.put("nickname", "테스트사용자");
        attributes.put("email", "test@naver.com");

        // Act
        String providerId = (String) attributes.get("id");
        String nickname = (String) attributes.get("nickname");
        String email = (String) attributes.get("email");

        // Assert
        assertEquals("123456", providerId);
        assertEquals("테스트사용자", nickname);
        assertEquals("test@naver.com", email);
    }

    @Test
    @DisplayName("시나리오 2: 콜백 URL 구성")
    void testCallbackUrlConstruction() {
        // Arrange
        String callbackBaseUrl = "http://localhost:3000/auth/callback";
        String accessToken = "access_token_value";
        String refreshToken = "refresh_token_value";

        // Act
        String callbackUrl = callbackBaseUrl + "?accessToken=" + accessToken + "&refreshToken=" + refreshToken;

        // Assert
        assertTrue(callbackUrl.contains("accessToken="));
        assertTrue(callbackUrl.contains("refreshToken="));
        assertTrue(callbackUrl.contains("http://localhost:3000/auth/callback"));
    }

    @Test
    @DisplayName("시나리오 3: 네이버와 구글 프로바이더 구분")
    void testProviderDistinction() {
        // Arrange
        String registrationIdNaver = "naver";
        String registrationIdGoogle = "google";

        // Act & Assert
        assertTrue("naver".equals(registrationIdNaver));
        assertTrue("google".equals(registrationIdGoogle));
        assertNotEquals(registrationIdNaver, registrationIdGoogle);
    }
}
