FROM maven:3.9.9-eclipse-temurin-17 AS build-env
WORKDIR /app
COPY pom.xml ./
COPY src ./src
RUN mvn -B package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build-env /app/target/uoa-0.0.1-SNAPSHOT.jar /app/uoa.jar
EXPOSE 8081
CMD ["java", "-jar", "/app/uoa.jar"]
