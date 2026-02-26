import "reflect-metadata";
import { DataSource } from "typeorm";

let _dataSource: DataSource | null = null;
let _initPromise: Promise<DataSource> | null = null;

function getOrCreateDataSource(): DataSource {
  if (!_dataSource) {
    _dataSource = new DataSource({
      type: "postgres",
      url: process.env.DATABASE_URL,
      entities: [
        // Add your entities here, e.g.:
        // MyEntity,
      ],
      migrations: [__dirname + "/migrations/*.{ts,js}"],
      synchronize: false,
      logging: ["error"],
      connectTimeoutMS: 5000,
      extra: { connectionTimeoutMillis: 5000, query_timeout: 10000 },
    });
  }
  return _dataSource;
}

export async function getDataSource(): Promise<DataSource> {
  if (_initPromise) return _initPromise;
  _initPromise = (async () => {
    const ds = getOrCreateDataSource();
    if (!ds.isInitialized) {
      await ds.initialize();
    }
    return ds;
  })();
  return _initPromise;
}

export const AppDataSource = getOrCreateDataSource();
