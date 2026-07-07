require('dotenv').config();

const express = require('express');
const crypto = require('node:crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { z } = require('zod');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { readProducts, readSales, writeProducts, writeSales } = require('./store');

const app = express();
const PORT = process.env.PORT || 4100;
const JWT_SECRET = process.env.JWT_SECRET;
const TOKEN_TTL = '8h';
const BCRYPT_ROUNDS = Number(process.env.BCRYPT_ROUNDS || 10);
const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || 'admin@inventario.local').toLowerCase();
const VENDEDOR_EMAIL = (process.env.VENDEDOR_EMAIL || 'vendedor@inventario.local').toLowerCase();
const RAW_CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const ALLOWED_ORIGINS =
  RAW_CORS_ORIGIN === '*'
    ? '*'
    : RAW_CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
const ALLOW_ALL_ORIGINS = ALLOWED_ORIGINS === '*';

if (ALLOW_ALL_ORIGINS) {
  console.warn('CORS_ORIGIN is set to "*". For production, configure CORS_ORIGIN with your frontend URL.');
}

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET is required. Define it in backend/.env or the environment.');
}

const VALID_ROLES = ['admin', 'vendedor'];

function hashPassword(password) {
  return bcrypt.hashSync(password, BCRYPT_ROUNDS);
}

const CREATE_DEV_USERS = String(process.env.CREATE_DEV_USERS || '').toLowerCase() === 'true';
const seedUsers = [];

if (CREATE_DEV_USERS) {
  const adminPass = process.env.ADMIN_PASSWORD;
  const vendedorPass = process.env.VENDEDOR_PASSWORD;

  if (!adminPass || !vendedorPass) {
    console.warn('CREATE_DEV_USERS is enabled but ADMIN_PASSWORD or VENDEDOR_PASSWORD is missing.');
  } else {
    seedUsers.push(
      {
        id: 'u-admin-1',
        name: 'Admin Inventario',
        email: ADMIN_EMAIL,
        role: 'admin',
        passwordHash: hashPassword(adminPass)
      },
      {
        id: 'u-vendedor-1',
        name: 'Vendedor Inventario',
        email: VENDEDOR_EMAIL,
        role: 'vendedor',
        passwordHash: hashPassword(vendedorPass)
      }
    );
    console.info('Development users loaded from environment variables.');
  }
}

function resolveCorsOrigin(origin) {
  if (ALLOW_ALL_ORIGINS) {
    return '*';
  }
  if (!origin) {
    return '';
  }
  return ALLOWED_ORIGINS.includes(origin) ? origin : '';
}

function signToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    },
    JWT_SECRET,
    { expiresIn: TOKEN_TTL }
  );
}

function sanitizeUser(user) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'No autorizado.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
      name: payload.name
    };
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token invalido o expirado.' });
  }
}

function requireRole(roles) {
  return function guard(req, res, next) {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'No tienes permisos para esta accion.' });
    }
    next();
  };
}

const loginSchema = z.object({
  email: z.string().trim().email(),
  password: z.string().min(6).max(64)
});

const productSchema = z.object({
  name: z.string().trim().min(3).max(80),
  sku: z.string().trim().min(2).max(24),
  category: z.string().trim().min(2).max(40),
  price: z.number().min(0),
  stock: z.number().int().min(0),
  minStock: z.number().int().min(0)
});

const saleSchema = z.object({
  productId: z.string().trim().min(1),
  quantity: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/)
});

function sortProducts(items) {
  return items.sort((a, b) => a.name.localeCompare(b.name, 'es'));
}

function sortSales(items) {
  return items.sort((a, b) => {
    const left = new Date(`${a.date}T00:00:00`).getTime();
    const right = new Date(`${b.date}T00:00:00`).getTime();
    return right - left;
  });
}

// Security headers
app.use(helmet());

// CORS allowlist based on environment
app.use((req, res, next) => {
  const origin = req.headers.origin;
  const allowedOrigin = resolveCorsOrigin(origin);
  if (allowedOrigin) {
    res.header('Access-Control-Allow-Origin', allowedOrigin);
  }
  res.header('Vary', 'Origin');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Max-Age', '3600');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ ok: true, service: 'inventario-ventas-api', docs: '/api/health' });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, service: 'inventario-ventas-api', auth: true, roles: VALID_ROLES });
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos de inicio de sesion. Intenta de nuevo en 15 minutos.' }
});

