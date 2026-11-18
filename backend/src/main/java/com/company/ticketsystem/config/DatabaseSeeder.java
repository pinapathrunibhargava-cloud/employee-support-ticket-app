package com.company.ticketsystem.config;

import com.company.ticketsystem.entity.Ticket;
import com.company.ticketsystem.model.Category;
import com.company.ticketsystem.model.Priority;
import com.company.ticketsystem.model.Status;
import com.company.ticketsystem.repository.TicketRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class DatabaseSeeder implements CommandLineRunner {

    private final TicketRepository ticketRepository;

    public DatabaseSeeder(TicketRepository ticketRepository) {
        this.ticketRepository = ticketRepository;
    }

    @Override
    public void run(String... args) {
        if (ticketRepository.count() == 0) {
            Ticket ticket1 = new Ticket(
                    "Laptop not charging",
                    "Laptop not charging issue reported during training.",
                    Category.Hardware,
                    Priority.High,
                    Status.OPEN,
                    "alice.employee"
            );

            Ticket ticket2 = new Ticket(
                    "Cannot log in to VPN",
                    "Cannot log in to VPN issue reported during training.",
                    Category.Network,
                    Priority.High,
                    Status.IN_PROGRESS,
                    "alice.employee"
            );

            Ticket ticket3 = new Ticket(
                    "Need access to the shared project folder",
                    "Need access to the shared project folder issue reported during training.",
                    Category.Access,
                    Priority.Medium,
                    Status.OPEN,
                    "charlie.employee"
            );

            Ticket ticket4 = new Ticket(
                    "Excel keeps crashing on startup",
                    "Excel keeps crashing on startup issue reported during training.",
                    Category.Software,
                    Priority.Medium,
                    Status.RESOLVED,
                    "charlie.employee"
            );

            Ticket ticket5 = new Ticket(
                    "Request a second monitor",
                    "Request a second monitor issue reported during training.",
                    Category.Hardware,
                    Priority.Low,
                    Status.CLOSED,
                    "alice.employee"
            );

            ticketRepository.saveAll(List.of(ticket1, ticket2, ticket3, ticket4, ticket5));
        }
    }
}

