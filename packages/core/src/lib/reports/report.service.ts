import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GetReportMenuItemsInput, IPagination, IReport } from '@gauzy/contracts';
import { CrudService } from '../core/crud';
import { RequestContext } from './../core/context';
import { Report } from './report.entity';
import { TypeOrmReportRepository } from './repository';

@Injectable()
export class ReportService extends CrudService<Report> {
	constructor(
		@InjectRepository(Report)
		private readonly typeOrmReportRepository: TypeOrmReportRepository
	) {
		super(typeOrmReportRepository);
	}

	/**
	 * Retrieves all reports for the specified organization and tenant, including whether they should be shown in the menu.
	 *
	 * @param filter The filter containing organization ID and tenant ID for retrieving reports.
	 * @returns A promise that resolves to an object containing paginated report items and total count.
	 */
	public async findAllReports(filter?: any): Promise<IPagination<Report>> {
		// Extract organizationId and tenantId from filter
		const { organizationId } = filter;
		const tenantId = RequestContext.currentTenantId() || filter.tenantId;

		// Fetch all reports and their associated organizations in a single query
		const qb = this.typeOrmRepository.createQueryBuilder('report');
		qb.setFindOptions({
			...(filter.relations ? { relations: filter.relations } : {})
		});
		qb.leftJoinAndSelect(
			'report.reportOrganizations',
			'ro',
			'ro.organizationId = :organizationId AND ro.tenantId = :tenantId AND ro.isEnabled = :isEnabled AND ro.isActive = :isActive AND ro.isArchived = :isArchived',
			{
				organizationId,
				tenantId,
				isEnabled: true,
				isActive: true,
				isArchived: false
			}
		);

		// Execute the query
		const [items, total] = await qb.getManyAndCount();

		// Map over items and set 'showInMenu' property based on menu item existence
		const reports = items.map((item) => {
			item.showInMenu = !!item.reportOrganizations.length; // true if there are reportOrganizations, false otherwise
			delete item.reportOrganizations; // Remove reportOrganizations from the report object
			return item;
		});

		return { items: reports, total: total };
	}

	/**
	 * Retrieves report menu items based on the provided options.
	 *
	 * @param input The input containing the organization ID and tenant ID for filtering report menu items.
	 * @returns A promise that resolves to an array of report menu items.
	 */
	public async getMenuItems(input: GetReportMenuItemsInput): Promise<IReport[]> {
		const { organizationId } = input;
		const tenantId = RequestContext.currentTenantId() || input.tenantId;

		const qb = this.typeOrmRepository.createQueryBuilder('report');
		qb.innerJoin(
			'report.reportOrganizations',
			'ro',
			'ro.isEnabled = :isEnabled AND ro.isActive = :isActive AND ro.isArchived = :isArchived',
			{
				isEnabled: true,
				isActive: true,
				isArchived: false
			}
		);
		qb.andWhere('ro.organizationId = :organizationId', { organizationId });
		qb.andWhere('ro.tenantId = :tenantId', { tenantId });

		return await qb.getMany();
	}
}
