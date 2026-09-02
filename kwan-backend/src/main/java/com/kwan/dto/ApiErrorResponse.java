package com.kwan.dto;

import java.util.Map;

/**
 * Standard API error response envelope.
 * Returned by {@code GlobalExceptionHandler} for all error conditions.
 */
public record ApiErrorResponse(
        int status,
        String message,
        String path,
        String timestamp,
        Map<String, String> fieldErrors   // non-null only for validation errors
) {}
