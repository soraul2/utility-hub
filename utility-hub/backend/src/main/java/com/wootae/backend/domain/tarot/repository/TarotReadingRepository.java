package com.wootae.backend.domain.tarot.repository;

import com.wootae.backend.domain.tarot.entity.TarotReadingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TarotReadingRepository extends JpaRepository<TarotReadingSession, Long> {
      // 기본 제공되는 JpaRepository의 CRUD 기능
      // 커스텀 쿼리 추가 가능 (예: 추후 인증 추가 시 사용자 ID로 조회)

      // 히스토리 조회를 위해 생성일 기준 내림차순 정렬 필요
      List<TarotReadingSession> findAllByOrderByCreatedAtDesc();
}
