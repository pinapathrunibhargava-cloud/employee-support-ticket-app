package com.company.ticketsystem.model;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum Status {
    OPEN("Open"),
    IN_PROGRESS("In Progress"),
    RESOLVED("Resolved"),
    CLOSED("Closed");

    private final String value;

    Status(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    @JsonCreator
    public static Status fromValue(String text) {
        if (text == null) {
            throw new IllegalArgumentException("Status value cannot be null");
        }
        for (Status s : Status.values()) {
            if (s.value.equalsIgnoreCase(text.trim()) || s.name().equalsIgnoreCase(text.trim())) {
                return s;
            }
        }
        throw new IllegalArgumentException("Invalid status: " + text);
    }

    public boolean canTransitionTo(Status next) {
        if (this == OPEN && next == IN_PROGRESS) {
            return true;
        }
        if (this == IN_PROGRESS && next == RESOLVED) {
            return true;
        }
        if (this == RESOLVED && next == CLOSED) {
            return true;
        }
        return false;
    }
}

