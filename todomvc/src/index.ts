import express, { Express, Request, Response } from "express";
import { Stl, NotFoundError, z } from "stainless";
import {
  addStlEndpointToExpress,
  stlExpressRouteHandler,
} from "@stl-api/express";
import * as crypto from "crypto";

import { ItemLoader as ItemLoaderSchema } from "../.stl-codegen/src/index";
import { typeSchemas } from "../.stl-codegen/index";

const app: Express = express();
app.use(express.json());

type Item = {
  completed: boolean;
  description: string;
  id: z.UUID;
};

const items = new Map<string, z.Out<Item>>();

app.get("/items/:id", (req, res) => {
  const id = req.params.id;
  const item = items.get(id);
  if (item) {
    res.send(JSON.stringify(item));
  } else {
    res.status(404).send("item with id not found");
  }
});

app.get("/items", (req, res) => {
  res.send(JSON.stringify([...items.values()]));
});

app.post("/items", (req, res) => {
  // Note: no validation here!
  const id = crypto.randomUUID();
  console.log("got body", req.body);
  const newItem = { id, ...req.body };
  items.set(id, newItem);
  res.send(JSON.stringify(newItem));
});

app.put("/items/:id", (req, res) => {
  const id = req.params.id;
  if (!items.has(id)) {
    res.status(404).send("item with id not found");
    return;
  }
  items.set(id, { ...req.body, id });
});

app.patch("/items/:id", (req, res) => {
  const id = req.params.id;
  const item = items.get(id);
  if (!item) {
    res.status(404).send("item with id not found");
    return;
  }

  const newItem = { ...item, ...req.body, id: item.id };

  items.set(id, newItem);
  res.send(JSON.stringify(newItem));
});

app.delete("/item/:id", (req, res) => {
  const id = req.params.id;
  if (!items.has(id)) {
    res.status(404).send("item with id not found");
    return;
  }

  items.delete(id);
});

app.listen(3000, () => {
  console.log("Server is running at http://localhost:3000");
});
