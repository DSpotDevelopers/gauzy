import { Logger } from '@nestjs/common';
import * as path from 'path';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import { DatabaseTypeEnum, getLoggingOptions, getTlsOptions } from './database-helpers';

const logger = new Logger('GZY - Database');

logger.log(`NodeJs Version %s`, process.version);
logger.log('Is DEMO: %s', process.env.DEMO);
logger.log('NODE_ENV: %s', process.env.NODE_ENV);

const dbType = process.env.DB_TYPE || DatabaseTypeEnum.betterSqlite3;

logger.verbose(`Selected DB Type (DB_TYPE env var): ${dbType}`);
logger.verbose('DB Synchronize: ' + process.env.DB_SYNCHRONIZE);

let typeOrmConnectionConfig: TypeOrmModuleOptions;

// We set default pool size as 40. Usually PG has 100 connections max by default.
const dbPoolSize = process.env.DB_POOL_SIZE ? parseInt(process.env.DB_POOL_SIZE) : 40;

const dbConnectionTimeout = process.env.DB_CONNECTION_TIMEOUT ? parseInt(process.env.DB_CONNECTION_TIMEOUT) : 5000; // 5 seconds default

const idleTimeoutMillis = process.env.DB_IDLE_TIMEOUT ? parseInt(process.env.DB_IDLE_TIMEOUT) : 10000; // 10 seconds

const dbSlowQueryLoggingTimeout = process.env.DB_SLOW_QUERY_LOGGING_TIMEOUT
	? parseInt(process.env.DB_SLOW_QUERY_LOGGING_TIMEOUT)
	: 10000; // 10 seconds default

const dbSslMode = process.env.DB_SSL_MODE === 'true';

logger.verbose('DB ORM Pool Size: ' + dbPoolSize);
logger.verbose('DB Connection Timeout: ' + dbConnectionTimeout);
logger.verbose('DB Idle Timeout: ' + idleTimeoutMillis);
logger.verbose('DB Slow Query Logging Timeout: ' + dbSlowQueryLoggingTimeout);
logger.verbose('DB SSL Mode: ' + process.env.DB_SSL_MODE);
logger.verbose('DB SSL MODE ENABLE: ' + dbSslMode);

switch (dbType) {
	case DatabaseTypeEnum.mongodb:
		throw 'MongoDB not supported yet';

	case DatabaseTypeEnum.mysql:
		{
			// TypeORM DB Config (MySQL)
			const typeOrmMySqlOptions: MysqlConnectionOptions = {
				type: dbType,
				ssl: getTlsOptions(dbSslMode),
				host: process.env.DB_HOST || 'localhost',
				port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
				database: process.env.DB_NAME || 'mysql',
				username: process.env.DB_USER || 'root',
				password: process.env.DB_PASS || 'root',
				// forcing typeorm to use (mysql2) if both (mysql/mysql2) packages found, it prioritize to load (mysql)
				connectorPackage: 'mysql2',
				logging: getLoggingOptions(process.env.DB_LOGGING), // by default set to error only
				logger: 'advanced-console',
				// log queries that take more than 10 sec as warnings
				maxQueryExecutionTime: dbSlowQueryLoggingTimeout,
				synchronize: process.env.DB_SYNCHRONIZE === 'true', // We are using migrations, synchronize should be set to false.
				poolSize: dbPoolSize,
				migrations: ['src/modules/not-exists/*.migration{.ts,.js}'],
				entities: ['src/modules/not-exists/*.entity{.ts,.js}'],
				extra: {
					connectionLimit: dbPoolSize,
					maxIdle: dbPoolSize
				}
			};
			typeOrmConnectionConfig = typeOrmMySqlOptions;
		}
		break;

	case DatabaseTypeEnum.postgres:
		{
			// TypeORM DB Config (PostgreSQL)
			const typeOrmPostgresOptions: PostgresConnectionOptions = {
				type: dbType,
				ssl: getTlsOptions(dbSslMode),
				host: process.env.DB_HOST || 'localhost',
				port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 5432,
				database: process.env.DB_NAME || 'postgres',
				username: process.env.DB_USER || 'postgres',
				password: process.env.DB_PASS || 'root',
				logging: getLoggingOptions(process.env.DB_LOGGING), // by default set to error only
				logger: 'advanced-console',
				// log queries that take more than 10 sec as warnings
				maxQueryExecutionTime: dbSlowQueryLoggingTimeout,
				synchronize: process.env.DB_SYNCHRONIZE === 'true', // We are using migrations, synchronize should be set to false.
				uuidExtension: 'pgcrypto',
				migrations: ['src/modules/not-exists/*.migration{.ts,.js}'],
				entities: ['src/modules/not-exists/*.entity{.ts,.js}'],
				// See https://typeorm.io/data-source-options#common-data-source-options
				poolSize: dbPoolSize,
				extra: {
					// based on  https://node-postgres.com/api/pool max connection pool size
					max: dbPoolSize,
					minConnection: 0,
					maxConnection: dbPoolSize,
					poolSize: dbPoolSize,
					// connection timeout - number of milliseconds to wait before timing out when connecting a new client
					connectionTimeoutMillis: dbConnectionTimeout,
					// number of milliseconds a client must sit idle in the pool and not be checked out
					// before it is disconnected from the backend and discarded
					idleTimeoutMillis: idleTimeoutMillis
				}
			};
			typeOrmConnectionConfig = typeOrmPostgresOptions;
		}
		break;

	case DatabaseTypeEnum.sqlite:
	case DatabaseTypeEnum.betterSqlite3:
		{
			// Determine if running from dist or source
			const isDist = __dirname.includes('dist');

			logger.verbose('Better Sqlite3 Path isDist: ->', isDist);
			logger.verbose('Better Sqlite3 Path process.cwd(): ->', process.cwd());
			logger.verbose('Better Sqlite3 Path __dirname: ->', __dirname);

			const dbPath = isDist
				? path.resolve(process.cwd(), 'apps/api/data/gauzy.sqlite3') // For dist structure
				: path.resolve(__dirname, '../../../../apps/api/data/gauzy.sqlite3'); // For src structure

			const sqlitePath = process.env.DB_PATH || dbPath;
			logger.verbose('Better Sqlite DB Path: ' + sqlitePath);


			// TypeORM DB Config (Better-SQLite3)
			const typeOrmBetterSqliteConfig: DataSourceOptions = {
				type: dbType,
				database: sqlitePath,
				logging: 'all',
				logger: 'file', // Removes console logging, instead logs all queries in a file ormlogs.log
				synchronize: process.env.DB_SYNCHRONIZE === 'true', // We are using migrations, synchronize should be set to false.
				prepareDatabase: (db) => {
					if (!process.env.IS_ELECTRON) {
						// Enhance performance
						db.pragma('journal_mode = WAL');
					}
				}
			};
			typeOrmConnectionConfig = typeOrmBetterSqliteConfig;
		}
		break;
}

/**
 * TypeORM DB connection configuration.
 */
export const dbTypeOrmConnectionConfig = typeOrmConnectionConfig;
