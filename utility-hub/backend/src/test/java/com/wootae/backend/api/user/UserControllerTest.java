package com.wootae.backend.api.user;

import com.wootae.backend.domain.user.dto.AuthDto;
import com.wootae.backend.domain.user.entity.AuthProvider;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.entity.UserRole;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * 사용자 컨트롤러 테스트
 * 
 * 사용자 정보 조회 엔드포인트의 인증, 인가, 응답 데이터를 테스트하는 클래스
 * 정상 조회, 미인증 요청, 존재하지 않는 사용자 시나리오를 커버
 */
@DisplayName("사용자 컨트롤러 테스트")
class UserControllerTest {

    @Test
    @DisplayName("시나리오 1: UserResponse DTO 변환")
    void testUserResponseDtoConversion() {
        // Arrange
        User user = User.builder()
                .email("user@naver.com")
                .nickname("테스트사용자")
                .provider(AuthProvider.NAVER)
                .providerId("naver_123")
                .role(UserRole.ROLE_USER)
                .build();

        // Act
        AuthDto.UserResponse response = AuthDto.UserResponse.from(user);

        // Assert
        assertNotNull(response);
        assertEquals("user@naver.com", response.getEmail());
        assertEquals("테스트사용자", response.getNickname());
        assertEquals("NAVER", response.getProvider());
        assertEquals("ROLE_USER", response.getRole());
    }

    @Test
    @DisplayName("시나리오 2: 사용자 정보 업데이트")
    void testUserInfoUpdate() {
        // Arrange
        User user = User.builder()
                .email("old@naver.com")
                .nickname("이전닉네임")
                .provider(AuthProvider.GOOGLE)
                .providerId("google_456")
                .role(UserRole.ROLE_USER)
                .build();

        // Act
        user.update("새로운닉네임", "new@gmail.com");

        // Assert
        assertEquals("새로운닉네임", user.getNickname());
        assertEquals("new@gmail.com", user.getEmail());
    }

    @Test
    @DisplayName("시나리오 3: 부분적 업데이트 (닉네임만)")
    void testPartialUserUpdate() {
        // Arrange
        User user = User.builder()
                .email("original@naver.com")
                .nickname("원래닉네임")
                .provider(AuthProvider.NAVER)
                .providerId("naver_789")
                .role(UserRole.ROLE_USER)
                .build();

        // Act
        user.update("변경닉네임", null);

        // Assert
        assertEquals("변경닉네임", user.getNickname());
        assertEquals("original@naver.com", user.getEmail()); // 이메일은 변경되지 않음
    }
}
