# Frontend — Alma Boho

Tienda de moda boho del proyecto **API_1C_2026**, desarrollada con **React 19** y **Vite**.

Integrada con el backend Spring Boot en `http://localhost:8080`.

## Funcionalidades

### Tienda (cliente)

- Home, catálogo con filtros y búsqueda (datos desde la API)
- Detalle de producto y productos relacionados
- Carrito sincronizado con el backend al iniciar sesión
- Checkout con confirmación de orden real (`POST /orders`)
- Mis pedidos e historial con detalle
- Registro e inicio de sesión (JWT)
- Toast al agregar productos al carrito (modal centrado)

### Administración

- Panel en `/admin` (solo `ROLE_ADMIN`)
- CRUD de productos contra la API
- Listado de pedidos y cambio de estado

### Métodos de pago (simulados en UI)

- Tarjeta de crédito / débito / transferencia
- No se procesa un cobro real; la orden se crea en el backend desde el carrito

## Requisitos

- Node.js 18+
- Backend `goated` corriendo en `:8080`
- MySQL con datos (productos, usuarios)

## Instalación y ejecución

```bash
cd frontend
npm install
npm run dev
```

Abrí `http://localhost:5173`.

### Variable de entorno (opcional)

```bash
# .env
VITE_API_URL=http://localhost:8080
```

## Scripts

| Comando           | Descripción                    |
|-------------------|--------------------------------|
| `npm run dev`     | Servidor de desarrollo         |
| `npm run build`   | Build de producción en `dist/` |
| `npm run preview` | Previsualizar el build         |
| `npm run lint`    | ESLint                         |

## Rutas

| Ruta | Descripción |
|------|-------------|
| `/` | Inicio |
| `/catalogo`, `/productos` | Catálogo |
| `/producto/:id` | Detalle de producto |
| `/carrito` | Carrito |
| `/checkout` | Checkout (requiere login) |
| `/pedidos` | Mis pedidos (requiere login) |
| `/pedidos/:id` | Detalle del pedido |
| `/login` | Iniciar sesión |
| `/registro` | Crear cuenta |
| `/contacto` | Contacto |
| `/admin/productos` | Gestión de productos (admin) |
| `/admin/pedidos` | Gestión de pedidos (admin) |

## Estructura del proyecto

```
frontend/
├── src/
│   ├── redux/
│   │   └── store.js        # Store Redux (auth, cart, products, orders)
│   ├── features/
│   │   ├── auth/
│   │   ├── cart/
│   │   ├── products/
│   │   └── orders/
│   ├── services/
│   │   ├── api.js          # Cliente HTTP (axios + JWT)
│   │   └── orders.js       # Constantes de pedidos
│   ├── context/
│   │   └── ToastContext.jsx  # Toasts y confirmaciones UI
│   ├── components/
│   │   ├── AsyncState.jsx  # Loading / error
│   │   ├── CartAddedModal.jsx
│   │   ├── CartSync.jsx
│   │   └── admin/
│   ├── pages/
│   │   └── admin/
│   └── data/
│       ├── products.js     # Imágenes estáticas de categorías
│       └── paymentMethods.js
├── index.html
├── vite.config.js
└── package.json
```

## Integración con el backend

| Módulo | Endpoints principales |
|--------|----------------------|
| Auth | `POST /auth/login`, `POST /auth/register` |
| Catálogo | `GET /products`, `GET /categories` |
| Carrito | `GET/POST /cart`, `/cart-products` |
| Pedidos | `GET /orders`, `POST /orders` |
| Descuentos | `GET /discounts/code/{code}` |

La UI muestra estados de **carga** y **error de conexión** mientras espera respuestas (no bloquea la interfaz).

## Persistencia local (solo invitado)

| Clave | Uso |
|-------|-----|
| `boho_auth` | Sesión JWT del usuario |
| `boho_cart` | Carrito de invitados (sin login) |

Con sesión activa, el carrito se sincroniza con el backend.

## Tipografías

- **Montserrat** — navegación y UI
- **Playfair Display** — títulos

## Repositorio

https://github.com/apis26uade/API_1C_2026
