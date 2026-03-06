import app from "./app";
import { PORT } from "./config";
import { connectDatabase } from "./database/mongodb";
import { initializeSocket } from "./socket";
import { createServer } from "http";

async function startServer() {
  await connectDatabase();

  const httpServer = createServer(app);
  initializeSocket(httpServer);

  httpServer.listen(PORT, () => {
    console.log(`Server: http://localhost:${PORT}`);
  });
}

startServer();
