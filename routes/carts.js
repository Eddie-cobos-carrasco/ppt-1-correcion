const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Import the UUID library

const CARTS_FILE = 'carrito.json';
const PRODUCTS_FILE = 'productos.json';

function readCartsFile() {
  return JSON.parse(fs.readFileSync(CARTS_FILE, 'utf8'));
}

function writeCartsFile(carts) {
  fs.writeFileSync(CARTS_FILE, JSON.stringify(carts, null, 2));
}

function readProductsFile() {
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
}

function writeProductsFile(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

router.get('/', (req, res) => {
  const carts = readCartsFile();
  res.json(carts);
});

router.get('/:cid', (req, res) => {
  const cid = req.params.cid;
  const carts = readCartsFile();
  const cart = carts.find(cart => cart.id === cid);

  if (!cart) {
    return res.status(404).json({ message: 'Cart not found' });
  }

  res.json(cart);
});

router.post('/', (req, res) => {
  const newCart = {
    id: uuidv4(), // Generate a unique ID
    products: []
  };
  const carts = readCartsFile();
  carts.push(newCart);
  writeCartsFile(carts);
  res.status(201).json(newCart);
});

router.put('/:cid/products/:pid/:units', async (req, res) => {
  const cid = req.params.cid;
  const pid = req.params.pid;
  const units = parseInt(req.params.units);

  const carts = readCartsFile();
  const products = readProductsFile();
  const cart = carts.find(cart => cart.id === cid);
  const product = products.find(product => product.id === pid);

  if (!cart || !product) {
    return res.status(404).json({ message: 'Cart or product not found' });
  }

  if (product.stock < units) {
    return res.status(400).json({ message: 'Not enough stock' });
  }

  cart.products.push({ id: pid, units });
  product.stock -= units;
  writeCartsFile(carts);
  writeProductsFile(products);

  res.json(cart);
});

router.delete('/:cid/products/:pid/:units', async (req, res) => {
  const cid = req.params.cid;
  const pid = req.params.pid;
  const units = parseInt(req.params.units);

  const carts = readCartsFile();
  const products = readProductsFile();
  const cart = carts.find(cart => cart.id === cid);
  const product = products.find(product => product.id === pid);

  if (!cart || !product) {
    return res.status(404).json({ message: 'Cart or product not found' });
  }

  const cartProduct = cart.products.find(cp => cp.id === pid);
  if (!cartProduct) {
    return res.status(404).json({ message: 'Product not found in cart' });
  }

  if (cartProduct.units < units) {
    return res.status(400).json({ message: 'Not enough units in cart' });
  }

  cartProduct.units -= units;
  product.stock += units;

  if (cartProduct.units === 0) {
    cart.products = cart.products.filter(cp => cp.id !== pid);
  }

  writeCartsFile(carts);
  writeProductsFile(products);

  res.json(cart);
});

module.exports = router;
