FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Copy parent pom
COPY pom.xml ./pom.xml

# Copy backend module
COPY backend/pom.xml ./backend/pom.xml
COPY backend/src ./backend/src

# Copy web module (merged into backend)

# Build the backend module
RUN mvn -f backend/pom.xml clean package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /build/backend/target/restaurant-pos-server-*.jar app.jar
EXPOSE 80
ENTRYPOINT ["java", "-Duser.timezone=America/Sao_Paulo", "-jar", "app.jar"]
