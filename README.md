# Habit Tracker API

A simple REST API for registering users, creating habits, tracking daily or weekly completion, and viewing streak/history stats.

Built with:

- Bun
- Express
- PostgreSQL
- Drizzle ORM
- Redis
- JWT authentication (Jose)
- Swagger/OpenAPI docs

## API Docs

After the server is running, open:

```txt
http://localhost:8000/docs
```

Raw OpenAPI JSON:

```txt
http://localhost:8000/docs/openapi.json
```

## Prerequisites

Install these before running the project:

- Bun
- Docker and Docker Compose

## Environment Setup

Create a `.env` file from the example:

```bash
cp .env.example .env
```

Example local values:

```env
NODE_ENV=development
PORT=8000

POSTGRES_PASSWORD=postgres
POSTGRES_DB=habits

JWT_SECRET=your_32_char_secret_here

DATABASE_URL=postgresql://postgres:postgres@localhost:5432/habits

REDIS_HOST=localhost
REDIS_PORT=6379

RATE_LIMIT_WINDOW_SECONDS=300
RATE_LIMIT_MAX_REQUESTS=100

AUTH_RATE_LIMIT_WINDOW_SECONDS=900
AUTH_RATE_LIMIT_MAX_REQUESTS=100
```

Use a strong value for `JWT_SECRET` in real environments.

## Setup And Run

Install dependencies:

```bash
bun install
```
For local development, set up the database and Redis along with running tests:

```bash
bun run db:setup
```

Else:

Start PostgreSQL and Redis:

```bash
bun run docker:dev
```

Run database migrations:

```bash
bun run db:migrate
```

Seed the database:

```bash
bun run db:seed
```

Start the development server:

```bash
bun run dev
```

The API will run at:

```txt
http://localhost:8000
```

## Docker Setup

To run the app with Docker Compose:

```bash
docker compose up --build
```

This starts:

- API server
- PostgreSQL
- Redis
- Database migration container

Stop containers:

```bash
docker compose down
```

## Seeded Users

After running `bun run db:seed`, you can log in with:

| Email | Password |
|---|---|
| `john@example.com` | `password123` |
| `jane@example.com` | `password123` |
| `alex@example.com` | `password123` |

The seed also creates sample habits and tracking logs.

## JWT Usage

Register or log in to get a JWT token.

Then send the token on protected routes:

```http
Authorization: Bearer <token>
```

Example:

```bash
curl http://localhost:8000/api/v1/habits \
  -H "Authorization: Bearer <token>"
```

Protected routes return `401` if the token is missing, invalid, or logged out.

## Response Format

Success responses use:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success",
  "data": {}
}
```

Error responses use:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation Error",
  "errors": []
}
```

## API Routes

### Health

| Method | Route | Auth | Description |
|---|---|---:|---|
| `GET` | `/` | No | Welcome message |
| `GET` | `/health` | No | Server health check |
| `GET` | `/docs` | No | Swagger UI |
| `GET` | `/docs/openapi.json` | No | OpenAPI JSON |

### Auth

| Method | Route | Auth | Description |
|---|---|---:|---|
| `POST` | `/api/v1/auth/register` | No | Register user |
| `POST` | `/api/v1/auth/login` | No | Log in user |
| `POST` | `/api/v1/auth/logout` | Yes | Log out user and blacklist token |

### Habits

| Method | Route | Auth | Description |
|---|---|---:|---|
| `GET` | `/api/v1/habits` | Yes | List habits |
| `POST` | `/api/v1/habits` | Yes | Create habit |
| `GET` | `/api/v1/habits/:id` | Yes | Get one habit |
| `PUT` | `/api/v1/habits/:id` | Yes | Update habit |
| `DELETE` | `/api/v1/habits/:id` | Yes | Delete habit |
| `GET` | `/api/v1/habits/:id/stats` | Yes | Get habit stats |

### Tracking

| Method | Route | Auth | Description |
|---|---|---:|---|
| `POST` | `/api/v1/habits/:id/track` | Yes | Track habit for today |
| `GET` | `/api/v1/habits/:id/history` | Yes | Get habit history |

## Query Parameters

`GET /api/v1/habits`

| Name | Type | Default | Description |
|---|---|---:|---|
| `tag` | string | none | Filter habits by tag |
| `page` | number | `1` | Page number |
| `limit` | number | `10` | Items per page, max `20` |

`GET /api/v1/habits/:id/history`

| Name | Type | Default | Description |
|---|---|---:|---|
| `days` | number | `7` | Number of days to return, max `30` |

## Example Requests

### Register

