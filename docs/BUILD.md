# Build & Development Guide

## Docker-First Development

This project is designed to run entirely via Docker Compose. No local JDK or Maven installation is required.

## Building & Running

### Start Everything
```bash
docker compose -f docker/compose.dev.yml up --build
```

This command will:
1. Start PostgreSQL database
2. Build the Spring Boot application inside a Maven container
3. Package it into a JAR
4. Run it in a JRE container
5. Connect to the database

### Access Points
- **Backend API**: http://localhost:8080
- **Database**: localhost:5432

### Stop Everything
```bash
docker compose -f docker/compose.dev.yml down
```

### Clean Everything (including volumes)
```bash
docker compose -f docker/compose.dev.yml down -v
```

## Client Generation

To generate the Android Retrofit client from the OpenAPI specification:

### Option 1: Using Docker (Recommended)
```bash
docker run --rm \
  -v ${PWD}:/local \
  -w /local \
  maven:3.9-eclipse-temurin-17 \
  mvn clean install -pl clients/android-client
```

### Option 2: Local Maven (if installed)
```bash
mvn clean install -pl clients/android-client
```

This will:
- Read `contracts/openapi.yaml`
- Generate Java Retrofit client code
- Install to local Maven repository (`~/.m2`)

## Android App Development

The Android app is in `apps/android` and uses Gradle.

```bash
cd apps/android

# Build the app
./gradlew build

# Install on connected device
./gradlew installDebug
```

The app can consume the generated client via `mavenLocal()` repository.

## Development Workflow

1. **Define API**: Update `contracts/openapi.yaml` with new endpoints
2. **Implement Backend**: Add Spring Boot controllers in `server/src`
3. **Test Backend**: Run via Docker Compose
4. **Generate Client**: Run Maven to regenerate the Android client
5. **Implement Android**: Use the generated client in the app

## Troubleshooting

### Docker Build Fails
- Ensure Docker has enough memory (recommended: 4GB+)
- Check `server/pom.xml` for dependency issues
- Clear Docker cache: `docker system prune -a`

### Database Connection Issues
- Ensure PostgreSQL healthcheck passes
- Check environment variables in `docker/compose.dev.yml`
- View logs: `docker compose -f docker/compose.dev.yml logs postgres`

### Client Generation Fails
- Validate `contracts/openapi.yaml` syntax at https://editor.swagger.io
- Check Maven output for errors
- Ensure Java 17 is available (in Docker or locally)
