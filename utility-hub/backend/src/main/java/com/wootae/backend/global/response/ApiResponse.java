package com.wootae.backend.global.response;

import com.wootae.backend.global.error.ErrorCode;

public record ApiResponse<T>(
    boolean success,
    T data,
    ErrorInfo error
) {
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }

    public static <T> ApiResponse<T> error(ErrorCode errorCode) {
        return new ApiResponse<>(false, null,
            new ErrorInfo(errorCode.getCode(), errorCode.getMessage()));
    }
}