```bash
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

Response:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "User registered successfully",
  "data": {
    "token": "<jwt-token>",
    "user": {
      "id": "7a0b7d56-f4a0-42fb-950e-3de16518409d",
      "email": "test@example.com",
      "createdAt": "2026-05-12T08:00:00.000Z"
    }
  }
}
```

### Login

```bash
curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
```

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "User logged in successfully",
  "data": {
    "token": "<jwt-token>",
    "user": {
      "id": "7a0b7d56-f4a0-42fb-950e-3de16518409d",
      "email": "john@example.com",
      "createdAt": "2026-05-12T08:00:00.000Z"
    }
  }
}
```

### Create Habit

```bash
curl -X POST http://localhost:8000/api/v1/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "name": "Drink Water",
    "description": "Drink 8 glasses of water",
    "frequency": "daily",
    "tags": ["health"],
    "reminderTime": "09:00"
  }'
```

Response:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Habit created successfully",
  "data": {
    "id": "2b3a5e18-d1af-4ac6-a508-4587f45342c1",
    "userId": "7a0b7d56-f4a0-42fb-950e-3de16518409d",
    "name": "Drink Water",
    "description": "Drink 8 glasses of water",
    "frequency": "daily",
    "tags": ["health"],
    "reminderTime": "09:00",
    "deletedAt": null,
    "createdAt": "2026-05-12T08:00:00.000Z",
    "updatedAt": "2026-05-12T08:00:00.000Z"
  }
}
```

### List Habits

```bash
curl "http://localhost:8000/api/v1/habits?page=1&limit=10&tag=health" \
  -H "Authorization: Bearer <token>"
```

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Habits retrieved successfully",
  "data": {
    "data": [
      {
        "id": "2b3a5e18-d1af-4ac6-a508-4587f45342c1",
        "userId": "7a0b7d56-f4a0-42fb-950e-3de16518409d",
        "name": "Drink Water",
        "description": "Drink 8 glasses of water",
        "frequency": "daily",
        "tags": ["health"],
        "reminderTime": "09:00",
        "deletedAt": null,
        "createdAt": "2026-05-12T08:00:00.000Z",
        "updatedAt": "2026-05-12T08:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 1,
      "totalPages": 1
    }
  }
}
```

### Track Habit

```bash
curl -X POST http://localhost:8000/api/v1/habits/2b3a5e18-d1af-4ac6-a508-4587f45342c1/track \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "note": "Completed after breakfast"
  }'
```

Response:

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Habit tracked successfully",
  "data": {
    "id": "901e9c08-486f-43d9-87a1-b521e80d6a0a",
    "habitId": "2b3a5e18-d1af-4ac6-a508-4587f45342c1",
    "userId": "7a0b7d56-f4a0-42fb-950e-3de16518409d",
    "date": "2026-05-12",
    "note": "Completed after breakfast",
    "createdAt": "2026-05-12T08:00:00.000Z"
  }
}
```

### Get Stats

```bash
curl http://localhost:8000/api/v1/habits/2b3a5e18-d1af-4ac6-a508-4587f45342c1/stats \
  -H "Authorization: Bearer <token>"
```

Response:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Habit stats retrieved successfully",
  "data": {
    "currentStreak": 5,
    "longestStreak": 12,
    "completionRate": 83
  }
}
```

### Error Example

Request without a token:

```bash
curl http://localhost:8000/api/v1/habits
```

Response:

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Unauthorized: No token provided"
}
```

## Data Model

This project uses PostgreSQL, not MongoDB.

### User

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `name` | text | Required |
| `email` | text | Required, unique |
| `password` | text | Hashed password |
| `createdAt` | timestamp | Created time |

### Habit

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `userId` | uuid | Owner user id |
| `name` | text | Required |
| `description` | text | Optional |
| `frequency` | enum | `daily` or `weekly` |
| `tags` | text array | Defaults to empty array |
| `reminderTime` | time | Optional, `HH:mm` |
| `deletedAt` | timestamp | Soft delete marker |
| `createdAt` | timestamp | Created time |
| `updatedAt` | timestamp | Updated time |

### Tracking Log

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key |
| `habitId` | uuid | Habit id |
| `userId` | uuid | User id |
| `date` | date | Tracked date |
| `note` | text | Optional |
| `createdAt` | timestamp | Created time |

Each habit can only have one tracking log per date.

## Useful Commands

```bash
bun run dev
bun run start
bun run test
bun run typecheck
bun run db:generate
bun run db:migrate
bun run db:push
bun run db:seed
```

## Notes

- Passwords are hashed before storage.
- JWTs expire after 7 days.
- Logout blacklists the current JWT in Redis.
- Habits are soft deleted with `deletedAt`.
- Swagger docs are available at `/docs`.
