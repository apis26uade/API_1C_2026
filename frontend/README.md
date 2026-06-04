# Frontend - Tienda Online React + Vite

Aplicación web de comercio electrónico desarrollada con React y Vite. Permite navegar por productos, ver detalles, gestionar el carrito de compras y completar el proceso de checkout.

## Tecnologías utilizadas

- **React 19** - Librería de interfaz de usuario
- - **Vite 8** - Bundler y servidor de desarrollo
  - - **React Router DOM 7** - Navegación entre vistas (SPA)
   
    - ## Estructura del proyecto
   
    - ```
      frontend/
      ├── public/              # Archivos estáticos públicos
      ├── src/
      │   ├── assets/          # Imágenes y recursos estáticos
      │   ├── components/      # Componentes reutilizables
      │   │   ├── Footer.jsx
      │   │   ├── Icons.jsx
      │   │   ├── Navbar.jsx
      │   │   ├── ProductCard.jsx
      │   │   └── SectionTitle.jsx
      │   ├── context/         # Contextos globales de React
      │   ├── data/            # Datos estáticos / mock data
      │   ├── pages/           # Vistas principales
      │   │   ├── Cart.jsx
      │   │   ├── Checkout.jsx
      │   │   ├── Contact.jsx
      │   │   ├── Home.jsx
      │   │   ├── Login.jsx
      │   │   ├── NotFound.jsx
      │   │   ├── ProductDetail.jsx
      │   │   ├── Products.jsx
      │   │   └── Register.jsx
      │   ├── services/        # Llamadas a la API
      │   ├── App.jsx          # Componente raíz con rutas
      │   ├── App.css
      │   ├── index.css
      │   └── main.jsx
      ├── index.html
      ├── package.json
      └── vite.config.js
      ```

      ## Navegación entre vistas

      | Ruta | Vista |
      |------|-------|
      | `/` | Inicio (Home) |
      | `/productos` | Catálogo de productos |
      | `/catalogo` | Catálogo de productos (alias) |
      | `/detalle/:id` | Detalle de producto |
      | `/producto/:id` | Detalle de producto (alias) |
      | `/carrito` | Carrito de compras |
      | `/checkout` | Proceso de pago |
      | `/contacto` | Contacto |
      | `/login` | Inicio de sesión |
      | `/registro` | Registro de usuario |
      | `*` | 404 - Página no encontrada |

      ## Instrucciones para ejecutar el proyecto

      ### Requisitos previos

      - Node.js (versión 18 o superior)
      - - npm (incluido con Node.js)
       
        - ### Pasos
       
        - 1. **Clonar el repositorio**
         
          2. ```bash
             git clone https://github.com/apis26uade/API_1C_2026.git
             cd API_1C_2026/frontend
             ```

             2. **Instalar dependencias**
            
             3. ```bash
                npm install
                ```

                3. **Iniciar el servidor de desarrollo**
               
                4. ```bash
                   npm run dev
                   ```

                   4. **Abrir en el navegador**
                  
                   5. El proyecto estará disponible en: `http://localhost:5173`
                  
                   6. ### Otros comandos disponibles
                  
                   7. ```bash
                      npm run build      # Compilar para producción
                      npm run preview    # Vista previa de la build de producción
                      npm run lint       # Ejecutar ESLint
                      ```
