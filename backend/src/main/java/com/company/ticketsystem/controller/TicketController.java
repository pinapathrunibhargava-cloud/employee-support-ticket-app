package com.company.ticketsystem.controller;

import com.company.ticketsystem.dto.StatusUpdateDto;
import com.company.ticketsystem.dto.TicketRequestDto;
import com.company.ticketsystem.dto.UserContext;
import com.company.ticketsystem.entity.Ticket;
import com.company.ticketsystem.exception.DemoIdentityException;
import com.company.ticketsystem.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets")
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<Ticket>> getTickets(HttpServletRequest request) {
        UserContext userContext = getUserContext(request);
        return ResponseEntity.ok(ticketService.getTickets(userContext));
    }

    @PostMapping
    public ResponseEntity<Ticket> createTicket(@Valid @RequestBody TicketRequestDto dto, HttpServletRequest request) {
        UserContext userContext = getUserContext(request);
        Ticket created = ticketService.createTicket(dto, userContext);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ticket> getTicketById(@PathVariable Long id, HttpServletRequest request) {
        UserContext userContext = getUserContext(request);
        return ResponseEntity.ok(ticketService.getTicketById(id, userContext));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Ticket> updateTicket(@PathVariable Long id, @Valid @RequestBody TicketRequestDto dto, HttpServletRequest request) {
        UserContext userContext = getUserContext(request);
        return ResponseEntity.ok(ticketService.updateTicket(id, dto, userContext));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Ticket> updateTicketStatus(@PathVariable Long id, @Valid @RequestBody StatusUpdateDto dto, HttpServletRequest request) {
        UserContext userContext = getUserContext(request);
        return ResponseEntity.ok(ticketService.updateTicketStatus(id, dto, userContext));
    }

    private UserContext getUserContext(HttpServletRequest request) {
        UserContext userContext = (UserContext) request.getAttribute("userContext");
        if (userContext == null) {
            throw new DemoIdentityException("Missing required demo identity headers: X-User-Id and X-User-Role");
        }
        return userContext;
    }
}

