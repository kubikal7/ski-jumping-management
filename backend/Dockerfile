# build (Maven + JDK 25)
FROM maven:3.9.11-eclipse-temurin-25 AS build

WORKDIR /app
COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

# run only JDK 25
FROM eclipse-temurin:25-jdk-alpine

WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
