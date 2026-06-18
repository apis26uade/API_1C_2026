# API_1C_2026 — Alma Boho

Monorepo del proyecto: **backend Spring Boot** (`goated/`) + **frontend React** (`frontend/`).

Repositorio: https://github.com/apis26uade/API_1C_2026

## Requisitos

1. Java JDK 17+
2. Maven 3.9+ (o usar `./mvnw` / `.\mvnw.cmd` incluido)
3. MySQL 8.0+
4. Node.js 18+ (frontend)
5. Git

## Estructura

```
API_1C_2026/
├── goated/          # API REST (Spring Boot + MySQL + JWT)
├── frontend/        # Tienda React + Vite
├── ENDPOINTS.txt    # Referencia de rutas de la API
└── README.md
```

## Inicio rápido

### 1. Clonar

```bash
git clone https://github.com/apis26uade/API_1C_2026.git
cd API_1C_2026
```

### 2. MySQL

```sql
CREATE DATABASE IF NOT EXISTS goated_db;
```

### 3. Backend

Copiar y ajustar credenciales:

```bash
cd goated
cp src/main/resources/application.properties.example src/main/resources/application.properties
```

Windows (PowerShell):

```powershell
Copy-Item src/main/resources/application.properties.example src/main/resources/application.properties
```

Levantar la API:

```bash
# Linux / macOS
./mvnw spring-boot:run

# Windows
.\mvnw.cmd spring-boot:run
```

API disponible en: **http://localhost:8080**

Health check: `GET http://localhost:8080/actuator/health`

### 4. Frontend

En otra terminal:

```bash
cd frontend
npm install
npm run dev
```

UI disponible en: **http://localhost:5173**

Opcional — URL de la API distinta al default:

```bash
# frontend/.env
VITE_API_URL=http://localhost:8080
```

### 5. Primer usuario admin

```http
POST http://localhost:8080/auth/register
Content-Type: application/json

{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "secret",
  "role": "ROLE_ADMIN"
}
```

Login:

```http
POST http://localhost:8080/auth/login
Content-Type: application/json

{
  "email": "admin@test.com",
  "password": "secret"
}
```

Usar el token en requests protegidos:

```
Authorization: Bearer <token_jwt>
```

## Datos iniciales

La base arranca vacía. Para probar la tienda:

1. Registrarse o crear un usuario admin (arriba)
2. Crear productos desde `/admin/productos` (requiere `ROLE_ADMIN`)
3. Opcional: cargar descuentos vía `POST /discounts` (admin)

## Postman

Importar `goated/postman_collection.json` para probar todos los endpoints.

## Endpoints

Ver `ENDPOINTS.txt` en la raíz del repo.

## Producción

Externalizar secretos con variables de entorno:

```
APPLICATION_SECURITY_JWT_SECRET_KEY=<clave-base64-256-bits>
APPLICATION_SECURITY_JWT_EXPIRATION=86400000
```

## Documentación del frontend

Ver [frontend/README.md](./frontend/README.md).
