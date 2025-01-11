package com.cofix.cofixBackend.Models;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "community_issues", schema = "public")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
    
    @Column(name = "photo_url")
    private String photoUrl;
    
    @Column(name = "user_email")
    private String userEmail;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
} 