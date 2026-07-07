# Sistema de Inventario y Ventas

Solución para control de inventario y ventas con interfaz web, autenticación por roles y API REST. Diseñada para despliegue sencillo, demostración comercial y mantenimiento claro.

## Funcionalidades
- Gestión de productos con SKU único.
- Registro de ventas con actualización automática de stock.
- Indicadores operativos y comerciales.
- Autenticación JWT con roles `admin` y `vendedor`.
- Persistencia ligera en archivos JSON para facilitar despliegues sin base de datos externa.

## Estructura
- `Dockerfile` — contenedor de la API para Render.
- `index.html` — interfaz principal.
- `css/styles.css` — estilos.
- `js/app.js` — lógica de cliente.
- `backend/src/server.js` — API REST.
- `backend/src/store.js` — persistencia local.
- `backend/scripts/smoke-test.js` — validación automática del backend.
- `backend/.env.example` — plantilla de variables de entorno.

## Ejecución local
1. Crear `backend/.env` a partir de `backend/.env.example`.
2. Definir `JWT_SECRET` con un valor fuerte.
3. Instalar dependencias en `backend`.
4. Iniciar la API con `npm start`.
5. Abrir `index.html` en el navegador o servirlo desde un hosting estático.

## Pruebas
```powershell
cd backend
npm test
```

## Despliegue
- Frontend: Netlify o un hosting estático similar.
- Backend: Render como Web Service usando `render.yaml`.
- En Render, crear el servicio desde el blueprint del repositorio para evitar un despliegue Static Site.
- Configurar en el host: `JWT_SECRET`, `ADMIN_PASSWORD`, `VENDEDOR_PASSWORD`, `ADMIN_EMAIL`, `VENDEDOR_EMAIL` y, si se desea, `CREATE_DEV_USERS`, `BCRYPT_ROUNDS` y `CORS_ORIGIN`.
- `CORS_ORIGIN` acepta una o varias URLs separadas por coma (por defecto `*`). En produccion usa la URL de Netlify.

## Seguridad
- `backend/.env` permanece fuera del repositorio.
- `backend/.env.example` solo documenta variables, no secretos reales.
- Las credenciales de prueba no deben publicarse en el frontend ni en el repositorio.
