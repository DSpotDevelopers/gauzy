import { IHelpCenterAuthor } from '@gauzy/contracts';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TenantAwareCrudService } from '@gauzy/core';
import { isNotEmpty } from '@gauzy/common';
import { HelpCenterAuthor } from './help-center-author.entity';
import { TypeOrmHelpCenterAuthorRepository } from './repository';

@Injectable()
export class HelpCenterAuthorService extends TenantAwareCrudService<HelpCenterAuthor> {
	constructor(
		@InjectRepository(HelpCenterAuthor)
		private readonly typeOrmHelpCenterAuthorRepository: TypeOrmHelpCenterAuthorRepository
	) {
		super(typeOrmHelpCenterAuthorRepository);
	}

	async findByArticleId(articleId: string): Promise<HelpCenterAuthor[]> {
		return await this.typeOrmRepository
			.createQueryBuilder('knowledge_base_author')
			.where('knowledge_base_author.articleId = :articleId', {
				articleId
			})
			.getMany();
	}

	/**
	 *
	 * @param createInput
	 * @returns
	 */
	async createBulk(createInput: IHelpCenterAuthor[]) {
		return await this.typeOrmRepository.save(createInput);
	}

	/**
	 *
	 * @param ids
	 * @returns
	 */
	async deleteBulkByArticleId(ids: string[]) {
		if (isNotEmpty(ids)) {
			return await this.typeOrmRepository.delete(ids);
		}
	}

	/**
	 *
	 * @returns
	 */
	async getAll(): Promise<IHelpCenterAuthor[]> {
		return await this.typeOrmRepository.createQueryBuilder('knowledge_base_author').getMany();
	}
}
