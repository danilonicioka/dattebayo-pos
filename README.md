# Dattebayo Restaurant POS

A modern Restaurant Point of Sale system built with a unified JavaScript ecosystem.

## Architecture

- **Backend**: NestJS + Prisma ORM + PostgreSQL
- **Frontend/Mobile**: React Native (Expo)
- **Shared**: Monorepo using npm workspaces (`@dattebayo/core`)
- **Infrastructure**: Docker Compose for local development

## Project Structure

```
dattebayo-pos/
├── package.json                    # Root workspace Configuration
├── apps/
│   ├── api/                        # NestJS Backend API
│   │   ├── src/                    # Controllers and Services
│   │   ├── prisma/                 # Database schema (dev.db SQLite / PostgreSQL)
│   │   └── package.json
│   └── mobile/                     # React Native Expo App
│       ├── app/                    # Expo Router Views (Admin, Cashier, Orders)
│       ├── components/             # Reusable UI components
│       └── package.json
├── packages/
│   └── core/                       # Shared types, dtos, and configuration
├── docker-compose.yml              # Local container orchestration
└── build-android.sh                # Local Android APK builder script
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v20+ recommended)
- [Docker](https://www.docker.com/) & Docker Compose

### Running the Project

All development is orchestrated via Docker Compose, which spins up the backend API and database.

```bash
# Start the backend API locally
docker-compose up -d --build

# Once up, the API will be available at: http://localhost:3000
```

### Running the Mobile App

After the backend is running, you can boot the frontend application pointing to your machine's local IP address using Expo.

```bash
# Enter the mobile directory
cd apps/mobile

# Install dependencies (if not done already)
npm install

# Start the Expo development server
npx expo start
```
*Note: Ensure `EXPO_PUBLIC_API_URL` in `apps/mobile/.env` is set to your machine's physical network IP (e.g., `http://192.168.0.x:3000`) instead of `localhost` so physical devices can reach the backend.*

### Building a Local Android APK

If you need a standalone, installable `.apk` file for Android devices (like POS machines or tablets) without using Expo Go, you can compile the app offline:

1. Ensure you have the **Android SDK** installed (typically via Android Studio).
2. From the root directory, run the automated script:
   ```bash
   ./build-android.sh
   ```
3. The script will generate the native project and compile it via Gradle. Your output file will be located at:
   `apps/mobile/android/app/build/outputs/apk/release/app-release.apk`

---

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


### VM Configuration

Once your VM is created and you have SSH access, follow these steps to get the project running:

1.  **Install Git and clone the repository:**
    ```bash
    sudo apt-get update
    sudo apt-get install -y git
    git clone https://github.com/danilo.nicioka/dattebayo-pos.git
    cd dattebayo-pos
    ```

2.  **Run the setup script:**
    This script will install Docker, configure your user, and start the services.
    ```bash
    chmod +x setup-vm.sh
    ./setup-vm.sh
    ```

3.  **Reload group membership:**
    After the script finishes, you need to apply the new group membership for Docker to work without `sudo`:
    ```bash
    newgrp docker
    ```

4.  **Verify services:**
    Check if the containers are running:
    ```bash
    docker compose ps
    ```
