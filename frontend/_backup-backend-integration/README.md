# Respaldo: integración con backend Spring

Copia de la lógica que llamaba a `http://localhost:8080` (o `VITE_API_URL`).
**No se usa en la entrega actual del front**; conservar para cuando vuelva el requerimiento de API.

## Archivos

| Archivo | Rol |
|---------|-----|
| `api.js` | Cliente HTTP: auth, productos, carrito, pedidos, descuentos |
| `AuthContext.jsx` | Login/registro vía API + token JWT en localStorage |
| `CartContext.jsx` | Carrito sincronizado con `/cart` y `/cart-products` |

## Cómo reactivar (resumen)

1. Restaurar `api.js` en `src/services/` (o fusionar con la capa local).
2. Restaurar los contextos o volver a importar desde `api.js` las funciones de red.
3. En páginas: `Products`, `ProductDetail`, `Cart`, `Checkout` — usar de nuevo los exports del cliente HTTP.
4. Variable de entorno: `VITE_API_URL=http://localhost:8080`
5. Levantar el backend Spring + MySQL antes de probar auth/carrito/checkout real.

## Endpoints que consumía el front

- `POST /auth/login`, `POST /auth/register`
- `GET /products`, `GET /products/:id`, `GET /categories`
- `GET /discounts/code/:code`
- `GET /cart/user/:userId`, `POST /cart?userId=`
- `GET/POST/PUT/DELETE /cart-products/...`
- `POST /orders?userId=&cartId=&discountCode=`