app.post('/api/auth/login', loginLimiter, (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Credenciales invalidas.' });
  }

  const email = parsed.data.email.toLowerCase();
  const user = seedUsers.find((item) => item.email === email);

  if (!user || !bcrypt.compareSync(parsed.data.password, user.passwordHash)) {
    return res.status(401).json({ message: 'Correo o contrasena incorrectos.' });
  }

  const token = signToken(user);
  res.json({ token, user: sanitizeUser(user) });
});

app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

app.get('/api/products', requireAuth, async (req, res) => {
  try {
    const products = await readProducts();
    res.json(sortProducts(products));
  } catch (error) {
    res.status(500).json({ message: 'No se pudo consultar el inventario.' });
  }
});

app.post('/api/products', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Datos de producto invalidos.', issues: parsed.error.issues });
    }

    const products = await readProducts();
    const duplicated = products.some((item) => item.sku.toUpperCase() === parsed.data.sku.toUpperCase());

    if (duplicated) {
      return res.status(409).json({ message: 'El SKU ya existe en inventario.' });
    }

    const product = {
      id: crypto.randomUUID(),
      name: parsed.data.name,
      sku: parsed.data.sku.toUpperCase(),
      category: parsed.data.category,
      price: parsed.data.price,
      stock: parsed.data.stock,
      minStock: parsed.data.minStock,
      createdAt: new Date().toISOString()
    };

    products.push(product);
    await writeProducts(sortProducts(products));

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo crear el producto.' });
  }
});

app.put('/api/products/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const parsed = productSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Datos de producto invalidos.', issues: parsed.error.issues });
    }

    const products = await readProducts();
    const index = products.findIndex((item) => item.id === req.params.id);

    if (index === -1) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    const duplicate = products.some(
      (item) => item.id !== req.params.id && item.sku.toUpperCase() === parsed.data.sku.toUpperCase()
    );

    if (duplicate) {
      return res.status(409).json({ message: 'El SKU ya existe en inventario.' });
    }

    products[index] = {
      ...products[index],
      name: parsed.data.name,
      sku: parsed.data.sku.toUpperCase(),
      category: parsed.data.category,
      price: parsed.data.price,
      stock: parsed.data.stock,
      minStock: parsed.data.minStock
    };

    await writeProducts(sortProducts(products));
    res.json(products[index]);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo actualizar el producto.' });
  }
});

app.delete('/api/products/:id', requireAuth, requireRole(['admin']), async (req, res) => {
  try {
    const products = await readProducts();
    const sales = await readSales();

    const linkedSales = sales.some((sale) => sale.productId === req.params.id);
    if (linkedSales) {
      return res.status(409).json({ message: 'No puedes eliminar un producto con ventas registradas.' });
    }

    const nextProducts = products.filter((item) => item.id !== req.params.id);

    if (nextProducts.length === products.length) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    await writeProducts(nextProducts);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'No se pudo eliminar el producto.' });
  }
});

app.get('/api/sales', requireAuth, async (req, res) => {
  try {
    const sales = await readSales();
    res.json(sortSales(sales));
  } catch (error) {
    res.status(500).json({ message: 'No se pudo consultar el historial de ventas.' });
  }
});

app.post('/api/sales', requireAuth, requireRole(['admin', 'vendedor']), async (req, res) => {
  try {
    const parsed = saleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: 'Datos de venta invalidos.', issues: parsed.error.issues });
    }

    const products = await readProducts();
    const productIndex = products.findIndex((item) => item.id === parsed.data.productId);

    if (productIndex === -1) {
      return res.status(404).json({ message: 'Producto no encontrado.' });
    }

    const product = products[productIndex];

    if (parsed.data.quantity > product.stock) {
      return res.status(409).json({ message: 'La cantidad supera el stock disponible.' });
    }

    product.stock = product.stock - parsed.data.quantity;

    const sales = await readSales();
    const sale = {
      id: crypto.randomUUID(),
      productId: product.id,
      productName: product.name,
      quantity: parsed.data.quantity,
      unitPrice: product.price,
      total: product.price * parsed.data.quantity,
      date: parsed.data.date,
      createdAt: new Date().toISOString()
    };

    sales.push(sale);

    await writeProducts(sortProducts(products));
    await writeSales(sortSales(sales));

    res.status(201).json(sale);
  } catch (error) {
    res.status(500).json({ message: 'No se pudo registrar la venta.' });
  }
});

app.listen(PORT, () => {
  console.log(`API activa en http://localhost:${PORT}`);
});
