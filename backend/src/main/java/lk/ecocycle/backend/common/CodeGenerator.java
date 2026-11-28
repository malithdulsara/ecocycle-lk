package lk.ecocycle.backend.common;

import java.security.SecureRandom;

// Short random codes that are easy to read out and type: no 0/O or 1/I/L
public final class CodeGenerator {

    private static final String ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
    private static final int LENGTH = 8;
    private static final SecureRandom RANDOM = new SecureRandom();

    private CodeGenerator() {
    }

    // generate("ECO") -> "ECO-7KQ2M9XA"
    public static String generate(String prefix) {
        StringBuilder code = new StringBuilder(prefix).append('-');
        for (int i = 0; i < LENGTH; i++) {
            code.append(ALPHABET.charAt(RANDOM.nextInt(ALPHABET.length())));
        }
        return code.toString();
    }
}