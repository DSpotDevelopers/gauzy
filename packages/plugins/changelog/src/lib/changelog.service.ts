import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindManyOptions } from 'typeorm';
import { IChangelog, IPagination } from '@gauzy/contracts';
import { CrudService } from '@gauzy/core';
import { Changelog } from './changelog.entity';
import { TypeOrmChangelogRepository } from './repository';

@Injectable()
export class ChangelogService extends CrudService<Changelog> {
	constructor(
		@InjectRepository(Changelog)
		private readonly typeOrmChangelogRepository: TypeOrmChangelogRepository
	) {
		super(typeOrmChangelogRepository);
	}

	/**
	 * GET all changelogs based on filter condition
	 *
	 * @param filter
	 * @returns
	 */
	public async findAllChangelogs(filter?: FindManyOptions<Changelog>): Promise<IPagination<IChangelog>> {
		return await this.findAll(filter || {});
	}
}
