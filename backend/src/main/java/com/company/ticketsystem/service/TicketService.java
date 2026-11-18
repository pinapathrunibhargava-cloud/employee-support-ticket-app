package com.company.ticketsystem.service;

import com.company.ticketsystem.dto.CommentRequestDto;
import com.company.ticketsystem.dto.StatusUpdateDto;
import com.company.ticketsystem.dto.TicketRequestDto;
import com.company.ticketsystem.dto.UserContext;
import com.company.ticketsystem.entity.Comment;
import com.company.ticketsystem.entity.Ticket;
import com.company.ticketsystem.exception.BadRequestException;
import com.company.ticketsystem.exception.ForbiddenException;
import com.company.ticketsystem.exception.ResourceNotFoundException;
import com.company.ticketsystem.model.Role;
import com.company.ticketsystem.model.Status;
import com.company.ticketsystem.repository.CommentRepository;
import com.company.ticketsystem.repository.TicketRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class TicketService {

    private final TicketRepository ticketRepository;
    private final CommentRepository commentRepository;

    public TicketService(TicketRepository ticketRepository, CommentRepository commentRepository) {
        this.ticketRepository = ticketRepository;
        this.commentRepository = commentRepository;
    }

    @Transactional(readOnly = true)
    public List<Ticket> getTickets(UserContext userContext) {
        if (userContext.getRole() == Role.EMPLOYEE) {
            return ticketRepository.findByCreatedByOrderByCreatedAtDesc(userContext.getUserId());
        } else {
            return ticketRepository.findAllByOrderByCreatedAtDesc();
        }
    }

    public Ticket createTicket(TicketRequestDto dto, UserContext userContext) {
        if (userContext.getRole() == Role.SUPPORT_STAFF) {
            throw new ForbiddenException("Only employees can create tickets");
        }

        validateTicketInput(dto);

        Ticket ticket = new Ticket(
                dto.getTitle().trim(),
                dto.getDescription().trim(),
                dto.getCategory(),
                dto.getPriority(),
                Status.OPEN,
                userContext.getUserId()
        );

        return ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public Ticket getTicketById(Long id, UserContext userContext) {
        Ticket ticket = findTicketOrThrow(id);

        if (userContext.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().equals(userContext.getUserId())) {
            throw new ForbiddenException("You are not authorized to view this ticket");
        }

        return ticket;
    }

    public Ticket updateTicket(Long id, TicketRequestDto dto, UserContext userContext) {
        if (userContext.getRole() == Role.SUPPORT_STAFF) {
            throw new ForbiddenException("Support staff cannot edit ticket details");
        }

        Ticket ticket = findTicketOrThrow(id);

        if (!ticket.getCreatedBy().equals(userContext.getUserId())) {
            throw new ForbiddenException("You are not authorized to edit this ticket");
        }

        if (ticket.getStatus() == Status.CLOSED) {
            throw new BadRequestException("Closed tickets cannot be edited");
        }

        validateTicketInput(dto);

        ticket.setTitle(dto.getTitle().trim());
        ticket.setDescription(dto.getDescription().trim());
        ticket.setCategory(dto.getCategory());
        ticket.setPriority(dto.getPriority());

        return ticketRepository.save(ticket);
    }

    public Ticket updateTicketStatus(Long id, StatusUpdateDto dto, UserContext userContext) {
        if (userContext.getRole() != Role.SUPPORT_STAFF) {
            throw new ForbiddenException("Only support staff can change ticket status");
        }

        if (dto == null || dto.getStatus() == null) {
            throw new BadRequestException("Status cannot be empty");
        }

        Ticket ticket = findTicketOrThrow(id);
        Status currentStatus = ticket.getStatus();
        Status targetStatus = dto.getStatus();

        if (!currentStatus.canTransitionTo(targetStatus)) {
            throw new BadRequestException("Invalid status transition from " + currentStatus.getValue() + " to " + targetStatus.getValue() + ". Allowed sequential transitions: OPEN -> IN_PROGRESS -> RESOLVED -> CLOSED");
        }

        ticket.setStatus(targetStatus);
        return ticketRepository.save(ticket);
    }

    @Transactional(readOnly = true)
    public List<Comment> getComments(Long ticketId, UserContext userContext) {
        Ticket ticket = findTicketOrThrow(ticketId);

        if (userContext.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().equals(userContext.getUserId())) {
            throw new ForbiddenException("You are not authorized to view comments for this ticket");
        }

        return commentRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public Comment addComment(Long ticketId, CommentRequestDto dto, UserContext userContext) {
        Ticket ticket = findTicketOrThrow(ticketId);

        if (userContext.getRole() == Role.EMPLOYEE && !ticket.getCreatedBy().equals(userContext.getUserId())) {
            throw new ForbiddenException("You are not authorized to comment on this ticket");
        }

        if (dto == null || dto.getContent() == null || dto.getContent().trim().isEmpty()) {
            throw new BadRequestException("Comment content cannot be empty");
        }

        Comment comment = new Comment(
                ticket,
                userContext.getUserId(),
                userContext.getRole(),
                dto.getContent().trim()
        );

        return commentRepository.save(comment);
    }

    private Ticket findTicketOrThrow(Long id) {
        return ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found with id: " + id));
    }

    private void validateTicketInput(TicketRequestDto dto) {
        if (dto.getTitle() == null || dto.getTitle().trim().isEmpty()) {
            throw new BadRequestException("Title cannot be empty");
        }
        if (dto.getTitle().trim().length() > 100) {
            throw new BadRequestException("Title must not exceed 100 characters");
        }
        if (dto.getDescription() == null || dto.getDescription().trim().isEmpty()) {
            throw new BadRequestException("Description cannot be empty");
        }
        if (dto.getCategory() == null) {
            throw new BadRequestException("Category is required");
        }
        if (dto.getPriority() == null) {
            throw new BadRequestException("Priority is required");
        }
    }
}

