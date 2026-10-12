
# Stage 1: Build the React frontend
FROM node:22-alpine AS frontend-build
WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ ./
RUN npm run build

# Stage 2: Build the Spring Boot backend
FROM maven:3.9.6-eclipse-temurin-21 AS backend-build
WORKDIR /app

COPY backend/pom.xml ./
COPY backend/src ./src

# Include the React files inside Spring Boot
COPY --from=frontend-build /frontend/dist ./src/main/resources/static

RUN mvn -DskipTests package

# Stage 3: Run the combined application
FROM eclipse-temurin:21-jre
RUN groupadd -r appuser && useradd -r -g appuser -m appuser
WORKDIR /app

COPY --chown=appuser:appuser --from=backend-build /app/target/*.jar app.jar

USER appuser

EXPOSE 10000

# TCP-level liveness probe (the JRE image ships bash)
HEALTHCHECK --interval=30s --timeout=5s --start-period=90s --retries=3 \
  CMD ["bash", "-c", "exec 3<>/dev/tcp/127.0.0.1/10000 || exit 1"]

CMD ["sh", "-c", "java -Dserver.port=${PORT:-10000} -jar app.jar"]
