import type { Knex } from "knex";
import dotenv from "dotenv";
import path from "path";

dotenv.config();

const config: { [key: string]: Knex.Config } = {
    development: {
        client: "postgresql",
        connection: {
            host: process.env.DB_HOST || "localhost",
            port: Number(process.env.DB_PORT) || 5432,
            database: process.env.DB_NAME || "plims_db",
            user: process.env.DB_USER || "plims_user",
            password: process.env.DB_PASSWORD || "plims_password",
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            directory: path.join(__dirname, "src", "migrations"),
            extension: "ts"
        },
        seeds: {
            directory: path.join(__dirname, "src", "seeds"),
            extension: "ts"
        }
    }
};

export default config;
