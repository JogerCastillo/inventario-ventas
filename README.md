# Sistema de Inventario y Ventas

![CI](https://github.com/castiblanco/inventario_ventas/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js)

Sistema web para control de inventario y registro de ventas con autenticacion por roles y API REST. Disenado para despliegue sencillo y operacion diaria en negocios comerciales.

## Stack

| Capa | Tecnologia |
| --- | --- |
| Frontend | HTML, CSS, JavaScript vanilla |
| Backend | Node.js, Express |
| Autenticacion | JWT, bcryptjs |
| Validacion | Zod |
| Seguridad | Helmet, express-rate-limit |
| Persistencia | Archivos JSON |
| Infraestructura | Docker, Render, GitHub Actions |

## Funcionalidades

- CRUD de productos con SKU unico.
- Registro de ventas con actualizacion automatica de stock.
- KPIs: ingresos totales, margen promedio, productos mas vendidos, stock minimo.
- Autenticacion JWT con roles `admin` y `vendedor`.
- Rate limiting en inicio de sesion.
- Validacion de datos en servidor con Zod.
- Persistencia ligera en JSON (sin base de datos externa).

## Prerequisitos

- Node.js >= 18
- npm
- Docker y Docker Compose (opcional)

## Empezar

### 1. Clonar y configurar

```bash
git clone https://github.com/castiblanco/inventario_ventas.git
cd inventario_ventas/backend
cp .env.example .env
```

Editar `backend/.env` y definir al menos `JWT_SECRET` con un valor seguro. Si se desea crear usuarios de prueba al iniciar, establecer `CREATE_DEV_USERS=true` y definir las contrasenas correspondientes.

### 2. Iniciar el backend

```bash
cd backend
npm install
npm start
```

La API corre en `http://localhost:4100`.

### 3. Abrir el frontend

Servir `index.html` desde cualquier servidor estatico o simplemente abrirlo directamente en el navegador.

Para desarrollo local, editar `API_BASE_URL` en `js/app.js` para que apunte a `http://localhost:4100/api`.

### Con Docker

```bash
docker compose up --build
```

Esto levanta el backend en `:4100` y un servidor Nginx con el frontend en `:8080`.

## Variables de entorno

Todas se definen en `backend/.env`.

| Variable | Requerida | Descripcion |
| --- | --- | --- |
| `PORT` | No (default: 4100) | Puerto del servidor |
| `JWT_SECRET` | **Si** | Clave secreta para firmar tokens JWT |
| `BCRYPT_ROUNDS` | No (default: 10) | Rondas de hashing de bcrypt |
| `CREATE_DEV_USERS` | No (default: false) | Crear usuarios de prueba al iniciar |
| `ADMIN_EMAIL` | No | Correo del usuario admin |
| `ADMIN_PASSWORD` | Condicional | Contrasena del admin (requerida si `CREATE_DEV_USERS=true`) |
| `VENDEDOR_EMAIL` | No | Correo del usuario vendedor |
| `VENDEDOR_PASSWORD` | Condicional | Contrasena del vendedor (requerida si `CREATE_DEV_USERS=true`) |
| `CORS_ORIGIN` | No (default: `*`) | Origen(es) permitidos separados por coma |

## API

### Salud

```
GET /api/health
```

### Autenticacion

```
POST /api/auth/login
Content-Type: application/json

{ "email": "...", "password": "..." }

Respuesta: { "token": "...", "user": { "id", "name", "email", "role" } }
```

```
GET /api/auth/me
Authorization: Bearer <token>
```

### Productos (requiere autenticacion)

| Metodo | Ruta | Rol |
| --- | --- | --- |
| `GET` | `/api/products` | admin, vendedor |
| `POST` | `/api/products` | admin |
| `PUT` | `/api/products/:id` | admin |
| `DELETE` | `/api/products/:id` | admin |

```json
// POST/PUT /api/products
{ "name": "Producto", "sku": "PRD001", "category": "Electronica", "price": 100, "stock": 50, "minStock": 5 }
```

### Ventas (requiere autenticacion)

| Metodo | Ruta | Rol |
| --- | --- | --- |
| `GET` | `/api/sales` | admin, vendedor |
| `POST` | `/api/sales` | admin, vendedor |

```json
// POST /api/sales
{ "productId": "uuid", "quantity": 3, "date": "2025-06-15" }
```

## Estructura del proyecto

```
inventario_ventas/
├── index.html              # Interfaz principal
├── css/styles.css          # Estilos
├── js/app.js               # Logica del cliente
├── Dockerfile              # Contenedor para Render (backend)
├── docker-compose.yml      # Entorno local completo
├── render.yaml             # Blueprint de Render
├── .github/workflows/ci.yml
└── backend/
    ├── Dockerfile          # Contenedor para docker-compose
    ├── package.json
    ├── .env.example
    ├── src/
    │   ├── server.js       # API REST
    │   └── store.js        # Persistencia en JSON
    ├── scripts/
    │   └── smoke-test.js   # Prueba de integracion
    └── data/
        ├── products.json
        └── sales.json
```

## Pruebas

```powershell
cd backend
npm test
```

El CI ejecuta automaticamente el smoke test en cada push y pull request via GitHub Actions.

## Despliegue

- **Frontend**: Netlify o cualquier hosting estatico. La URL debe configurarse en `CORS_ORIGIN` del backend.
- **Backend**: Render como Web Service usando `render.yaml` (blueprint). Configurar las variables de entorno en el panel de Render.
- `CORS_ORIGIN` acepta una o varias URLs separadas por coma. En produccion usar la URL del frontend.

## Seguridad

- `backend/.env` no se incluye en el repositorio.
- `backend/.env.example` documenta las variables requeridas sin exponer secretos reales.
- Las credenciales de prueba no deben publicarse en el frontend ni en el repositorio.
- Helmet agrega headers de seguridad HTTP.
- Rate limiting protege el endpoint de login contra fuerza bruta.

## Licencia

MIT
