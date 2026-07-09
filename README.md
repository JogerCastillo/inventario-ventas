# Sistema de Inventario y Ventas

![CI](https://github.com/castiblanco/inventario_ventas/actions/workflows/ci.yml/badge.svg)
![Node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=node.js)
![Svelte](https://img.shields.io/badge/svelte-%5E5-FF3E00?logo=svelte)
![Tailwind](https://img.shields.io/badge/tailwind-v3-06B6D4?logo=tailwindcss)

Sistema web para control de inventario y registro de ventas con autenticacion por roles y API REST. Disenado para despliegue sencillo y operacion diaria en negocios comerciales.

## Stack

| Capa | Tecnologia |
| --- | --- |
| Frontend | SvelteKit 2, Svelte 5, Tailwind CSS 3 |
| Backend | Node.js, Express |
| Autenticacion | JWT, bcryptjs |
| Validacion | Zod |
| Seguridad | Helmet, express-rate-limit |
| Persistencia | Archivos JSON |
| Infraestructura | Docker, Render, Netlify, GitHub Actions |

## Funcionalidades

- CRUD de productos con SKU unico.
- Registro de ventas con actualizacion automatica de stock.
- KPIs: ingresos totales, stock minimo, productos activos.
- Autenticacion JWT con roles `admin` y `vendedor`.
- Respaldo automatico a almacenamiento local cuando la API no esta disponible.
- Rate limiting en inicio de sesion.
- Validacion de datos en servidor con Zod.
- Persistencia ligera en JSON (sin base de datos externa).

## Prerequisitos

- Node.js >= 18
- npm

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

### 3. Iniciar el frontend

```bash
cd inventario_ventas
npm install
npm run dev
```

El frontend se abre en `http://localhost:5173`. Editar la URL de la API en `src/lib/api.ts` para desarrollo local.

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
{ "name": "Producto", "sku": "PRD001", "category": "Electronica", "price": 100, "stock": 50, "minStock": 5 }
```

### Ventas (requiere autenticacion)

| Metodo | Ruta | Rol |
| --- | --- | --- |
| `GET` | `/api/sales` | admin, vendedor |
| `POST` | `/api/sales` | admin, vendedor |

```json
{ "productId": "uuid", "quantity": 3, "date": "2025-06-15" }
```

## Estructura del proyecto

```
inventario_ventas/
├── src/                   # Codigo fuente SvelteKit
│   ├── routes/
│   ├── lib/
│   │   ├── components/
│   │   ├── api.ts
│   │   ├── boot.ts
│   │   ├── stores.svelte.ts
│   │   └── types.ts
│   ├── app.css
│   └── app.html
├── static/
├── svelte.config.js
├── vite.config.ts
├── tailwind.config.ts
├── netlify.toml
├── Dockerfile              # Contenedor para Render (backend)
├── render.yaml             # Blueprint de Render
├── .github/workflows/ci.yml
└── backend/
    ├── package.json
    ├── .env.example
    ├── src/
    │   ├── server.js       # API REST
    │   └── store.js        # Persistencia en JSON
    ├── scripts/
    │   └── smoke-test.js
    └── data/
```

## Pruebas

```bash
cd backend
npm test
```

El CI ejecuta automaticamente el smoke test en cada push y pull request via GitHub Actions.

## Despliegue

- **Frontend**: Netlify (auto-detected por `netlify.toml`). La URL debe configurarse en `CORS_ORIGIN` del backend.
- **Backend**: Render como Web Service usando `render.yaml` (blueprint). Configurar las variables de entorno en el panel de Render.

## Licencia

MIT
