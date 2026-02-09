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
    └── compose.yml
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
./start.sh
# OR
docker compose -f docker/compose.yml --env-file .env up --build

# Access the application
# Web Interface: http://localhost:80
# Database: localhost:5432
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

The backend uses Spring profiles. Environment variables are defined in `.env` and `docker/compose.yml`:

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


## Deployment

### Create VM on Google Cloud

#### CLI

```bash
gcloud compute instances create dattebayo-pos \
    --project=project-a18a3986-421a-4272-87a \
    --zone=southamerica-east1-a \
    --machine-type=e2-small \
    --network-interface=network-tier=PREMIUM,stack-type=IPV4_ONLY,subnet=default \
    --maintenance-policy=MIGRATE \
    --provisioning-model=STANDARD \
    --service-account=314446990476-compute@developer.gserviceaccount.com \
    --scopes=https://www.googleapis.com/auth/devstorage.read_only,https://www.googleapis.com/auth/logging.write,https://www.googleapis.com/auth/monitoring.write,https://www.googleapis.com/auth/service.management.readonly,https://www.googleapis.com/auth/servicecontrol,https://www.googleapis.com/auth/trace.append \
    --tags=https-server,http-server \
    --create-disk=auto-delete=yes,boot=yes,device-name=dattebayo-pos,disk-resource-policy=projects/project-a18a3986-421a-4272-87a/regions/southamerica-east1/resourcePolicies/default-schedule-1,image=projects/debian-cloud/global/images/debian-13-trixie-v20260114,mode=rw,size=20,type=pd-balanced \
    --no-shielded-secure-boot \
    --shielded-vtpm \
    --shielded-integrity-monitoring \
    --labels=goog-ec-src=vm_add-gcloud
```

#### REST

```json
POST https://compute.googleapis.com/compute/v1/projects/project-a18a3986-421a-4272-87a/zones/southamerica-east1-a/instances

{
  "name": "dattebayo-pos",
  "machineType": "zones/southamerica-east1-a/machineTypes/e2-small",
  "disks": [
    {
      "boot": true,
      "autoDelete": true,
      "initializeParams": {
        "sourceImage": "projects/debian-cloud/global/images/debian-13-trixie-v20260114",
        "diskSizeGb": "20"
      }
    }
  ],
  "networkInterfaces": [
    {
      "network": "global/networks/default",
      "accessConfigs": [
        {
          "type": "ONE_TO_ONE_NAT",
          "name": "External NAT"
        }
      ]
    }
  ],
  "serviceAccounts": [
    {
      "email": "314446990476-compute@developer.gserviceaccount.com",
      "scopes": [
        "https://www.googleapis.com/auth/devstorage.read_only",
        "https://www.googleapis.com/auth/logging.write",
        "https://www.googleapis.com/auth/monitoring.write",
        "https://www.googleapis.com/auth/service.management.readonly",
        "https://www.googleapis.com/auth/servicecontrol",
        "https://www.googleapis.com/auth/trace.append"
      ]
    }
  ],
  "tags": {
    "items": [
      "https-server",
      "http-server"
    ]
  },
  "shieldedInstanceConfig": {
    "enableSecureBoot": false,
    "enableVtpm": true,
    "enableIntegrityMonitoring": true
  },
  "labels": {
    "goog-ec-src": "vm_add-gcloud"
  }
}
```

#### Terraform

```hcl
resource "google_compute_instance" "dattebayo-pos" {
  project      = "project-a18a3986-421a-4272-87a"
  name         = "dattebayo-pos"
  zone         = "southamerica-east1-a"
  machine_type = "e2-small"

  boot_disk {
    initialize_params {
      image = "projects/debian-cloud/global/images/debian-13-trixie-v20260114"
      size  = 20
    }
  }

  network_interface {
    network = "global/networks/default"
    access_config {
      # Ephemeral IP
    }
  }

  service_account {
    email  = "314446990476-compute@developer.gserviceaccount.com"
    scopes = [
      "https://www.googleapis.com/auth/devstorage.read_only",
      "https://www.googleapis.com/auth/logging.write",
      "https://www.googleapis.com/auth/monitoring.write",
      "https://www.googleapis.com/auth/service.management.readonly",
      "https://www.googleapis.com/auth/servicecontrol",
      "https://www.googleapis.com/auth/trace.append"
    ]
  }

  tags = ["https-server", "http-server"]

  shielded_instance_config {
    enable_secure_boot          = false
    enable_vtpm                 = true
    enable_integrity_monitoring = true
  }

  labels = {
    "goog-ec-src" = "vm_add-gcloud"
  }
}
```
