const express = require('express');
const router = express.Router();
const fs = require('fs');
const { v4: uuidv4 } = require('uuid'); // Import the UUID library

const PRODUCTS_FILE = 'productos.json';

function readProductsFile() {
  return JSON.parse(fs.readFileSync(PRODUCTS_FILE, 'utf8'));
}

function writeProductsFile(products) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(products, null, 2));
}

router.get('/', (req, res) => {
  const limit = req.query.limit || 10;
  const products = readProductsFile();
  res.json(products.slice(0, limit));
});

router.get('/:pid', (req, res) => {
  const pid = req.params.pid;
  const products = readProductsFile();
  const product = products.find(product => product.id === pid);

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
});

router.post('/', (req, res) => {
  const newProduct = req.body;
  newProduct.id = uuidv4(); // Generate a unique ID
  const products = readProductsFile();
  products.push(newProduct);
  writeProductsFile(products);
  res.status(201).json(newProduct);
});

// Define PUT and DELETE routes for updating and deleting products if needed

module.exports = router;
