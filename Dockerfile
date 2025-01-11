# Build stage for frontend
FROM node:18 AS frontend-build
WORKDIR /app/frontend
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Build stage for backend
FROM maven:3.8.4-openjdk-17 AS backend-build
WORKDIR /app/backend
COPY CoFix-backend/pom.xml .
COPY CoFix-backend/src ./src
# Copy frontend build to backend static resources
COPY --from=frontend-build /app/frontend/dist ./src/main/resources/static
RUN mvn clean package -DskipTests

# Final stage
FROM openjdk:17-jdk-slim
WORKDIR /app
COPY --from=backend-build /app/backend/target/*.jar app.jar
EXPOSE 8000
ENTRYPOINT ["java", "-jar", "app.jar"] 