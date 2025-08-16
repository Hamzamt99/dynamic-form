// src/server.ts
import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import routes from "./routes";
import { ensureDB } from "./config/database";
import { seedIfEmpty } from "./modules/dynamic-forms/queries";
dotenv.config();

export const startServer = async () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use("/api", routes);

  try {
    console.log('before the db');
    
    await ensureDB();
    await seedIfEmpty();
    console.log("DB connected");

    const PORT = Number(process.env.PORT) || 3001;
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("DB connection error", err);
    process.exit(1);
  }
};
