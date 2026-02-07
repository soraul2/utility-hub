package com.wootae.backend.domain.calendar.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;

@Component
@Converter
public class EncryptConverter implements AttributeConverter<String, String> {

      private static final String ALGORITHM = "AES/GCM/NoPadding";
      private static final int GCM_IV_LENGTH = 12;
      private static final int GCM_TAG_LENGTH = 128;

      private final byte[] keyBytes;

      public EncryptConverter(@Value("${google.token.encrypt-key:default-dev-key-32chars!!}") String encryptKey) {
            byte[] raw = encryptKey.getBytes();
            this.keyBytes = new byte[32];
            System.arraycopy(raw, 0, this.keyBytes, 0, Math.min(raw.length, 32));
      }

      @Override
      public String convertToDatabaseColumn(String attribute) {
            if (attribute == null) return null;
            try {
                  byte[] iv = new byte[GCM_IV_LENGTH];
                  new SecureRandom().nextBytes(iv);

                  Cipher cipher = Cipher.getInstance(ALGORITHM);
                  cipher.init(Cipher.ENCRYPT_MODE,
                        new SecretKeySpec(keyBytes, "AES"),
                        new GCMParameterSpec(GCM_TAG_LENGTH, iv));

                  byte[] encrypted = cipher.doFinal(attribute.getBytes());

                  ByteBuffer buffer = ByteBuffer.allocate(iv.length + encrypted.length);
                  buffer.put(iv);
                  buffer.put(encrypted);

                  return Base64.getEncoder().encodeToString(buffer.array());
            } catch (Exception e) {
                  throw new RuntimeException("Encryption failed", e);
            }
      }

      @Override
      public String convertToEntityAttribute(String dbData) {
            if (dbData == null) return null;
            try {
                  byte[] decoded = Base64.getDecoder().decode(dbData);

                  ByteBuffer buffer = ByteBuffer.wrap(decoded);
                  byte[] iv = new byte[GCM_IV_LENGTH];
                  buffer.get(iv);
                  byte[] encrypted = new byte[buffer.remaining()];
                  buffer.get(encrypted);

                  Cipher cipher = Cipher.getInstance(ALGORITHM);
                  cipher.init(Cipher.DECRYPT_MODE,
                        new SecretKeySpec(keyBytes, "AES"),
                        new GCMParameterSpec(GCM_TAG_LENGTH, iv));

                  return new String(cipher.doFinal(encrypted));
            } catch (Exception e) {
                  throw new RuntimeException("Decryption failed", e);
            }
      }
}
