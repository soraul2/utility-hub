package com.wootae.backend.domain.shop.controller;

import com.wootae.backend.domain.shop.dto.ShopDTOs.*;
import com.wootae.backend.domain.shop.service.ShopService;
import com.wootae.backend.global.error.BusinessException;
import com.wootae.backend.global.error.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/shop")
@RequiredArgsConstructor
public class ShopController {

      private final ShopService shopService;

      @GetMapping
      public ResponseEntity<?> getShopData() {
            Long userId = getCurrentUserId();
            ShopDataResponse data = shopService.getShopData(userId);
            return ResponseEntity.ok(Map.of("success", true, "data", data));
      }

      @GetMapping("/points")
      public ResponseEntity<?> getPointBalance() {
            Long userId = getCurrentUserId();
            PointBalanceResponse balance = shopService.getPointBalance(userId);
            return ResponseEntity.ok(Map.of("success", true, "data", balance));
      }

      @PostMapping("/purchase")
      public ResponseEntity<?> purchaseTheme(@RequestBody PurchaseRequest request) {
            Long userId = getCurrentUserId();
            PurchaseResponse result = shopService.purchaseTheme(userId, request.getThemeKey());
            return ResponseEntity.ok(Map.of("success", true, "data", result));
      }

      @PostMapping("/active-theme")
      public ResponseEntity<?> setActiveTheme(@RequestBody SetActiveThemeRequest request) {
            Long userId = getCurrentUserId();
            shopService.setActiveTheme(userId, request.getThemeKey());
            return ResponseEntity.ok(Map.of("success", true));
      }

      private Long getCurrentUserId() {
            try {
                  String name = SecurityContextHolder.getContext().getAuthentication().getName();
                  return Long.parseLong(name);
            } catch (NumberFormatException e) {
                  throw new BusinessException(ErrorCode.AUTH_UNAUTHORIZED);
            }
      }
}
