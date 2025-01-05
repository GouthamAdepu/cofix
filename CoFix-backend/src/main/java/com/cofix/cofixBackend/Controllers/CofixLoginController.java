package com.cofix.cofixBackend.Controllers;

import com.cofix.cofixBackend.Models.BenefitTypes;
import com.cofix.cofixBackend.Models.MyPost;
import com.cofix.cofixBackend.Models.MyReview;
import com.cofix.cofixBackend.Models.MyUser;
import com.cofix.cofixBackend.Models.CommunityIssue;
import com.cofix.cofixBackend.Models.Location;
import com.cofix.cofixBackend.Services.AuthService;
import com.cofix.cofixBackend.Services.CofixService;
import com.cofix.cofixBackend.Services.EmailSenderService;
import jakarta.mail.MessagingException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@Slf4j
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
@RequestMapping("/api")
public class CofixLoginController {

    @Autowired
    AuthService authService;

    @Autowired
    CofixService cofixService;

    @Value("${admin-email}")
    String adminEmail;

    public CofixLoginController(){
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestParam String email, @RequestParam String password) {
        log.info("Login attempt for email: " + email);
        
        // Add input validation
        if (email == null || password == null || 
            email.trim().isEmpty() || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Email and password are required"));
        }

        if (authService.loginUser(email, password)) {
            log.info("User authenticated successfully: " + email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Login successful");
            response.put("email", email);
            return ResponseEntity.ok(response);
        } else {
            log.info("Authentication failed for: " + email);
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Invalid email or password"));
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, String>> signUp(@RequestParam String name, @RequestParam String email, @RequestParam String password) {
        log.info("Signup information has been received successfully:");
        
        // Add input validation
        if (name == null || email == null || password == null || 
            name.trim().isEmpty() || email.trim().isEmpty() || password.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "All fields are required"));
        }

        Optional<MyUser> user = cofixService.getUsersRepo().findById(email);
        if(user.isPresent()){
            log.error("Cannot create user, email already exists: " + email);
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Email already registered"));
        } else {
            MyUser newUser = new MyUser(name, email, password);
            newUser.setCreateDate(LocalDateTime.now());
            authService.registerUser(newUser);
            log.info("New User added: " + email);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Sign-up successful");
            response.put("email", email);
            return ResponseEntity.ok(response);
        }
    }

    @Autowired
    private EmailSenderService emailSenderService;

    @GetMapping("/hello")
    public void sendMail() throws MessagingException {
        cofixService.sendNotificationEmail(new MyPost("test@user.com",null,BenefitTypes.GOVERNMENT_SCHEME,"Rythu Bandhu","Rythu Bandhu description",null,null,null, null, "Rythu Bandhu Description", LocalDateTime.now()),adminEmail);
    }

    @GetMapping("/profile")
    public ResponseEntity<MyUser> getProfileData(String email) {
        log.info("Profile API: Sending profile information with email:" + email);
        Optional<MyUser> user = cofixService.getUsersRepo().findById(email);
        if(user.isPresent()){
            log.info("User found :" + user.get());
            return ResponseEntity.ok(user.get());
        } else{
            log.info("User not found");
            return ResponseEntity.notFound().build();
        }
    }

//    @PostMapping("/profile/edit")
//    public ResponseEntity<MyUser> setProfileData(String email) {
//        log.info("Profile API: Sending profile information with email:" + email);
//        Optional<MyUser> user = cofixService.getUsersRepo().findById(email);
//        if(user.isPresent()){
//            log.info("User found :" + user);
//            log.info("Updating info : " + user.get());
//            return ResponseEntity.ok(user.get());
//        } else{
//            log.info("User not found");1eb6
//            return ResponseEntity.notFound().build();
//        }
//    }

    @PostMapping("/profile/update")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<MyUser> updateProfile(@RequestBody MyUser updatedProfile) {
        log.info("Updating profile for user:" + updatedProfile.getEmail());
        Optional<MyUser> profile = cofixService.getUsersRepo().findById(updatedProfile.getEmail());
        if(profile.isPresent()) {
            log.info("Old profile for user: " + profile.get());
            log.info("Updated profile = " + updatedProfile);
            updatedProfile.setPassword(profile.get().getPassword());
            cofixService.getUsersRepo().save(updatedProfile);
            return ResponseEntity.ok(updatedProfile);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @CrossOrigin
    @GetMapping("/profile/posts")
    public ResponseEntity<List<MyPost>> showAllPosts(String email) {
        List<MyPost> posts = cofixService.getProfilePosts(email);
        if(!posts.isEmpty()) {
            log.info("Get All posts for user: " + posts);
            return new ResponseEntity<>(posts, HttpStatus.OK);
        } else {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/issues")
    public ResponseEntity<List<MyPost>> getAllCommunityIssues(String benefitType) {
        List<MyPost> allCommunityIssues = cofixService.getPostsRepo().findByBenefitType(BenefitTypes.valueOf(benefitType));
        if(!allCommunityIssues.isEmpty()) {
            log.debug("Get All Community: " + allCommunityIssues);
            return new ResponseEntity<>(allCommunityIssues, HttpStatus.OK);
        } else {
            return ResponseEntity.internalServerError().build();
        }
    }

    //@CrossOrigin
    @GetMapping("/profile/issues/all")
    public ResponseEntity<List<MyPost>> showAllIssues(String email) {
        List<MyPost> allPosts = new ArrayList<>();
        
        try {
            // Get community issues
            List<MyPost> issues = cofixService.getProfileIssues(email);
            if (issues != null) {
                issues.forEach(issue -> issue.setBenefitType(BenefitTypes.COMMUNITY_ISSUE));
                allPosts.addAll(issues);
            }
            
            // Get government schemes
            List<MyPost> schemes = cofixService.getProfileSchemes(email);
            if (schemes != null) {
                schemes.forEach(scheme -> scheme.setBenefitType(BenefitTypes.GOVERNMENT_SCHEME));
                allPosts.addAll(schemes);
            }

            return ResponseEntity.ok(allPosts);
        } catch (Exception e) {
            log.error("Error fetching issues: ", e);
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @GetMapping("/profile/issues/community")
    public ResponseEntity<List<MyPost>> showAllCommunityIssues(String email) {
        List<MyPost> issues = cofixService.getProfileIssues(email);
        if (!issues.isEmpty()) {
            issues.forEach(issue -> issue.setBenefitType(BenefitTypes.COMMUNITY_ISSUE));
            log.debug("Get All issues for user: " + issues);
            return new ResponseEntity<>(issues, HttpStatus.OK);
        } else {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    @CrossOrigin
    @GetMapping("/profile/schemes")
    public ResponseEntity<List<MyPost>> showAllSchemes(String email) {
        List<MyPost> schemes = cofixService.getProfileSchemes(email);
        if (!schemes.isEmpty()) {
            // Ensure benefitType is set for schemes
            schemes.forEach(scheme -> scheme.setBenefitType(BenefitTypes.GOVERNMENT_SCHEME));
            log.debug("Get All schemes for user: " + schemes);
            return new ResponseEntity<>(schemes, HttpStatus.OK);
        } else {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }


    @CrossOrigin
    @PostMapping("/profile/issues/add")
    public ResponseEntity<MyPost> addIssue(@RequestBody MyPost issuePost) throws MessagingException {
        // Save the issue to the database or in-memory store
        // For now, just print it to the console
        log.info("Issue to be added :" + issuePost);

        MyPost addedPost = cofixService.addIssuePost(issuePost);
        if(addedPost!=null){
            log.info("Successfully added issue post");
            // cofixService.sendNotificationEmail(issuePost,adminEmail);
            cofixService.sendNotificationEmail(issuePost,issuePost.getEmail());
        } else {
            log.error("Failed to add issue post");
        }
        log.info("New community post added for user: "+ addedPost);
        return new ResponseEntity<>(addedPost, HttpStatus.CREATED);
    }

//    @CrossOrigin
//    @DeleteMapping("/profile/issues/${postId}")
//    public ResponseEntity<String> deleteIssue(@PathVariable Long postId) {
//        // Save the issue to the database or in-memory store
//        // For now, just print it to the console
//        log.info("IssueId to be deleted :" + postId);
//
//        try {
//            cofixService.deletePost(postId);
//            return ResponseEntity.ok("Deleted Successfully");
//        } catch (Exception e){
//            return ResponseEntity.internalServerError().build();
//        }
//    }
    @CrossOrigin
    @DeleteMapping("/profile/issues/{postId}")
    public ResponseEntity<Void> deleteIssues(@PathVariable Long postId) {
        log.info("IssueId to be deleted :" + postId);
        cofixService.deletePost(postId);
        return ResponseEntity.noContent().build();
    }

    @CrossOrigin
    @PostMapping("/profile/schemes/add")
    public ResponseEntity<MyPost> addScheme(@RequestBody MyPost schemePost) {

        log.info("Scheme to be added :" + schemePost);
        MyPost addedPost = cofixService.addSchemePost(schemePost);
        if(addedPost!=null){
            log.info("Successfully added scheme post");
        } else {
            log.error("Failed to add scheme post");
        }
        log.info("New community post added for user: "+ addedPost);
        return new ResponseEntity<>(addedPost, HttpStatus.CREATED);
    }


    @CrossOrigin
    @PostMapping("/profile/review/add")
    public ResponseEntity<MyReview> addIssue(@RequestBody MyReview review) {
        // Save the issue to the database or in-memory store
        // For now, just print it to the console
        log.info("review to be added :" + review);

        MyReview finalReview = cofixService.addReview(review);
        if(finalReview!=null){
            log.info("Successfully added review");
        } else {
            log.error("Failed to add issue post");
        }
        log.info("New community post added for user: "+ finalReview);
        return new ResponseEntity<>(finalReview, HttpStatus.CREATED);
    }

    @PostMapping("/issues/report")
    @CrossOrigin(origins = "http://localhost:5173")
    public ResponseEntity<Map<String, String>> reportIssue(
        @RequestParam String title,
        @RequestParam String description,
        @RequestParam String category,
        @RequestParam String urgency,
        @RequestParam Double latitude,
        @RequestParam Double longitude,
        @RequestParam(required = false) MultipartFile photo,
        @RequestParam String userEmail
    ) {
        try {
            CommunityIssue issue = new CommunityIssue();
            issue.setTitle(title);
            issue.setDescription(description);
            issue.setCategory(category);
            issue.setUrgency(urgency);
            issue.setStatus("pending");
            issue.setLatitude(latitude);
            issue.setLongitude(longitude);
            issue.setUserEmail(userEmail);
            issue.setCreatedAt(LocalDateTime.now());

            // Handle photo upload if present
            if (photo != null && !photo.isEmpty()) {
                String fileName = UUID.randomUUID().toString() + "_" + photo.getOriginalFilename();
                String filePath = "uploads/" + fileName;
                // Save file to server
                photo.transferTo(new File(filePath));
                issue.setPhotoUrl(filePath);
            }

            cofixService.saveIssue(issue);
            
            return ResponseEntity.ok(Collections.singletonMap("message", "Issue reported successfully"));
        } catch (Exception e) {
            log.error("Error reporting issue:", e);
            return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Failed to report issue"));
        }
    }

    @GetMapping("/issues/all")
    public ResponseEntity<List<MyPost>> getAllIssues() {
        try {
            List<MyPost> allPosts = cofixService.getPostsRepo().findAll();
            
            if (allPosts != null) {
                allPosts.forEach(post -> {
                    // Set default benefit type if not set
                    if (post.getBenefitType() == null) {
                        post.setBenefitType(BenefitTypes.COMMUNITY_ISSUE);
                    }
                    
                    // Set default location if not set
                    if (post.getLatitude() == null || post.getLongitude() == null) {
                        post.setLatitude(17.455598622434977);
                        post.setLongitude(78.66648576707394);
                    }
                    
                    // Set the location object
                    post.setLocation(new Location(post.getLatitude(), post.getLongitude()));
                });
                
                log.info("Found {} total issues", allPosts.size());
                return ResponseEntity.ok(allPosts);
            }
            
            return ResponseEntity.ok(new ArrayList<>());
        } catch (Exception e) {
            log.error("Error fetching all issues: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(new ArrayList<>());
        }
    }

    @GetMapping("/profile/issues")
    public ResponseEntity<List<MyPost>> showAllCommunityIssues(String email) {
        List<MyPost> issues = cofixService.getProfileIssues(email);
        if (!issues.isEmpty()) {
            // Ensure benefitType is set for community issues
            issues.forEach(issue -> issue.setBenefitType(BenefitTypes.COMMUNITY_ISSUE));
            log.debug("Get All issues for user: " + issues);
            return new ResponseEntity<>(issues, HttpStatus.OK);
        } else {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }

    // Add this method to handle location data
    private Location getLocationFromPost(MyPost post) {
        if (post.getLocation() != null) {
            return post.getLocation();
        }
        return new Location(17.455598622434977, 78.66648576707394);
    }

    @GetMapping("/auth/status")
    public ResponseEntity<Map<String, Object>> checkAuthStatus(@RequestParam String email) {
        Map<String, Object> response = new HashMap<>();
        Optional<MyUser> user = cofixService.getUsersRepo().findById(email);
        
        if (user.isPresent()) {
            response.put("isAuthenticated", true);
            response.put("user", user.get());
            return ResponseEntity.ok(response);
        }
        
        response.put("isAuthenticated", false);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(@RequestParam String email) {
        // Clear any server-side session if needed
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logged out successfully");
        return ResponseEntity.ok(response);
    }
}
