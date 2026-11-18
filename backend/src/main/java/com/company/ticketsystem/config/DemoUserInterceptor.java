package com.company.ticketsystem.config;

import com.company.ticketsystem.dto.UserContext;
import com.company.ticketsystem.exception.DemoIdentityException;
import com.company.ticketsystem.model.Role;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
public class DemoUserInterceptor implements HandlerInterceptor {

    private static final Map<String, Role> PREDEFINED_PERSONAS;

    static {
        Map<String, Role> personas = new HashMap<>();
        personas.put("alice.employee", Role.EMPLOYEE);
        personas.put("charlie.employee", Role.EMPLOYEE);
        personas.put("bob.support", Role.SUPPORT_STAFF);
        PREDEFINED_PERSONAS = Collections.unmodifiableMap(personas);
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) {
        // Exclude OPTIONS preflight requests from identity validation
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            return true;
        }

        String userId = request.getHeader("X-User-Id");
        String roleHeader = request.getHeader("X-User-Role");

        // 1. Check for missing headers
        if (userId == null || userId.trim().isEmpty() || roleHeader == null || roleHeader.trim().isEmpty()) {
            throw new DemoIdentityException("Missing required demo identity headers: X-User-Id and X-User-Role");
        }

        userId = userId.trim();
        roleHeader = roleHeader.trim();

        // 2. Validate role format (must be valid Role enum, e.g. reject ADMIN)
        Role role;
        try {
            role = Role.valueOf(roleHeader);
        } catch (IllegalArgumentException e) {
            throw new DemoIdentityException("Invalid role specified: " + roleHeader);
        }

        // 3. Validate user ID against predefined personas
        Role expectedRole = PREDEFINED_PERSONAS.get(userId);
        if (expectedRole == null) {
            throw new DemoIdentityException("Unknown demo user ID: " + userId);
        }

        // 4. Validate user ID and role match
        if (expectedRole != role) {
            throw new DemoIdentityException("Mismatched user and role for demo persona: " + userId + " is " + expectedRole + ", but received " + role);
        }

        // 5. Store validated identity for controllers and services
        UserContext userContext = new UserContext(userId, role);
        request.setAttribute("userContext", userContext);

        return true;
    }
}

