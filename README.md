Repositorio: https://github.com/apis26uade/API_1C_2026

Pre-requisitos

1- Java JDK 17 (se recomienda OpenJDK 17 o Temurin 17)
2- Maven 3.9+ (o usar el wrapper incluido ./mvnw, que no requiere Maven instalado)
3- MySQL 8.0+
4- Git

Paso 1 — Clonar el repositorio
git clone https://github.com/apis26uade/API_1C_2026.git
cd API_1C_2026/goated

Paso 2 — Configurar MySQL
mysql -u root -p
> CREATE DATABASE IF NOT EXISTS goated_db;
> exit;

Paso 3 — Verificar application.properties
El archivo está en src/main/resources/application.properties. Ajustar las credenciales si es necesario:
spring.datasource.url=jdbc:mysql://localhost:3306/goated_db?createDatabaseIfNotExist=true
spring.datasource.username=root
spring.datasource.password=root
application.security.jwt.secret-key=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
application.security.jwt.expiration=86400000

Paso 4 — Compilar y ejecutar
# Con Maven Wrapper (recomendado, no requiere Maven instalado):
./mvnw spring-boot:run
# Con Maven instalado:
mvn spring-boot:run

Paso 5 — Verificar que la app está corriendo
# La API queda disponible en:
http://localhost:8080
# Health check (Spring Actuator):
GET http://localhost:8080/actuator/health

Paso 6 — Crear primer usuario y obtener token
# Registrar usuario admin:
POST http://localhost:8080/auth/register
Content-Type: application/json
{
  "name": "Admin",
  "email": "admin@test.com",
  "password": "secret",
  "role": "ROLE_ADMIN"
}

# Login (guardar el token de la respuesta):
POST http://localhost:8080/auth/login
{
  "email": "admin@test.com",
  "password": "secret"
}

Paso 7 — Usar el token JWT en requests protegidos
# Agregar en el header de cada request protegido:
Authorization: Bearer <token_jwt>
# Ejemplo:
GET http://localhost:8080/products
Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

Colección Postman
El repositorio incluye el archivo goated/postman_collection.json. Importarlo en Postman para probar todos los endpoints directamente, con variables de entorno pre-configuradas para el token JWT.

Nota para producción (Externalizar la clave secreta JWT con variables de entorno)
APPLICATION_SECURITY_JWT_SECRET_KEY=<clave-base64-256-bits>
APPLICATION_SECURITY_JWT_EXPIRATION=86400000
