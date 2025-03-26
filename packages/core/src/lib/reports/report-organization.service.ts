import { BadRequestException, Injectable, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IOrganization, IReport, UpdateReportMenuInput } from '@gauzy/contracts';
import { TenantAwareCrudService } from '../core/crud';
import { RequestContext } from '../core/context';
import { ReportOrganization } from './report-organization.entity';
import { Report } from './report.entity';
import { TypeOrmReportRepository, TypeOrmReportOrganizationRepository } from './repository';
import { Logger } from '../logger';

@Injectable()
export class ReportOrganizationService extends TenantAwareCrudService<ReportOrganization> {
	@Logger()
	protected readonly logger: NestLogger;

	constructor(
		@InjectRepository(ReportOrganization)
		private readonly typeOrmReportOrganizationRepository: TypeOrmReportOrganizationRepository,

		@InjectRepository(Report)
		private readonly typeOrmReportRepository: TypeOrmReportRepository
	) {
		super(typeOrmReportOrganizationRepository);
	}

	/**
	 * Updates an existing report menu entry if it exists, otherwise creates a new one.
	 * @param input The input containing data for updating or creating the report menu entry.
	 * @returns The updated or newly created report menu entry.
	 */
	async updateReportMenu(input: UpdateReportMenuInput): Promise<ReportOrganization> {
		try {
			const { reportId, organizationId } = input;
			const tenantId = RequestContext.currentTenantId() || input.tenantId;

			let reportOrganization = await this.findOneByWhereOptions({
				reportId,
				organizationId,
				tenantId
			});

			// If the report organization exists, update it with the input data
			reportOrganization = new ReportOrganization(Object.assign(reportOrganization, input));
			return await super.save(reportOrganization);
		} catch (error) {
			this.logger.error(`Error while updating report menu: ${error}`);
			// If the report organization doesn't exist, create a new one with the input data
			return await super.create(new ReportOrganization(input));
		}
	}

	/**
	 * Bulk create organization default reports menu.
	 *
	 * @param input - The organization input data.
	 * @returns A promise that resolves to an array of created ReportOrganization instances.
	 */
	async bulkCreateOrganizationReport(input: IOrganization): Promise<ReportOrganization[]> {
		try {
			const { id: organizationId, tenantId } = input;

			// Fetch reports from the database
			const reports: IReport[] = await this.typeOrmReportRepository.find();

			// Create ReportOrganization instances based on fetched reports
			const reportOrganizations: ReportOrganization[] = reports.map(
				(report: IReport) =>
					new ReportOrganization({
						report: { id: report.id },
						isEnabled: true,
						organizationId,
						tenantId
					})
			);

			// Save the created ReportOrganization instances to the database
			return await this.typeOrmReportOrganizationRepository.save(reportOrganizations);
		} catch (error) {
			this.logger.error(`Error while bulk creating organization reports: ${error}`);
			// Throw InternalServerErrorException if an error occurs
			throw new BadRequestException(error);
		}
	}
}
