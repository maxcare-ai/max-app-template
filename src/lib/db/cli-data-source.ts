import "reflect-metadata";
import { DataSource } from "typeorm";
import { config } from "dotenv";

config({ path: ".env.local" });

export default new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [
    // Add your entities here, e.g.:
    // MyEntity,
  ],
  migrations: ["src/lib/db/migrations/*.ts"],
  synchronize: false,
  logging: true,
});
