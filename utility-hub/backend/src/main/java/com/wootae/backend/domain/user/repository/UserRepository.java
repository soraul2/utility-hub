package com.wootae.backend.domain.user.repository;

import com.wootae.backend.domain.user.entity.AuthProvider;
import com.wootae.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

/**
 * 사용자 엔티티 Repository
 * 
 * [개선] 주석 추가로 메서드 목적 명확화
 */
public interface UserRepository extends JpaRepository<User, Long> {
      /**
       * 제공자와 제공자별 사용자 ID로 사용자 조회
       * @param provider 소셜 제공자 (NAVER, GOOGLE)
       * @param providerId 제공자별 사용자 ID
       * @return 조회된 사용자
       */
      Optional<User> findByProviderAndProviderId(AuthProvider provider, String providerId);

      /**
       * 이메일로 사용자 조회
       * @param email 사용자 이메일
       * @return 조회된 사용자
       */
      Optional<User> findByEmail(String email);
}
