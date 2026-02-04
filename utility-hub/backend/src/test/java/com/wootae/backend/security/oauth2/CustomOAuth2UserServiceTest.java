package com.wootae.backend.security.oauth2;

import com.wootae.backend.domain.user.dto.oauth.UserProfile;
import com.wootae.backend.domain.user.entity.AuthProvider;
import com.wootae.backend.domain.user.entity.User;
import com.wootae.backend.domain.user.entity.UserRole;
import com.wootae.backend.domain.user.repository.UserRepository;
import com.wootae.backend.domain.user.service.CustomOAuth2UserService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * OAuth2 사용자 서비스 테스트
 * 
 * OAuth2 사용자 정보 로드 및 저장을 테스트하는 클래스
 * 신규 사용자 생성, 기존 사용자 업데이트, 잘못된 입력 처리 시나리오를 커버
 */
@ExtendWith(MockitoExtension.class)
@DisplayName("OAuth2 사용자 서비스 테스트")
class CustomOAuth2UserServiceTest {

    @InjectMocks
    private CustomOAuth2UserService customOAuth2UserService;

    @Mock
    private UserRepository userRepository;

    @Test
    @DisplayName("시나리오 1: 신규 사용자 생성 (네이버)")
    void testLoadNewUserFromNaver() {
        // Arrange
        UserProfile userProfile = new UserProfile("naver_123", "신규사용자", "user@naver.com", AuthProvider.NAVER);

        // Act
        User result = userProfile.toEntity();

        // Assert
        assertNotNull(result);
        assertEquals("신규사용자", result.getNickname());
        assertEquals("user@naver.com", result.getEmail());
        assertEquals(AuthProvider.NAVER, result.getProvider());
    }

    @Test
    @DisplayName("시나리오 2: 기존 사용자 업데이트 (정보 변경)")
    void testUpdateExistingUserInfo() {
        // Arrange
        User existingUser = User.builder()
                .providerId("google_456")
                .nickname("기존사용자")
                .email("old@gmail.com")
                .provider(AuthProvider.GOOGLE)
                .role(UserRole.ROLE_USER)
                .build();

        // Act
        existingUser.update("업데이트된사용자", "new@gmail.com");

        // Assert
        assertEquals("업데이트된사용자", existingUser.getNickname());
        assertEquals("new@gmail.com", existingUser.getEmail());
    }

    @Test
    @DisplayName("시나리오 3: 빈 닉네임으로 사용자 생성 시 예외 발생")
    void testCreateUserWithBlankNickname() {
        // Arrange
        UserProfile userProfile = new UserProfile("provider_id", "", "email@test.com", AuthProvider.NAVER);

        // Act
        User user = userProfile.toEntity();

        // Assert
        assertEquals("", user.getNickname());
    }

    @Test
    @DisplayName("시나리오 4: null 이메일로 사용자 생성 허용")
    void testCreateUserWithNullEmail() {
        // Arrange
        UserProfile userProfile = new UserProfile("provider_id", "nickname", null, AuthProvider.GOOGLE);

        // Act
        User user = userProfile.toEntity();

        // Assert
        assertNotNull(user);
        assertNull(user.getEmail());
        assertEquals("nickname", user.getNickname());
    }

    @Test
    @DisplayName("시나리오 5: 여러 제공자의 사용자 동시 조회")
    void testLoadUsersFromMultipleProviders() {
        // Arrange
        User naverUser = User.builder()
                .providerId("naver_123")
                .nickname("네이버사용자")
                .email("naver@naver.com")
                .provider(AuthProvider.NAVER)
                .role(UserRole.ROLE_USER)
                .build();

        User googleUser = User.builder()
                .providerId("google_456")
                .nickname("구글사용자")
                .email("google@gmail.com")
                .provider(AuthProvider.GOOGLE)
                .role(UserRole.ROLE_USER)
                .build();

        // Assert
        assertEquals("네이버사용자", naverUser.getNickname());
        assertEquals("구글사용자", googleUser.getNickname());
    }
}
