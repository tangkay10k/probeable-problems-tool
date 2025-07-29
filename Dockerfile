# ─── Stage 1: Build the frontend ─────────────────────────────────────────────
FROM node:18-alpine AS client-builder
WORKDIR /app/client

# Inject Google Client ID ENV
ARG VITE_GOOGLE_OAUTH_CLIENT_ID
ENV VITE_GOOGLE_OAUTH_CLIENT_ID=$VITE_GOOGLE_OAUTH_CLIENT_ID

# ensure npm will use legacy peer‑deps
ENV NPM_CONFIG_LEGACY_PEER_DEPS=true

# Install deps early to cache
COPY client/package*.json ./
RUN npm ci

# Copy source & build
COPY client/ ./
RUN npm run build


# ─── Stage 2: Build the Spring Boot app ─────────────────────────────────────────
FROM maven:3.9.9-eclipse-temurin-17 AS server-builder
WORKDIR /app/server

# Copy just the POM to cache dependencies
COPY backend/pom.xml ./
RUN mvn dependency:go-offline -B

# Copy source & inject built frontend
COPY backend/src ./src
COPY --from=client-builder /app/client/dist ./src/main/resources/static

# Package the app
RUN mvn clean package -DskipTests -B


# ─── Stage 3: Create the final image ──────────────────────────────────────────
FROM openjdk:17-slim
WORKDIR /app

# Copy the fat JAR from the builder
COPY --from=server-builder /app/server/target/*.jar app.jar

# Expose the port your Spring Boot app listens on
EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]