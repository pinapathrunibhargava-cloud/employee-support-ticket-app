package com.company.ticketsystem.dto;

import com.company.ticketsystem.model.Status;
import jakarta.validation.constraints.NotNull;

public class StatusUpdateDto {

    @NotNull(message = "Status cannot be empty")
    private Status status;

    public StatusUpdateDto() {
    }

    public StatusUpdateDto(Status status) {
        this.status = status;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }
}

