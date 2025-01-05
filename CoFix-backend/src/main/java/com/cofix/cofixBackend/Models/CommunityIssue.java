package com.cofix.cofixBackend.Models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_issues")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommunityIssue {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String title;
    private String description;
    private String category;
    private String urgency;
    private String status;
    private Double latitude;
    private Double longitude;
    private String photoUrl;
    private String userEmail;
    private LocalDateTime createdAt;
} 