const express = require("express");
const next = require("next");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();
const port = parseInt(process.env.PORT || "3000", 10);

app.prepare().then(() => {
  const server = express();

  server.get("*", (req, res) => handle(req, res));

  server.listen(port, () => {
    console.log(`House of Eraya running on http://localhost:${port}`);
  });
});
