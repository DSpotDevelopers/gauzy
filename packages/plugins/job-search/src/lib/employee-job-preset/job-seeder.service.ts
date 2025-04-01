import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { environment } from '@gauzy/config';
import { ConnectionEntityManager, SeedDataService, Logger } from '@gauzy/core';
import { createDefaultJobSearchCategories } from './job-search-category/job-search-category.seed';
import { createDefaultJobSearchOccupations } from './job-search-occupation/job-search-occupation.seed';

/**
 * Service dealing with help center based operations.
 *
 * @class
 */
@Injectable()
export class JobSeederService {
	@Logger()
	private readonly logger: NestLogger;

	/**
	 * Create an instance of class.
	 *
	 * @constructs
	 *
	 */
	constructor(
		private readonly connectionEntityManager: ConnectionEntityManager,
		private readonly seeder: SeedDataService
	) {}

	/**
	 * Seeds job data into the database.
	 *
	 * This function seeds default job search categories and occupations using the provided connection,
	 * tenant, and default organization. It logs the seeding process and any errors encountered.
	 */
	public async seedDefaultJobsData(): Promise<void> {
		try {
			// Log the start of the seeding process
			this.logger.log(`🌱 SEEDING ${environment.production ? 'PRODUCTION' : ''} JOBS DATABASE...`);

			// Seed default job search categories
			await this.seeder.tryExecute(
				'Default Job Search Categories',
				createDefaultJobSearchCategories(
					this.connectionEntityManager.rawConnection,
					this.seeder.tenant,
					this.seeder.defaultOrganization
				)
			);

			// Seed default job search occupations
			await this.seeder.tryExecute(
				'Default Job Search Occupations',
				createDefaultJobSearchOccupations(
					this.connectionEntityManager.rawConnection,
					this.seeder.tenant,
					this.seeder.defaultOrganization
				)
			);

			// Log the completion of the seeding process
			this.logger.log(`✅ SEEDED ${environment.production ? 'PRODUCTION' : ''} JOBS DATABASE`);
		} catch (error) {
			// Log any errors encountered during the seeding process
			this.logger.error(`Error while job data seeding: ${error}`);
		}
	}
}
