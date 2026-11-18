package com.company.ticketsystem.controller;

import com.company.ticketsystem.dto.CommentRequestDto;
import com.company.ticketsystem.dto.UserContext;
import com.company.ticketsystem.entity.Comment;
import com.company.ticketsystem.exception.DemoIdentityException;
import com.company.ticketsystem.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{id}/comments")
public class CommentController {

    private final TicketService ticketService;

    public CommentController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @GetMapping
    public ResponseEntity<List<Comment>> getComments(@PathVariable("id") Long ticketId, HttpServletRequest request) {
        UserContext userContext = getUserContext(request);
        return ResponseEntity.ok(ticketService.getComments(ticketId, userContext));
    }

    @PostMapping
    public ResponseEntity<Comment> addComment(
            @PathVariable("id") Long ticketId,
            @Valid @RequestBody CommentRequestDto dto,
            HttpServletRequest request
    ) {
        UserContext userContext = getUserContext(request);
        Comment comment = ticketService.addComment(ticketId, dto, userContext);
        return ResponseEntity.status(HttpStatus.CREATED).body(comment);
    }

    private UserContext getUserContext(HttpServletRequest request) {
        UserContext userContext = (UserContext) request.getAttribute("userContext");
        if (userContext == null) {
            throw new DemoIdentityException("Missing required demo identity headers: X-User-Id and X-User-Role");
        }
        return userContext;
    }
}

