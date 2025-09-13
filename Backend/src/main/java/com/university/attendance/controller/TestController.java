package com.university.attendance.controller;

import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
public class TestController {
    
    @GetMapping("/hello")
    public Map<String, String> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Hello from Spring Boot!");
        response.put("status", "success");
        return response;
    }
}
