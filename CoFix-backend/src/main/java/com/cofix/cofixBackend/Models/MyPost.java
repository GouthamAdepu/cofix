package com.cofix.cofixBackend.Models;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(schema = "${cofix.schema.name}", name = "posts")
@IdClass(PostPk.class)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MyPost{

    @Id
    @Column(name = "email")
    String email;

    @Id
    @Column(name = "post_id")
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "my_sequence_generator")
    @SequenceGenerator(name = "my_sequence_generator", sequenceName = "public.posts_post_id_seq", allocationSize = 1)
    Long postId;

    @Column(name = "benefit_type")
    @Enumerated(EnumType.STRING)
    BenefitTypes benefitType;

    @Column(name = "scheme_name")
    String schemeName;

    @Column(name = "description")
    String description;

    @Column(name = "image", columnDefinition = "TEXT")
    private String image;

    @Column(name = "issue_name")
    String issueName;

    @Column(name = "activity_description")
    String activityDescription;

    @Embedded
    @AttributeOverrides({
            @AttributeOverride(name = "lat", column = @Column(name = "latitude")),
            @AttributeOverride(name = "lng", column = @Column(name = "longitude"))
    })
    private Location location;

    @Column(name = "comment")
    String comment;

    @Column(name = "create_date", columnDefinition = "TIMESTAMP")
    LocalDateTime createDate;

    @Column(name = "urgency", columnDefinition = "varchar(20) default 'MEDIUM'")
    private String urgency;

    @Column(name = "status", columnDefinition = "varchar(20) default 'PENDING'")
    private String status;

    public MyPost(String email, BenefitTypes benefitType, String schemeName, String description, String image, String issueName, String activityDescription, Location location, String comment) {
        this.email = email;
        this.benefitType = benefitType;
        this.schemeName = schemeName;
        this.description = description;
        this.image = image;
        this.issueName = issueName;
        this.activityDescription = activityDescription;
        this.location = location;
        this.comment = comment;
        this.createDate = LocalDateTime.now();
        this.status = "PENDING";
        this.urgency = "MEDIUM";
    }

    public Location getLocation() {
        return this.location;
    }

    public void setLocation(Location location) {
        this.location = location;
    }

    public Double getLatitude() {
        return location != null ? location.getLat() : null;
    }

    public void setLatitude(Double latitude) {
        if (location == null) {
            location = new Location();
        }
        location.setLat(latitude);
    }

    public Double getLongitude() {
        return location != null ? location.getLng() : null;
    }

    public void setLongitude(Double longitude) {
        if (location == null) {
            location = new Location();
        }
        location.setLng(longitude);
    }

    public String getFormattedDate() {
        if (createDate != null) {
            return createDate.format(java.time.format.DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm"));
        }
        return "";
    }
}
