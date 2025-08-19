import { Kysely, SqliteDialect } from 'kysely';
import Database from 'better-sqlite3';
import path from 'path';

export interface DatabaseSchema {
  departments: {
    id: number;
    name: string;
    description: string | null;
    created_at: string;
    updated_at: string;
  };
  doctors: {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    specialization: string | null;
    department_id: number | null;
    photo_url: string | null;
    schedule: string | null;
    created_at: string;
    updated_at: string;
  };
  services: {
    id: number;
    name: string;
    description: string | null;
    department_id: number | null;
    created_at: string;
    updated_at: string;
  };
}

const dataDirectory = process.env.DATA_DIRECTORY || './data';
const sqliteDb = new Database(path.join(dataDirectory, 'database.sqlite'));

export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: sqliteDb,
  }),
  log: ['query', 'error']
});
