FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Copy parent pom
COPY pom.xml ./pom.xml

# Copy server module
COPY server/pom.xml ./server/pom.xml
COPY server/src ./server/src

# Build the server module
RUN mvn -f server/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/server/target/restaurant-pos-server-*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-Duser.timezone=America/Sao_Paulo", "-jar", "app.jar"]
