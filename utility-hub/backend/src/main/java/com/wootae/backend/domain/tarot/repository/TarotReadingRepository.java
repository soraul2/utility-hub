package com.wootae.backend.domain.tarot.repository;

import com.wootae.backend.domain.tarot.entity.TarotReadingSession;
import com.wootae.backend.domain.tarot.entity.TarotSpread;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface TarotReadingRepository extends JpaRepository<TarotReadingSession, Long> {
      // 기본 제공되는 JpaRepository의 CRUD 기능

      // 히스토리 조회 (회원별)
      Page<TarotReadingSession> findAllByMemberId(Long memberId, Pageable pageable);

      // 히스토리 조회 (회원별 + 스프레드 타입별)
      Page<TarotReadingSession> findAllByMemberIdAndSpreadType(Long memberId, TarotSpread spreadType,
                  Pageable pageable);

      // 히스토리 검색 (회원별 + 질문 내용 검색)
      Page<TarotReadingSession> findAllByMemberIdAndQuestionContaining(Long memberId, String question,
                  Pageable pageable);

      // 히스토리 검색 (회원별 + 스프레드 타입별 + 질문 내용 검색)
      Page<TarotReadingSession> findAllByMemberIdAndSpreadTypeAndQuestionContaining(Long memberId,
                  TarotSpread spreadType, String question, Pageable pageable);

      // 일일 제한 확인용
      long countByMemberIdAndCreatedAtBetween(Long memberId, LocalDateTime start, LocalDateTime end);

      // 공유 UUID로 조회
      Optional<TarotReadingSession> findByShareUuid(String shareUuid);

      // 본인 삭제용
      Optional<TarotReadingSession> findByIdAndMemberId(Long id, Long memberId);
}
