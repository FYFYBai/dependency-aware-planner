package com.example.demo.entity;

/**
 * Defines the allowed roles for project collaborators.
 * These values must match the database constraint.
 */
public enum Role {
    ADMIN("admin"),
    MEMBER("member");
    
    private final String value;
    
    Role(String value) {
        this.value = value;
    }
    
    public String getValue() {
        return value;
    }
    
    public static Role fromValue(String value) {
        for (Role role : Role.values()) {
            if (role.value.equalsIgnoreCase(value)) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value);
    }
}
