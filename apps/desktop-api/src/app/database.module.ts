import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Wakatime } from '@gauzy/plugin-integration-wakatime';

const coreEntities = [Wakatime];
const dbPath = process.env.GAUZY_USER_PATH ? `${process.env.GAUZY_USER_PATH}/gauzy.sqlite3` : '';

@Module({
	imports: [
		// TypeORM DB Config (SQLite3)
		TypeOrmModule.forRootAsync({
			useFactory: () => ({
				type: 'better-sqlite3',
				database: dbPath,
				keepConnectionAlive: true,
				logging: 'all',
				logger: 'file', //Removes console logging, instead logs all queries in a file ormlogs.log
				synchronize: true,
				entities: coreEntities
			})
		}),
	]
})
export class DatabaseModule { }
