import * as dotenv from 'dotenv';
dotenv.config();

import { Logger } from '@nestjs/common';

import * as path from 'path';
import {
	DEFAULT_API_HOST,
	DEFAULT_API_PORT,
	DEFAULT_API_BASE_URL,
	DEFAULT_GRAPHQL_API_PATH,
	ApplicationPluginConfig
} from '@gauzy/common';
import { dbTypeOrmConnectionConfig } from './database';

const logger = new Logger('GZY - Default Config');

logger.verbose(`Working directory: ${process.cwd()}`);

const assetPath = path.join(process.cwd(), 'apps', 'api', 'src', 'assets');
const assetPublicPath = path.join(process.cwd(), 'apps', 'api', 'public');

logger.verbose(`AssetPath: ${assetPath}`);
logger.verbose(`AssetPublicPath: ${assetPublicPath}`);

/**
 * Application plugin default configuration
 */
export const defaultConfiguration: ApplicationPluginConfig = {
	apiConfigOptions: {
		host: process.env.API_HOST || DEFAULT_API_HOST,
		port: process.env.API_PORT || DEFAULT_API_PORT,
		baseUrl: process.env.API_BASE_URL || DEFAULT_API_BASE_URL,
		middleware: [],
		graphqlConfigOptions: {
			path: DEFAULT_GRAPHQL_API_PATH,
			playground: true,
			debug: true,
			apolloServerPlugins: []
		}
	},
	dbConnectionOptions: {
		retryAttempts: 100,
		retryDelay: 3000,
		migrationsTransactionMode: 'each', // Run migrations automatically in each transaction. i.e."all" | "none" | "each"
		migrationsRun: process.env.DB_SYNCHRONIZE === 'true' ? false : true, // Run migrations automatically if we don't do DB_SYNCHRONIZE
		...dbTypeOrmConnectionConfig
	},
	plugins: [],
	customFields: {
		Employee: [],
		Organization: [],
		OrganizationProject: [],
		Tag: [],
		Tenant: [],
		User: []
	},
	authOptions: {
		expressSessionSecret: process.env.EXPRESS_SESSION_SECRET || 'gauzy',
		userPasswordBcryptSaltRounds: 12,
		jwtSecret: process.env.JWT_SECRET || 'secretKey'
	},
	assetOptions: {
		assetPath: assetPath,
		assetPublicPath: assetPublicPath
	}
};
