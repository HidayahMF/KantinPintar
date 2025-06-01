import app, { ensureDBConnected } from "./api/index.js";

const port = process.env.PORT || 4000;

const startServer = async () => {
  await ensureDBConnected(); // pastikan database connect
  app.listen(port, () => {
    console.log(`🚀 Server running at http://localhost:${port}`);
  });
};

startServer();
