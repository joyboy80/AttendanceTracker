package com.university.attendance.util;

import java.util.Base64;

public class Base64UrlUtil {
    
    private static final Base64.Encoder BASE64_URL_ENCODER = Base64.getUrlEncoder().withoutPadding();
    private static final Base64.Decoder BASE64_URL_DECODER = Base64.getUrlDecoder();
    
    /**
     * Encode bytes to Base64URL string
     */
    public static String encode(byte[] bytes) {
        return BASE64_URL_ENCODER.encodeToString(bytes);
    }
    
    /**
     * Decode Base64URL string to bytes
     */
    public static byte[] decode(String base64Url) {
        return BASE64_URL_DECODER.decode(base64Url);
    }
    
    /**
     * Generate a random challenge for WebAuthn
     */
    public static String generateChallenge() {
        byte[] challengeBytes = new byte[32];
        new java.security.SecureRandom().nextBytes(challengeBytes);
        return encode(challengeBytes);
    }
}