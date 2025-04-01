import { forwardRef, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@gauzy/config';
import { SeedDataService } from '../core/seeds/seed-data.service';
import { UserService } from '../user/user.service';

@Injectable()
export class AppService {
	public count = 0;
	private readonly logger = new Logger(`GZY - ${AppService.name}`);

	constructor(
		@Inject(forwardRef(() => SeedDataService))
		private readonly seedDataService: SeedDataService,

		@Inject(forwardRef(() => UserService))
		private readonly userService: UserService,

		@Inject(forwardRef(() => ConfigService))
		private readonly configService: ConfigService
	) {}

	/**
	 * Seed DB if no users exists (for simplicity and safety we only re-seed DB if no users found)
	 * TODO: this should actually include more checks, e.g. if schema migrated and many other things
	 */
	async seedDBIfEmpty() {
		this.count = await this.userService.countFast();
		this.logger.verbose(`Found ${this.count} users in DB`);
		if (this.count === 0) {
			await this.seedDataService.runDefaultSeed(true);
		}
	}

	/*
	 * Seed DB for Demo server
	 */
	async executeDemoSeed() {
		if (this.count === 0 && this.configService.get('demo') === true) {
			this.seedDataService.executeDemoSeed();
		}
	}
}
