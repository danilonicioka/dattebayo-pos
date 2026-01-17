# Restaurant POS System

A Point of Sale (POS) system designed for small restaurant businesses. This system allows you to take orders and display them in the kitchen for preparation. Payments are handled externally with card machines.

## Features

- **Order Taking Interface**: Easy-to-use web interface for taking customer orders
- **Kitchen Display System (KDS)**: Real-time order display for kitchen staff
- **Order Management**: Track order status (Pending → Preparing → Ready → Completed)
- **Menu Management**: Manage menu items with categories, prices, and availability
- **Database Persistence**: All orders and menu items are stored in PostgreSQL
- **Docker Support**: Easy deployment with Docker Compose

## Technology Stack

- **Backend**: Spring Boot 3.2.0 (Java 17)
- **Frontend**: Thymeleaf templates with modern CSS/JavaScript
- **Database**: PostgreSQL 15
- **Containerization**: Docker & Docker Compose

## Project Structure

```
dattebayo-pos/
├── docker-compose.yml          # Docker Compose configuration
├── backend/
│   ├── Dockerfile              # Backend Docker image
│   ├── pom.xml                 # Maven dependencies
│   └── src/
│       └── main/
│           ├── java/
│           │   └── com/dattebayo/pos/
│           │       ├── model/          # Entity models
│           │       ├── repository/     # Data repositories
│           │       ├── service/        # Business logic
│           │       ├── controller/     # REST and Web controllers
│           │       └── config/         # Configuration classes
│           └── resources/
│               ├── application.properties
│               └── templates/          # Thymeleaf HTML templates
└── README.md
```

## Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (version 20.10 or higher)
- **Docker Compose** (version 2.0 or higher)
- **Java 17** (if running locally without Docker)
- **Maven 3.6+** (if running locally without Docker)

## Quick Start

### 1. Clone or Navigate to the Project

```bash
cd /home/danilo.nicioka/uchi/dattebayo-pos
```

### 2. Start the System with Docker Compose

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Build and start the Spring Boot backend
- Create necessary database tables automatically
- Seed initial menu items

### 3. Access the Application

Once the containers are running (wait about 30-60 seconds for the backend to start):

- **Order Taking Interface**: http://localhost:8080
- **Kitchen Display System**: http://localhost:8080/kitchen
- **REST API**: http://localhost:8080/api

### 4. Stop the System

```bash
docker-compose down
```

To also remove volumes (database data):

```bash
docker-compose down -v
```

## Usage Guide

### Taking Orders

1. Open the order interface at http://localhost:8080
2. Enter the table number
3. Click on menu items to add them to the order
4. Use category tabs to filter menu items
5. Add special instructions if needed
6. Click "Place Order" to submit

### Kitchen Display

1. Open the kitchen display at http://localhost:8080/kitchen
2. View all pending and preparing orders
3. Update order status:
   - **Start Preparing**: Move order from Pending to Preparing
   - **Mark Ready**: Move order from Preparing to Ready
   - **Complete**: Mark order as completed (removes from kitchen display)
4. The display auto-refreshes every 5 seconds

### Order Status Flow

```
PENDING → PREPARING → READY → COMPLETED
```

- **PENDING**: Order just placed, waiting for kitchen
- **PREPARING**: Kitchen is actively preparing the order
- **READY**: Order is ready to be served
- **COMPLETED**: Order has been served/completed

## API Endpoints

### Orders API

- `GET /api/orders` - Get all orders
- `GET /api/orders/kitchen` - Get kitchen orders (PENDING and PREPARING)
- `GET /api/orders/status/{status}` - Get orders by status
- `GET /api/orders/{id}` - Get order by ID
- `POST /api/orders` - Create new order
- `PUT /api/orders/{id}/status?status={status}` - Update order status

### Menu API

- `GET /api/menu` - Get all menu items
- `GET /api/menu/available` - Get available menu items
- `GET /api/menu/category/{category}` - Get items by category
- `GET /api/menu/categories` - Get all categories
- `GET /api/menu/{id}` - Get menu item by ID
- `POST /api/menu` - Create menu item
- `PUT /api/menu/{id}` - Update menu item
- `DELETE /api/menu/{id}` - Delete menu item

## Database Schema

### Menu Items
- `id` (Long): Primary key
- `name` (String): Item name
- `description` (String): Item description
- `price` (Double): Item price
- `category` (String): Item category
- `available` (Boolean): Availability status

### Orders
- `id` (Long): Primary key
- `table_number` (String): Table identifier
- `status` (Enum): Order status (PENDING, PREPARING, READY, COMPLETED)
- `created_at` (Timestamp): Order creation time
- `updated_at` (Timestamp): Last update time
- `notes` (String): Order notes

### Order Items
- `id` (Long): Primary key
- `order_id` (Long): Foreign key to orders
- `menu_item_id` (Long): Foreign key to menu_items
- `quantity` (Integer): Item quantity
- `price` (Double): Price at time of order
- `special_instructions` (String): Special instructions

## Customization

### Adding Menu Items

You can add menu items in several ways:

1. **Via API**: Use POST `/api/menu` endpoint
2. **Via Database**: Insert directly into PostgreSQL
3. **Via Code**: Modify `DataInitializer.java` to add more sample items

### Modifying Categories

Categories are automatically extracted from menu items. To add new categories, simply create menu items with new category names.

### Changing Ports

To change the application port, modify:
- `docker-compose.yml`: Update port mapping `"8080:8080"` to your desired port
- `application.properties`: Update `server.port=8080`

## Troubleshooting

### Backend won't start

1. Check if PostgreSQL is healthy: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Ensure port 8080 is not in use by another application

### Database connection issues

1. Verify PostgreSQL is running: `docker-compose ps postgres`
2. Check database credentials in `application.properties` and `docker-compose.yml`
3. Ensure backend waits for PostgreSQL: Check `depends_on` in docker-compose.yml

### Menu items not showing

1. Check if DataInitializer ran: Check backend logs for initialization messages
2. Verify database connection
3. Check if menu items exist in database: Connect to PostgreSQL and query `menu_items` table

## Development

### Running Locally (without Docker)

1. Start PostgreSQL manually or use Docker for database only:
   ```bash
   docker-compose up -d postgres
   ```

2. Update `application.properties` to point to local PostgreSQL

3. Run the Spring Boot application:
   ```bash
   cd backend
   mvn spring-boot:run
   ```

### Building the Backend

```bash
cd backend
mvn clean package
```

### Viewing Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f postgres
```

## Future Enhancements

Potential features you might want to add:

- User authentication and roles
- Order history and reports
- Table management
- Receipt printing
- Real-time updates using WebSockets
- Mobile-friendly interface
- Multi-language support

## License

See LICENSE file for details.

## Support

For issues or questions, check the logs first:
```bash
docker-compose logs backend
```

---

**Enjoy your Restaurant POS System! 🍽️**
