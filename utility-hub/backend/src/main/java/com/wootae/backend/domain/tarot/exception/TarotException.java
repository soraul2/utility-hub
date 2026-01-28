package com.wootae.backend.domain.tarot.exception;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

public class TarotException {

      @Getter
      public static class TarotCardNotFoundException extends RuntimeException {
            private final String cardId;

            public TarotCardNotFoundException(String cardId) {
                  super("Tarot card not found: " + cardId);
                  this.cardId = cardId;
            }
      }

      @Getter
      public static class InvalidSpreadTypeException extends RuntimeException {
            private final String spreadType;

            public InvalidSpreadTypeException(String spreadType) {
                  super("Invalid spread type: " + spreadType);
                  this.spreadType = spreadType;
            }
      }
}
