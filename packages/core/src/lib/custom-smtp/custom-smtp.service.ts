import { Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull } from 'typeorm';
import { ICustomSmtp, ICustomSmtpFindInput, IVerifySMTPTransport } from '@gauzy/contracts';
import { isEmpty, ISMTPConfig } from '@gauzy/common';
import { TenantAwareCrudService } from './../core/crud';
import { SMTPUtils } from './../email-send/utils';
import { CustomSmtp } from './custom-smtp.entity';
import { TypeOrmCustomSmtpRepository } from './repository';
import { Logger } from '../logger';

@Injectable()
export class CustomSmtpService extends TenantAwareCrudService<CustomSmtp> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(CustomSmtp)
		private readonly typeOrmCustomSmtpRepository: TypeOrmCustomSmtpRepository
	) {
		super(typeOrmCustomSmtpRepository);
	}

	/**
	 * GET SMTP settings for tenant/organization
	 *
	 * @param query
	 * @returns
	 */
	public async getSmtpSetting(query: ICustomSmtpFindInput): Promise<ICustomSmtp | ISMTPConfig> {
		try {
			const { organizationId } = query;
			return await this.findOneByOptions({
				where: {
					organizationId: isEmpty(organizationId) ? IsNull() : organizationId
				},
				order: {
					createdAt: 'DESC'
				}
			});
		} catch (error) {
			this.logger.error(`Error while getting SMTP settings: ${error}`);
			return SMTPUtils.defaultSMTPTransporter(false);
		}
	}

	/**
	 * Verifies SMTP configuration
	 *
	 * @param configuration
	 * @returns
	 */
	public async verifyTransporter(transport: IVerifySMTPTransport): Promise<boolean> {
		try {
			return !!(await SMTPUtils.verifyTransporter(transport));
		} catch (error) {
			this.logger.error(`Error while verifying nodemailer transport: ${error}`);
			return false;
		}
	}
}
