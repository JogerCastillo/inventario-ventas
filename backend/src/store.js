const fs = require('node:fs/promises');
const path = require('node:path');

const PRODUCTS_PATH = path.join(__dirname, '..', 'data', 'products.json');
const SALES_PATH = path.join(__dirname, '..', 'data', 'sales.json');

let writeQueue = Promise.resolve();

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.mkdir(path.dirname(filePath), { recursive: true });
      await fs.writeFile(filePath, '[]', 'utf8');
      return [];
    }

    return [];
  }
}

function queueWrite(filePath, payload) {
  writeQueue = writeQueue.then(() =>
    fs.writeFile(filePath, JSON.stringify(payload, null, 2), 'utf8')
  );

  return writeQueue;
}

async function readProducts() {
  return readJson(PRODUCTS_PATH);
}

async function readSales() {
  return readJson(SALES_PATH);
}

async function writeProducts(products) {
  await queueWrite(PRODUCTS_PATH, products);
}

async function writeSales(sales) {
  await queueWrite(SALES_PATH, sales);
}

module.exports = {
  readProducts,
  readSales,
  writeProducts,
  writeSales
};
