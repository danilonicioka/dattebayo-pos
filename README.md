# Dattebayo Restaurant POS

A mixed Maven + Gradle monorepo for a Restaurant Point of Sale system.

## Architecture

- **Backend**: Spring Boot + Thymeleaf + PostgreSQL (Maven)
- **Client**: Generated Java Retrofit client from OpenAPI (Maven)
- **Android App**: Native Android app consuming the generated client (Gradle)
- **Infrastructure**: Docker Compose for local development

## Project Structure

```
your-project/
├── pom.xml                         # Maven root (parent POM)
├── contracts/
│   └── openapi.yaml                # API contract (OpenAPI 3.0)
├── server/
│   ├── pom.xml                     # Spring Boot app
│   ├── src/
│   └── Dockerfile
├── clients/
│   └── android-client/
│       └── pom.xml                 # Generated Java client
├── apps/
│   └── android/                    # Android app (Gradle)
│       ├── build.gradle
│       ├── settings.gradle
│       └── app/
└── docker/
    └── compose.dev.yml
```

## Getting Started

### Prerequisites

- Docker & Docker Compose
- (Optional) Maven 3.9+ and Java 17+ for local builds
- (Optional) Android Studio for Android development

### Running the Backend

All development is done via Docker Compose. **No local Maven or Java installation required.**

```bash
# Start the backend + database
docker compose -f docker/compose.dev.yml up --build

# Access the application
open http://localhost:8080
```

The Docker build will:
1. Build the Spring Boot application inside a Maven container
2. Package it into a runnable JAR
3. Run it in a lightweight JRE container

### Generating the Android Client

To generate the Retrofit client from the OpenAPI spec:

```bash
# From the root directory
mvn clean install -pl clients/android-client

# This will:
# 1. Read contracts/openapi.yaml
# 2. Generate Java/Retrofit client code
# 3. Install to local Maven repository (~/.m2)
```

### Building the Android App

```bash
cd apps/android
./gradlew build

# The app can consume the generated client via mavenLocal()
```

## Development Workflow

1. **API First**: Update `contracts/openapi.yaml` when adding new endpoints
2. **Implement**: Add corresponding Spring Boot controllers in `server/src`
3. **Generate**: Run `mvn install` in `clients/android-client` to regenerate the client
4. **Consume**: Use the generated client in the Android app

## Environment Variables

The backend uses Spring profiles. Environment variables are defined in `docker/compose.dev.yml`:

- `DB_HOST`: Database hostname
- `DB_PORT`: Database port
- `DB_NAME`: Database name
- `DB_USER`: Database user
- `DB_PASSWORD`: Database password
- `TZ`: Timezone (America/Sao_Paulo)

## Next Steps

- [ ] Implement authentication (JWT or OAuth2)
- [ ] Expand OpenAPI spec with full CRUD endpoints
- [ ] Build Android UI screens
- [ ] Add automated tests
- [ ] Setup CI/CD pipeline

## License

See [LICENSE](LICENSE) file.
