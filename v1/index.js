const express = require("express");
const { x } = require("joi");
const app = express();
const Joi = require("joi");
const pino = require("pino")();
const pinoHttp = require("pino-http");

app.use(express.json());
app.use(pinoHttp());

let products = [
  {
    id: 1,
    description: "Product 1",
    price: 10.99,
  },
  {
    id: 2,
    description: "Product 2",
    price: 19.99,
  },
  {
    id: 3,
    description: "Product 3",
    price: 25.49,
  },
  {
    id: 4,
    description: "Product 4",
    price: 14.99,
  },
  {
    id: 5,
    description: "Product 5",
    price: 8.75,
  },
];

const productsSchema = Joi.object({
  id: Joi.number().required(),
  description: Joi.string().required(),
  price: Joi.number().required(),
});

app.get("/products", (req, res) => {
  res.status(200).json(products);
});

app.get("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const product = products.find((p) => p.id === productId);

  if (!product) {
    return res.status(404).json({ mensagem: "Produto não encontrado" });
  }

  res.json(product);
});

app.post("/products", (req, res) => {
  const newProduct = req.body;

  const { error } = productsSchema.validate(newProduct);

  if (error) {
    return res.status(400).json({ mensagem: error.details[0].message });
  }
  products.push(newProduct);

  res.status(201).json(newProduct);
});

app.put("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const updatedProduct = req.body;

  const { error } = productsSchema.validate(updatedProduct);

  if (error) {
    pino.error("Error validating product data:", error);
    return res.status(400).json({ mensagem: error.details[0].message });
  }

  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex === -1) {
    pino.warn("Product not found for ID:", productId);
    return res.status(404).json({ mensagem: "Produto não encontrado" });
  }

  products[productIndex] = { ...products[productIndex], ...updatedProduct };

  pino.info("Product updated:", products[productIndex]);

  res.json(products[productIndex]);
});

app.delete("/products/:id", (req, res) => {
  const productId = parseInt(req.params.id);

  products = products.filter((p) => p.id !== productId);

  res.json({ mensagem: "Produto excluído com sucesso" });
});

app.listen(3000, () => {
  console.log("server is running (express)");
});
