import { Injectable, OnModuleInit, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CommandBus } from '@nestjs/cqrs';
import { IsNull, Repository } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';
import * as fs from 'fs';
import * as unzipper from 'unzipper';
import * as csv from 'csv-parser';
import * as rimraf from 'rimraf';
import * as path from 'path';
import * as chalk from 'chalk';
import { ConfigService } from '@gauzy/config';
import { getEntitiesFromPlugins } from '@gauzy/plugin';
import { isFunction, isNotEmpty } from '@gauzy/common';
import { ConnectionEntityManager } from '../../database/connection-entity-manager';
import { convertToDatetime } from '../../core/utils';
import { FileStorage } from '../../core/file-storage';
import {
	AccountingTemplate,
	Activity,
	AppointmentEmployee,
	ApprovalPolicy,
	AvailabilitySlot,
	Candidate,
	CandidateCriterionsRating,
	CandidateDocument,
	CandidateEducation,
	CandidateExperience,
	CandidateFeedback,
	CandidateInterview,
	CandidateInterviewers,
	CandidatePersonalQualities,
	CandidateSkill,
	CandidateSource,
	CandidateTechnologies,
	Contact,
	CustomSmtp,
	Deal,
	EmailHistory,
	EmailTemplate,
	Employee,
	EmployeeAppointment,
	EmployeeAward,
	EmployeeLevel,
	EmployeeRecurringExpense,
	EmployeeSetting,
	Equipment,
	EquipmentSharing,
	EquipmentSharingPolicy,
	EstimateEmail,
	EventType,
	Expense,
	ExpenseCategory,
	Feature,
	FeatureOrganization,
	Goal,
	GoalGeneralSetting,
	GoalKPI,
	GoalKPITemplate,
	GoalTemplate,
	GoalTimeFrame,
	ImageAsset,
	Income,
	Integration,
	IntegrationEntitySetting,
	IntegrationEntitySettingTied,
	IntegrationMap,
	IntegrationSetting,
	IntegrationTenant,
	IntegrationType,
	Invite,
	Invoice,
	InvoiceEstimateHistory,
	InvoiceItem,
	KeyResult,
	KeyResultTemplate,
	KeyResultUpdate,
	Language,
	Merchant,
	Organization,
	OrganizationAward,
	OrganizationContact,
	OrganizationDepartment,
	OrganizationDocument,
	OrganizationEmploymentType,
	OrganizationLanguage,
	OrganizationPosition,
	OrganizationProject,
	OrganizationRecurringExpense,
	OrganizationSprint,
	OrganizationTeam,
	OrganizationTeamEmployee,
	OrganizationVendor,
	Payment,
	Pipeline,
	PipelineStage,
	Product,
	ProductCategory,
	ProductCategoryTranslation,
	ProductOption,
	ProductOptionGroup,
	ProductOptionGroupTranslation,
	ProductOptionTranslation,
	ProductTranslation,
	ProductType,
	ProductTypeTranslation,
	ProductVariant,
	ProductVariantPrice,
	ProductVariantSetting,
	Report,
	ReportCategory,
	ReportOrganization,
	RequestApproval,
	RequestApprovalEmployee,
	RequestApprovalTeam,
	Role,
	RolePermission,
	Screenshot,
	Skill,
	Tag,
	Task,
	TenantSetting,
	TimeLog,
	TimeOffPolicy,
	TimeOffRequest,
	Timesheet,
	TimeSlot,
	TimeSlotMinute,
	User,
	UserOrganization,
	Warehouse,
	WarehouseProduct,
	WarehouseProductVariant
} from '../../core/entities/internal';
import { RequestContext } from '../../core';
import { ImportEntityFieldMapOrCreateCommand } from './commands';
import { ImportRecordFindOrFailCommand, ImportRecordUpdateOrCreateCommand } from '../import-record';
import { TypeOrmAccountingTemplateRepository } from '../../accounting-template/repository';
import { TypeOrmAppointmentEmployeeRepository } from '../../appointment-employees/repository';
import { TypeOrmApprovalPolicyRepository } from '../../approval-policy/repository';
import { TypeOrmAvailabilitySlotRepository } from '../../availability-slots/repository';
import { TypeOrmCandidateCriterionsRatingRepository } from '../../candidate-criterions-rating/repository';
import { TypeOrmCandidateDocumentRepository } from '../../candidate-documents/repository';
import { TypeOrmCandidateEducationRepository } from '../../candidate-education/repository';
import { TypeOrmCandidateExperienceRepository } from '../../candidate-experience/repository';
import { TypeOrmCandidateFeedbackRepository } from '../../candidate-feedbacks/repository';
import { TypeOrmCandidateInterviewRepository } from '../../candidate-interview/repository';
import { TypeOrmCandidateInterviewersRepository } from '../../candidate-interviewers/repository';
import { TypeOrmCandidatePersonalQualitiesRepository } from '../../candidate-personal-qualities/repository';
import { TypeOrmCandidateSkillRepository } from '../../candidate-skill/repository';
import { TypeOrmCandidateSourceRepository } from '../../candidate-source/repository';
import { TypeOrmCandidateTechnologiesRepository } from '../../candidate-technologies/repository';
import { TypeOrmCandidateRepository } from '../../candidate/repository';
import { TypeOrmContactRepository } from '../../contact/repository';
import { TypeOrmCustomSmtpRepository } from '../../custom-smtp/repository';
import { TypeOrmDealRepository } from '../../deal/repository';
import { TypeOrmEmailHistoryRepository } from '../../email-history/repository';
import { TypeOrmEmailTemplateRepository } from '../../email-template/repository';
import { TypeOrmEmployeeAppointmentRepository } from '../../employee-appointment/repository';
import { TypeOrmEmployeeAwardRepository } from '../../employee-award/repository';
import { TypeOrmEmployeeLevelRepository } from '../../employee-level/repository';
import { TypeOrmEmployeeRecurringExpenseRepository } from '../../employee-recurring-expense/repository';
import { TypeOrmEmployeeSettingRepository } from '../../employee-setting/repository';
import { TypeOrmEmployeeRepository } from '../../employee/repository';
import { TypeOrmEquipmentSharingPolicyRepository } from '../../equipment-sharing-policy/repository';
import { TypeOrmEquipmentSharingRepository } from '../../equipment-sharing/repository';
import { TypeOrmEquipmentRepository } from '../../equipment/repository';
import { TypeOrmEstimateEmailRepository } from '../../estimate-email/repository';
import { TypeOrmEventTypeRepository } from '../../event-types/repository';
import { TypeOrmExpenseCategoryRepository } from '../../expense-categories/repository';
import { TypeOrmExpenseRepository } from '../../expense/repository';
import { TypeOrmFeatureRepository, TypeOrmFeatureOrganizationRepository } from '../../feature/repository';
import { TypeOrmGoalGeneralSettingRepository } from '../../goal-general-setting/repository';
import { TypeOrmGoalKPITemplateRepository } from '../../goal-kpi-template/repository';
import { TypeOrmGoalKPIRepository } from '../../goal-kpi/repository';
import { TypeOrmGoalTemplateRepository } from '../../goal-template/repository';
import { TypeOrmGoalTimeFrameRepository } from '../../goal-time-frame/repository';
import { TypeOrmGoalRepository } from '../../goal/repository';
import { TypeOrmImageAssetRepository } from '../../image-asset/repository';
import { TypeOrmIncomeRepository } from '../../income/repository';
import { TypeOrmIntegrationEntitySettingTiedRepository } from '../../integration-entity-setting-tied/repository';
import { TypeOrmIntegrationEntitySettingRepository } from '../../integration-entity-setting/repository';
import { TypeOrmIntegrationMapRepository } from '../../integration-map/repository';
import { TypeOrmIntegrationSettingRepository } from '../../integration-setting/repository';
import { TypeOrmIntegrationTenantRepository } from '../../integration-tenant/repository';
import { TypeOrmIntegrationTypeRepository, TypeOrmIntegrationRepository } from '../../integration/repository';
import { TypeOrmInviteRepository } from '../../invite/repository';
import { TypeOrmInvoiceEstimateHistoryRepository } from '../../invoice-estimate-history/repository';
import { TypeOrmInvoiceItemRepository } from '../../invoice-item/repository';
import { TypeOrmInvoiceRepository } from '../../invoice/repository';
import { TypeOrmKeyResultTemplateRepository } from '../../keyresult-template/repository';
import { TypeOrmKeyResultUpdateRepository } from '../../keyresult-update/repository';
import { TypeOrmKeyResultRepository } from '../../keyresult/repository';
import { TypeOrmLanguageRepository } from '../../language/repository';
import { TypeOrmMerchantRepository } from '../../merchant/repository';
import { TypeOrmOrganizationAwardRepository } from '../../organization-award/repository';
import { TypeOrmOrganizationContactRepository } from '../../organization-contact/repository';
import { TypeOrmOrganizationDepartmentRepository } from '../../organization-department/repository';
import { TypeOrmOrganizationDocumentRepository } from '../../organization-document/repository';
import { TypeOrmOrganizationEmploymentTypeRepository } from '../../organization-employment-type/repository';
import { TypeOrmOrganizationLanguageRepository } from '../../organization-language/repository';
import { TypeOrmOrganizationPositionRepository } from '../../organization-position/repository';
import { TypeOrmOrganizationProjectRepository } from '../../organization-project/repository';
import { TypeOrmOrganizationRecurringExpenseRepository } from '../../organization-recurring-expense/repository';
import { TypeOrmOrganizationSprintRepository } from '../../organization-sprint/repository';
import { TypeOrmOrganizationTeamEmployeeRepository } from '../../organization-team-employee/repository';
import { TypeOrmOrganizationTeamRepository } from '../../organization-team/repository';
import { TypeOrmOrganizationVendorRepository } from '../../organization-vendor/repository';
import { TypeOrmOrganizationRepository } from '../../organization/repository';
import { TypeOrmPaymentRepository } from '../../payment/repository';
import { TypeOrmPipelineStageRepository } from '../../pipeline-stage/repository';
import { TypeOrmPipelineRepository } from '../../pipeline/repository';
import {
	TypeOrmProductCategoryTranslationRepository,
	TypeOrmProductCategoryRepository
} from '../../product-category/repository';
import {
	TypeOrmProductOptionGroupTranslationRepository,
	TypeOrmProductOptionGroupRepository,
	TypeOrmProductOptionTranslationRepository,
	TypeOrmProductOptionRepository
} from '../../product-option/repository';
import { TypeOrmProductVariantSettingRepository } from '../../product-setting/repository';
import { TypeOrmProductTypeTranslationRepository, TypeOrmProductTypeRepository } from '../../product-type/repository';
import { TypeOrmProductVariantPriceRepository } from '../../product-variant-price/repository';
import { TypeOrmProductVariantRepository } from '../../product-variant/repository';
import { TypeOrmProductTranslationRepository, TypeOrmProductRepository } from '../../product/repository';
import {
	TypeOrmReportCategoryRepository,
	TypeOrmReportOrganizationRepository,
	TypeOrmReportRepository
} from '../../reports/repository';
import { TypeOrmRequestApprovalEmployeeRepository } from '../../request-approval-employee/repository';
import { TypeOrmRequestApprovalTeamRepository } from '../../request-approval-team/repository';
import { TypeOrmRequestApprovalRepository } from '../../request-approval/repository';
import { TypeOrmRolePermissionRepository } from '../../role-permission/repository';
import { TypeOrmRoleRepository } from '../../role/repository';
import { TypeOrmSkillRepository } from '../../skills/repository';
import { TypeOrmTagRepository } from '../../tags/repository';
import { TypeOrmTaskRepository } from '../../tasks/repository';
import { TypeOrmTenantSettingRepository } from '../../tenant/tenant-setting/repository';
import { TypeOrmTimeOffPolicyRepository } from '../../time-off-policy/repository';
import { TypeOrmTimeOffRequestRepository } from '../../time-off-request/repository';
import { TypeOrmActivityRepository } from '../../time-tracking/activity/repository';
import { TypeOrmScreenshotRepository } from '../../time-tracking/screenshot/repository';
import { TypeOrmTimeLogRepository } from '../../time-tracking/time-log/repository';
import { TypeOrmTimeSlotMinuteRepository, TypeOrmTimeSlotRepository } from '../../time-tracking/time-slot/repository';
import { TypeOrmTimesheetRepository } from '../../time-tracking/timesheet/repository';
import { TypeOrmUserOrganizationRepository } from '../../user-organization/repository';
import { TypeOrmUserRepository } from '../../user/repository';
import {
	TypeOrmWarehouseProductVariantRepository,
	TypeOrmWarehouseProductRepository,
	TypeOrmWarehouseRepository
} from '../../warehouse/repository';
import { Logger } from '../../logger';
export interface IForeignKey<T> {
	column: string;
	repository: Repository<T>;
}

export interface IColumnRelationMetadata<T> {
	joinTableName: string;
	foreignKeys: IForeignKey<T>[];
	isCheckRelation: boolean;
}

export interface IRepositoryModel<T> {
	repository: Repository<T>;
	relations?: IColumnRelationMetadata<T>[];
	foreignKeys?: any;
	uniqueIdentifier?: any;

	// additional condition
	isStatic?: boolean;
	isCheckRelation?: boolean;
}

@Injectable()
export class ImportService implements OnModuleInit {
	@Logger()
	private readonly logger: NestLogger;

	private _dirname: string;
	private _extractPath: string;

	private readonly dynamicEntitiesClassMap: IRepositoryModel<any>[] = [];
	private repositories: IRepositoryModel<any>[] = [];

	constructor(
		@InjectRepository(AccountingTemplate)
		private readonly typeOrmAccountingTemplateRepository: TypeOrmAccountingTemplateRepository,

		@InjectRepository(Activity)
		private readonly typeOrmActivityRepository: TypeOrmActivityRepository,

		@InjectRepository(AppointmentEmployee)
		private readonly typeOrmAppointmentEmployeeRepository: TypeOrmAppointmentEmployeeRepository,

		@InjectRepository(ApprovalPolicy)
		private readonly typeOrmApprovalPolicyRepository: TypeOrmApprovalPolicyRepository,

		@InjectRepository(AvailabilitySlot)
		private readonly typeOrmAvailabilitySlotRepository: TypeOrmAvailabilitySlotRepository,

		@InjectRepository(Candidate)
		private readonly typeOrmCandidateRepository: TypeOrmCandidateRepository,

		@InjectRepository(CandidateCriterionsRating)
		private readonly typeOrmCandidateCriterionsRatingRepository: TypeOrmCandidateCriterionsRatingRepository,

		@InjectRepository(CandidateDocument)
		private readonly typeOrmCandidateDocumentRepository: TypeOrmCandidateDocumentRepository,

		@InjectRepository(CandidateEducation)
		private readonly typeOrmCandidateEducationRepository: TypeOrmCandidateEducationRepository,

		@InjectRepository(CandidateExperience)
		private readonly typeOrmCandidateExperienceRepository: TypeOrmCandidateExperienceRepository,

		@InjectRepository(CandidateFeedback)
		private readonly typeOrmCandidateFeedbackRepository: TypeOrmCandidateFeedbackRepository,

		@InjectRepository(CandidateInterview)
		private readonly typeOrmCandidateInterviewRepository: TypeOrmCandidateInterviewRepository,

		@InjectRepository(CandidateInterviewers)
		private readonly typeOrmCandidateInterviewersRepository: TypeOrmCandidateInterviewersRepository,

		@InjectRepository(CandidatePersonalQualities)
		private readonly typeOrmCandidatePersonalQualitiesRepository: TypeOrmCandidatePersonalQualitiesRepository,

		@InjectRepository(CandidateSkill)
		private readonly typeOrmCandidateSkillRepository: TypeOrmCandidateSkillRepository,

		@InjectRepository(CandidateSource)
		private readonly typeOrmCandidateSourceRepository: TypeOrmCandidateSourceRepository,

		@InjectRepository(CandidateTechnologies)
		private readonly typeOrmCandidateTechnologiesRepository: TypeOrmCandidateTechnologiesRepository,

		@InjectRepository(Contact)
		private readonly typeOrmContactRepository: TypeOrmContactRepository,

		@InjectRepository(CustomSmtp)
		private readonly typeOrmCustomSmtpRepository: TypeOrmCustomSmtpRepository,

		@InjectRepository(Deal)
		private readonly typeOrmDealRepository: TypeOrmDealRepository,

		@InjectRepository(EmailHistory)
		private readonly typeOrmEmailHistoryRepository: TypeOrmEmailHistoryRepository,

		@InjectRepository(EmailTemplate)
		private readonly typeOrmEmailTemplateRepository: TypeOrmEmailTemplateRepository,

		@InjectRepository(Employee)
		private readonly typeOrmEmployeeRepository: TypeOrmEmployeeRepository,

		@InjectRepository(EmployeeAppointment)
		private readonly typeOrmEmployeeAppointmentRepository: TypeOrmEmployeeAppointmentRepository,

		@InjectRepository(EmployeeAward)
		private readonly typeOrmEmployeeAwardRepository: TypeOrmEmployeeAwardRepository,

		@InjectRepository(EmployeeRecurringExpense)
		private readonly typeOrmEmployeeRecurringExpenseRepository: TypeOrmEmployeeRecurringExpenseRepository,

		@InjectRepository(EmployeeSetting)
		private readonly typeOrmEmployeeSettingRepository: TypeOrmEmployeeSettingRepository,

		@InjectRepository(Equipment)
		private readonly typeOrmEquipmentRepository: TypeOrmEquipmentRepository,

		@InjectRepository(EquipmentSharing)
		private readonly typeOrmEquipmentSharingRepository: TypeOrmEquipmentSharingRepository,

		@InjectRepository(EquipmentSharingPolicy)
		private readonly typeOrmEquipmentSharingPolicyRepository: TypeOrmEquipmentSharingPolicyRepository,

		@InjectRepository(EstimateEmail)
		private readonly typeOrmEstimateEmailRepository: TypeOrmEstimateEmailRepository,

		@InjectRepository(EventType)
		private readonly typeOrmEventTypeRepository: TypeOrmEventTypeRepository,

		@InjectRepository(Expense)
		private readonly typeOrmExpenseRepository: TypeOrmExpenseRepository,

		@InjectRepository(ExpenseCategory)
		private readonly typeOrmExpenseCategoryRepository: TypeOrmExpenseCategoryRepository,

		@InjectRepository(Feature)
		private readonly typeOrmFeatureRepository: TypeOrmFeatureRepository,

		@InjectRepository(FeatureOrganization)
		private readonly typeOrmFeatureOrganizationRepository: TypeOrmFeatureOrganizationRepository,

		@InjectRepository(Goal)
		private readonly typeOrmGoalRepository: TypeOrmGoalRepository,

		@InjectRepository(GoalTemplate)
		private readonly typeOrmGoalTemplateRepository: TypeOrmGoalTemplateRepository,

		@InjectRepository(GoalKPI)
		private readonly typeOrmGoalKPIRepository: TypeOrmGoalKPIRepository,

		@InjectRepository(GoalKPITemplate)
		private readonly typeOrmGoalKPITemplateRepository: TypeOrmGoalKPITemplateRepository,

		@InjectRepository(GoalTimeFrame)
		private readonly typeOrmGoalTimeFrameRepository: TypeOrmGoalTimeFrameRepository,

		@InjectRepository(GoalGeneralSetting)
		private readonly typeOrmGoalGeneralSettingRepository: TypeOrmGoalGeneralSettingRepository,

		@InjectRepository(Income)
		private readonly typeOrmIncomeRepository: TypeOrmIncomeRepository,

		@InjectRepository(Integration)
		private readonly typeOrmIntegrationRepository: TypeOrmIntegrationRepository,

		@InjectRepository(IntegrationType)
		private readonly typeOrmIntegrationTypeRepository: TypeOrmIntegrationTypeRepository,

		@InjectRepository(IntegrationEntitySetting)
		private readonly typeOrmIntegrationEntitySettingRepository: TypeOrmIntegrationEntitySettingRepository,

		@InjectRepository(IntegrationEntitySettingTied)
		private readonly typeOrmIntegrationEntitySettingTiedRepository: TypeOrmIntegrationEntitySettingTiedRepository,

		@InjectRepository(IntegrationMap)
		private readonly typeOrmIntegrationMapRepository: TypeOrmIntegrationMapRepository,

		@InjectRepository(IntegrationSetting)
		private readonly typeOrmIntegrationSettingRepository: TypeOrmIntegrationSettingRepository,

		@InjectRepository(IntegrationTenant)
		private readonly typeOrmIntegrationTenantRepository: TypeOrmIntegrationTenantRepository,

		@InjectRepository(Invite)
		private readonly typeOrmInviteRepository: TypeOrmInviteRepository,

		@InjectRepository(Invoice)
		private readonly typeOrmInvoiceRepository: TypeOrmInvoiceRepository,

		@InjectRepository(InvoiceEstimateHistory)
		private readonly typeOrmInvoiceEstimateHistoryRepository: TypeOrmInvoiceEstimateHistoryRepository,

		@InjectRepository(InvoiceItem)
		private readonly typeOrmInvoiceItemRepository: TypeOrmInvoiceItemRepository,

		@InjectRepository(KeyResult)
		private readonly typeOrmKeyResultRepository: TypeOrmKeyResultRepository,

		@InjectRepository(KeyResultTemplate)
		private readonly typeOrmKeyResultTemplateRepository: TypeOrmKeyResultTemplateRepository,

		@InjectRepository(KeyResultUpdate)
		private readonly typeOrmKeyResultUpdateRepository: TypeOrmKeyResultUpdateRepository,

		@InjectRepository(Language)
		private readonly typeOrmLanguageRepository: TypeOrmLanguageRepository,

		@InjectRepository(Organization)
		private readonly typeOrmOrganizationRepository: TypeOrmOrganizationRepository,

		@InjectRepository(EmployeeLevel)
		private readonly typeOrmEmployeeLevelRepository: TypeOrmEmployeeLevelRepository,

		@InjectRepository(OrganizationAward)
		private readonly typeOrmOrganizationAwardRepository: TypeOrmOrganizationAwardRepository,

		@InjectRepository(OrganizationContact)
		private readonly typeOrmOrganizationContactRepository: TypeOrmOrganizationContactRepository,

		@InjectRepository(OrganizationDepartment)
		private readonly typeOrmOrganizationDepartmentRepository: TypeOrmOrganizationDepartmentRepository,

		@InjectRepository(OrganizationDocument)
		private readonly typeOrmOrganizationDocumentRepository: TypeOrmOrganizationDocumentRepository,

		@InjectRepository(OrganizationEmploymentType)
		private readonly typeOrmOrganizationEmploymentTypeRepository: TypeOrmOrganizationEmploymentTypeRepository,

		@InjectRepository(OrganizationLanguage)
		private readonly typeOrmOrganizationLanguageRepository: TypeOrmOrganizationLanguageRepository,

		@InjectRepository(OrganizationPosition)
		private readonly typeOrmOrganizationPositionRepository: TypeOrmOrganizationPositionRepository,

		@InjectRepository(OrganizationProject)
		private readonly typeOrmOrganizationProjectRepository: TypeOrmOrganizationProjectRepository,

		@InjectRepository(OrganizationRecurringExpense)
		private readonly typeOrmOrganizationRecurringExpenseRepository: TypeOrmOrganizationRecurringExpenseRepository,

		@InjectRepository(OrganizationSprint)
		private readonly typeOrmOrganizationSprintRepository: TypeOrmOrganizationSprintRepository,

		@InjectRepository(OrganizationTeam)
		private readonly typeOrmOrganizationTeamRepository: TypeOrmOrganizationTeamRepository,

		@InjectRepository(OrganizationTeamEmployee)
		private readonly typeOrmOrganizationTeamEmployeeRepository: TypeOrmOrganizationTeamEmployeeRepository,

		@InjectRepository(OrganizationVendor)
		private readonly typeOrmOrganizationVendorRepository: TypeOrmOrganizationVendorRepository,

		@InjectRepository(Payment)
		private readonly typeOrmPaymentRepository: TypeOrmPaymentRepository,

		@InjectRepository(Pipeline)
		private readonly typeOrmPipelineRepository: TypeOrmPipelineRepository,

		@InjectRepository(PipelineStage)
		private readonly typeOrmPipelineStageRepository: TypeOrmPipelineStageRepository,

		@InjectRepository(Product)
		private readonly typeOrmProductRepository: TypeOrmProductRepository,

		@InjectRepository(ProductTranslation)
		private readonly typeOrmProductTranslationRepository: TypeOrmProductTranslationRepository,

		@InjectRepository(ProductCategory)
		private readonly typeOrmProductCategoryRepository: TypeOrmProductCategoryRepository,

		@InjectRepository(ProductCategoryTranslation)
		private readonly typeOrmProductCategoryTranslationRepository: TypeOrmProductCategoryTranslationRepository,

		@InjectRepository(ProductOption)
		private readonly typeOrmProductOptionRepository: TypeOrmProductOptionRepository,

		@InjectRepository(ProductOptionTranslation)
		private readonly typeOrmProductOptionTranslationRepository: TypeOrmProductOptionTranslationRepository,

		@InjectRepository(ProductOptionGroup)
		private readonly typeOrmProductOptionGroupRepository: TypeOrmProductOptionGroupRepository,

		@InjectRepository(ProductOptionGroupTranslation)
		private readonly typeOrmProductOptionGroupTranslationRepository: TypeOrmProductOptionGroupTranslationRepository,

		@InjectRepository(ProductVariantSetting)
		private readonly typeOrmProductVariantSettingRepository: TypeOrmProductVariantSettingRepository,

		@InjectRepository(ProductType)
		private readonly typeOrmProductTypeRepository: TypeOrmProductTypeRepository,

		@InjectRepository(ProductTypeTranslation)
		private readonly typeOrmProductTypeTranslationRepository: TypeOrmProductTypeTranslationRepository,

		@InjectRepository(ProductVariant)
		private readonly typeOrmProductVariantRepository: TypeOrmProductVariantRepository,

		@InjectRepository(ProductVariantPrice)
		private readonly typeOrmProductVariantPriceRepository: TypeOrmProductVariantPriceRepository,

		@InjectRepository(ImageAsset)
		private readonly typeOrmImageAssetRepository: TypeOrmImageAssetRepository,

		@InjectRepository(Warehouse)
		private readonly typeOrmWarehouseRepository: TypeOrmWarehouseRepository,

		@InjectRepository(Merchant)
		private readonly typeOrmMerchantRepository: TypeOrmMerchantRepository,

		@InjectRepository(WarehouseProduct)
		private readonly typeOrmWarehouseProductRepository: TypeOrmWarehouseProductRepository,

		@InjectRepository(WarehouseProductVariant)
		private readonly typeOrmWarehouseProductVariantRepository: TypeOrmWarehouseProductVariantRepository,

		@InjectRepository(Skill)
		private readonly typeOrmSkillRepository: TypeOrmSkillRepository,

		@InjectRepository(Screenshot)
		private readonly typeOrmScreenshotRepository: TypeOrmScreenshotRepository,

		@InjectRepository(RequestApproval)
		private readonly typeOrmRequestApprovalRepository: TypeOrmRequestApprovalRepository,

		@InjectRepository(RequestApprovalEmployee)
		private readonly typeOrmRequestApprovalEmployeeRepository: TypeOrmRequestApprovalEmployeeRepository,

		@InjectRepository(RequestApprovalTeam)
		private readonly typeOrmRequestApprovalTeamRepository: TypeOrmRequestApprovalTeamRepository,

		@InjectRepository(Role)
		private readonly typeOrmRoleRepository: TypeOrmRoleRepository,

		@InjectRepository(RolePermission)
		private readonly typeOrmRolePermissionRepository: TypeOrmRolePermissionRepository,

		@InjectRepository(Report)
		private readonly typeOrmReportRepository: TypeOrmReportRepository,

		@InjectRepository(ReportCategory)
		private readonly typeOrmReportCategoryRepository: TypeOrmReportCategoryRepository,

		@InjectRepository(ReportOrganization)
		private readonly typeOrmReportOrganizationRepository: TypeOrmReportOrganizationRepository,

		@InjectRepository(Tag)
		private readonly typeOrmTagRepository: TypeOrmTagRepository,

		@InjectRepository(Task)
		private readonly typeOrmTaskRepository: TypeOrmTaskRepository,

		@InjectRepository(TenantSetting)
		private readonly typeOrmTenantSettingRepository: TypeOrmTenantSettingRepository,

		@InjectRepository(Timesheet)
		private readonly typeOrmTimesheetRepository: TypeOrmTimesheetRepository,

		@InjectRepository(TimeLog)
		private readonly typeOrmTimeLogRepository: TypeOrmTimeLogRepository,

		@InjectRepository(TimeSlot)
		private readonly typeOrmTimeSlotRepository: TypeOrmTimeSlotRepository,

		@InjectRepository(TimeSlotMinute)
		private readonly typeOrmTimeSlotMinuteRepository: TypeOrmTimeSlotMinuteRepository,

		@InjectRepository(TimeOffRequest)
		private readonly typeOrmTimeOffRequestRepository: TypeOrmTimeOffRequestRepository,

		@InjectRepository(TimeOffPolicy)
		private readonly typeOrmTimeOffPolicyRepository: TypeOrmTimeOffPolicyRepository,

		@InjectRepository(User)
		private readonly typeOrmUserRepository: TypeOrmUserRepository,

		@InjectRepository(UserOrganization)
		private readonly typeOrmUserOrganizationRepository: TypeOrmUserOrganizationRepository,

		private readonly configService: ConfigService,
		private readonly _connectionEntityManager: ConnectionEntityManager,
		private readonly commandBus: CommandBus
	) {}

	async onModuleInit() {
		//base import csv directory path
		this._dirname = path.join(this.configService.assetOptions.assetPublicPath || __dirname);

		await this.createDynamicInstanceForPluginEntities();
		await this.registerCoreRepositories();
	}

	public removeExtractedFiles() {
		try {
			rimraf.sync(this._extractPath);
		} catch (error) {
			this.logger.error(`Failed to remove extracted files: ${error}`);
		}
	}

	public async unzipAndParse(filePath: string, cleanup = false) {
		//extracted import csv directory path
		this._extractPath = path.join(path.join(this._dirname, filePath), '../csv');

		const file = await new FileStorage().getProvider().getFile(filePath);
		await unzipper.Open.buffer(file).then((d) => d.extract({ path: this._extractPath }));
		await this.parse(cleanup);
	}

	async parse(cleanup = false) {
		/**
		 * Can only run in a particular order
		 */
		const tenantId = RequestContext.currentTenantId();
		for await (const item of this.repositories) {
			const { repository, isStatic = false, relations = [] } = item;
			const nameFile = repository.metadata.tableName;
			const csvPath = path.join(this._extractPath, `${nameFile}.csv`);
			const masterTable = repository.metadata.tableName;

			if (!fs.existsSync(csvPath)) {
				this.logger.warn(`File Does Not Exist, Skipping: ${nameFile}`);
				continue;
			}

			this.logger.log(`Importing process start for table: ${masterTable}`);

			await new Promise(async (resolve, reject) => {
				try {
					/**
					 * This will first collect all the data and then insert
					 * If cleanup flag is set then it will also delete current tenant related data from the database table with CASCADE
					 */
					if (cleanup && isStatic !== true) {
						try {
							const sql = `DELETE FROM "${masterTable}" WHERE "${masterTable}"."tenantId" = '${tenantId}'`;
							await repository.query(sql);
							this.logger.log(`Clean up processing for table: ${masterTable}`);
						} catch (error) {
							this.logger.error(`Failed to clean up process for table ${masterTable}: ${error}`);
							reject(error);
						}
					}

					let results = [];
					const stream = fs.createReadStream(csvPath, 'utf8').pipe(csv());
					stream.on('data', (data) => {
						results.push(data);
					});
					stream.on('error', (error) => {
						this.logger.error(`Failed to parse CSV for table ${masterTable}: ${error}`);
						reject(error);
					});
					stream.on('end', async () => {
						results = results.filter(isNotEmpty);
						try {
							for await (const data of results) {
								if (isNotEmpty(data)) {
									await this.migrateImportEntityRecord(item, data);
								}
							}
							this.logger.log(`Success to inserts data for table ${masterTable}`);
						} catch (error) {
							this.logger.error(`Failed to inserts data for table ${masterTable}: ${error}`);
							reject(error);
						}
						resolve(true);
					});
				} catch (error) {
					this.logger.error(`Failed to read file for table ${masterTable}: ${error}`);
					reject(error);
				}
			});

			// export pivot relational tables
			if (isNotEmpty(relations)) {
				await this.parseRelationalTables(item, cleanup);
			}
		}
	}

	async parseRelationalTables(entity: IRepositoryModel<any>, cleanup = false) {
		const { repository, relations } = entity;
		for await (const item of relations) {
			const { joinTableName } = item;
			const csvPath = path.join(this._extractPath, `${joinTableName}.csv`);

			if (!fs.existsSync(csvPath)) {
				this.logger.warn(`File Does Not Exist, Skipping: ${joinTableName}`);
				continue;
			}

			this.logger.log(`Importing process start for table: ${joinTableName}`);

			await new Promise(async (resolve, reject) => {
				try {
					let results = [];
					const stream = fs.createReadStream(csvPath, 'utf8').pipe(csv());
					stream.on('data', (data) => {
						results.push(data);
					});
					stream.on('error', (error) => {
						this.logger.error(`Failed to parse CSV for table ${joinTableName}: ${error}`);
						reject(error);
					});
					stream.on('end', async () => {
						results = results.filter(isNotEmpty);

						for await (const data of results) {
							try {
								if (isNotEmpty(data)) {
									const fields = await this.mapRelationFields(item, data);
									const sql = `INSERT INTO "${joinTableName}" (${
										'"' + Object.keys(fields).join(`", "`) + '"'
									}) VALUES ("$1", "$2")`;
									await repository.query(sql);
									this.logger.log(`Success to inserts data for table ${joinTableName}`);
								}
							} catch (error) {
								this.logger.error(`Failed to inserts data for table ${joinTableName}: ${error}`);
								reject(error);
							}
						}
						resolve(true);
					});
				} catch (error) {
					this.logger.error(`Failed to read file for table ${joinTableName}: ${error}`);
					reject(error);
				}
			});
		}
	}

	/*
	 * Map static tables import record before insert data
	 */
	async migrateImportEntityRecord(item: IRepositoryModel<any>, entity: any): Promise<any> {
		const { repository, uniqueIdentifier = [] } = item;
		const source = JSON.parse(JSON.stringify(entity));
		const where = [];

		if (isNotEmpty(uniqueIdentifier) && uniqueIdentifier instanceof Array) {
			if ('tenantId' in entity && isNotEmpty(entity['tenantId'])) {
				where.push({ tenantId: RequestContext.currentTenantId() });
			}
			for (const unique of uniqueIdentifier) {
				where.push({ [unique.column]: entity[unique.column] });
			}
		}
		const destination = await this.commandBus.execute(
			new ImportEntityFieldMapOrCreateCommand(repository, where, await this.mapFields(item, entity), source.id)
		);
		if (destination) {
			await this.mappedImportRecord(item, destination, source);
		}
		return true;
	}

	/*
	 * Map import record after find or insert data
	 */
	async mappedImportRecord(item: IRepositoryModel<any>, destination: any, row: any): Promise<any> {
		const { repository } = item;
		const entityType = repository.metadata.tableName;

		if (destination) {
			await this.commandBus.execute(
				new ImportRecordUpdateOrCreateCommand({
					tenantId: RequestContext.currentTenantId(),
					sourceId: row.id,
					destinationId: destination.id,
					entityType
				})
			);
		}
		return true;
	}

	/*
	 * Map tenant & organization base fields here
	 * Notice: Please add timestamp field here if missing
	 */
	async mapFields(item: IRepositoryModel<any>, data: any) {
		if ('id' in data && isNotEmpty(data['id'])) {
			delete data['id'];
		}
		if ('tenantId' in data && isNotEmpty(data['tenantId'])) {
			data['tenantId'] = RequestContext.currentTenantId();
		}
		if ('organizationId' in data && isNotEmpty(data['organizationId'])) {
			try {
				const organization = await this.typeOrmOrganizationRepository.findOneByOrFail({
					id: data['organizationId'],
					tenantId: RequestContext.currentTenantId()
				});
				data['organizationId'] = organization ? organization.id : IsNull().value;
			} catch (error) {
				const { record } = await this.commandBus.execute(
					new ImportRecordFindOrFailCommand({
						tenantId: RequestContext.currentTenantId(),
						sourceId: data['organizationId'],
						entityType: this.typeOrmOrganizationRepository.metadata.tableName
					})
				);
				data['organizationId'] = record ? record.destinationId : IsNull().value;
			}
		}
		return await this.mapTimeStampsFields(item, await this.mapRelationFields(item, data));
	}

	/*
	 * Map timestamps fields here
	 */
	async mapTimeStampsFields(item: IRepositoryModel<any>, data: any) {
		const { repository } = item;
		for await (const column of repository.metadata.columns) {
			const { propertyName, type } = column;
			if (`${propertyName}` in data && isNotEmpty(data[`${propertyName}`])) {
				if (type.valueOf() === Date || type === 'datetime' || type === 'timestamp') {
					data[`${propertyName}`] = convertToDatetime(data[`${propertyName}`]);
				} else if (data[`${propertyName}`] === 'true') {
					data[`${propertyName}`] = true;
				} else if (data[`${propertyName}`] === 'false') {
					data[`${propertyName}`] = false;
				}
			}
		}
		return data;
	}

	/*
	 * Map relation fields here
	 */
	async mapRelationFields(item: IRepositoryModel<any> | IColumnRelationMetadata<any>, data: any): Promise<any> {
		const { foreignKeys = [], isCheckRelation = false } = item;
		if (isCheckRelation) {
			if (isNotEmpty(foreignKeys) && foreignKeys instanceof Array) {
				for await (const { column, repository } of foreignKeys) {
					const { record } = await this.commandBus.execute(
						new ImportRecordFindOrFailCommand({
							tenantId: RequestContext.currentTenantId(),
							sourceId: data[column],
							entityType: repository.metadata.tableName
						})
					);
					data[column] = record ? record.destinationId : IsNull().value;
				}
			}
		}
		return true;
	}

	//load plugins entities for import data
	private async createDynamicInstanceForPluginEntities() {
		for await (const entity of getEntitiesFromPlugins(this.configService.plugins)) {
			if (!isFunction(entity)) {
				continue;
			}

			const className = camelCase(entity.name);
			const repository = this._connectionEntityManager.getRepository(entity);

			this[className] = repository;
			this.dynamicEntitiesClassMap.push({ repository });
		}
	}

	/*
	 * Load all entities repository after create instance
	 * Warning: Changing position here can be FATAL
	 */
	private async registerCoreRepositories() {
		this.repositories = [
			/**
			 * These entities do not have any other dependency so need to be mapped first
			 */
			{
				repository: this.typeOrmReportCategoryRepository,
				isStatic: true,
				uniqueIdentifier: [{ column: 'name' }]
			},
			{
				repository: this.typeOrmReportRepository,
				isStatic: true,
				uniqueIdentifier: [{ column: 'name' }, { column: 'slug' }]
			},
			{
				repository: this.typeOrmFeatureRepository,
				isStatic: true,
				uniqueIdentifier: [{ column: 'name' }, { column: 'code' }]
			},
			{
				repository: this.typeOrmLanguageRepository,
				isStatic: true,
				uniqueIdentifier: [{ column: 'name' }, { column: 'code' }]
			},
			{
				repository: this.typeOrmIntegrationRepository,
				isStatic: true,
				uniqueIdentifier: [{ column: 'name' }]
			},
			{
				repository: this.typeOrmIntegrationTypeRepository,
				isStatic: true,
				uniqueIdentifier: [{ column: 'name' }, { column: 'groupName' }],
				relations: [
					{
						joinTableName: 'integration_integration_type',
						isCheckRelation: true,
						foreignKeys: [
							{ column: 'integrationId', repository: this.typeOrmIntegrationRepository },
							{ column: 'integrationTypeId', repository: this.typeOrmIntegrationTypeRepository }
						]
					}
				]
			},
			/**
			 * These entities need TENANT
			 */
			{
				repository: this.typeOrmTenantSettingRepository
			},
			{
				repository: this.typeOrmRoleRepository
			},
			{
				repository: this.typeOrmRolePermissionRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'roleId', repository: this.typeOrmRoleRepository }]
			},
			{
				repository: this.typeOrmOrganizationRepository
			},
			/**
			 * These entities need TENANT and ORGANIZATION
			 */
			{
				repository: this.typeOrmUserRepository,
				isStatic: true,
				isCheckRelation: true,
				foreignKeys: [{ column: 'roleId', repository: this.typeOrmRoleRepository }]
			},
			{
				repository: this.typeOrmUserOrganizationRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'userId', repository: this.typeOrmUserRepository }]
			},
			//Organization & Related Entities
			{
				repository: this.typeOrmOrganizationPositionRepository
			},
			{
				repository: this.typeOrmOrganizationTeamRepository
			},
			{
				repository: this.typeOrmOrganizationAwardRepository
			},
			{
				repository: this.typeOrmOrganizationVendorRepository
			},
			{
				repository: this.typeOrmOrganizationDepartmentRepository
			},
			{
				repository: this.typeOrmOrganizationDocumentRepository
			},
			{
				repository: this.typeOrmOrganizationLanguageRepository
			},
			{
				repository: this.typeOrmOrganizationEmploymentTypeRepository
			},
			{
				repository: this.typeOrmOrganizationContactRepository
			},
			{
				repository: this.typeOrmOrganizationProjectRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'organizationContactId', repository: this.typeOrmOrganizationContactRepository }
				]
			},
			{
				repository: this.typeOrmOrganizationSprintRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'projectId', repository: this.typeOrmOrganizationProjectRepository }]
			},
			{
				repository: this.typeOrmOrganizationRecurringExpenseRepository
			},
			{
				repository: this.typeOrmContactRepository
			},
			{
				repository: this.typeOrmCustomSmtpRepository
			},
			{
				repository: this.typeOrmReportOrganizationRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'reportId', repository: this.typeOrmReportRepository }]
			},
			/**
			 * These entities need TENANT, ORGANIZATION & USER
			 */
			{
				repository: this.typeOrmEmployeeRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'userId', repository: this.typeOrmUserRepository },
					{ column: 'contactId', repository: this.typeOrmContactRepository },
					{ column: 'organizationPositionId', repository: this.typeOrmOrganizationPositionRepository }
				],
				relations: [
					{ joinTableName: 'employee_job_preset' },
					{
						joinTableName: 'organization_department_employee',
						foreignKeys: [
							{
								column: 'organizationDepartmentId',
								repository: this.typeOrmOrganizationDepartmentRepository
							},
							{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }
						]
					},
					{
						joinTableName: 'organization_employment_type_employee',
						foreignKeys: [
							{
								column: 'organizationEmploymentTypeId',
								repository: this.typeOrmOrganizationEmploymentTypeRepository
							},
							{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }
						]
					},
					{
						joinTableName: 'organization_contact_employee',
						foreignKeys: [
							{ column: 'organizationContactId', repository: this.typeOrmOrganizationContactRepository },
							{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }
						]
					},
					{
						joinTableName: 'organization_project_employee',
						foreignKeys: [
							{ column: 'organizationProjectId', repository: this.typeOrmOrganizationProjectRepository },
							{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }
						]
					}
				]
			},
			/**
			 * These entities need TENANT, ORGANIZATION & CANDIDATE
			 */
			{
				repository: this.typeOrmCandidateRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'userId', repository: this.typeOrmUserRepository },
					{ column: 'organizationPositionId', repository: this.typeOrmOrganizationPositionRepository }
				],
				relations: [
					{
						joinTableName: 'candidate_department',
						foreignKeys: [
							{ column: 'candidateId', repository: this.typeOrmCandidateRepository },
							{
								column: 'organizationDepartmentId',
								repository: this.typeOrmOrganizationDepartmentRepository
							}
						]
					},
					{
						joinTableName: 'candidate_employment_type',
						foreignKeys: [
							{ column: 'candidateId', repository: this.typeOrmCandidateRepository },
							{
								column: 'organizationEmploymentTypeId',
								repository: this.typeOrmOrganizationEmploymentTypeRepository
							}
						]
					}
				]
			},
			{
				repository: this.typeOrmCandidateDocumentRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'candidateId', repository: this.typeOrmCandidateRepository }]
			},
			{
				repository: this.typeOrmCandidateEducationRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'candidateId', repository: this.typeOrmCandidateRepository }]
			},
			{
				repository: this.typeOrmCandidateSkillRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'candidateId', repository: this.typeOrmCandidateRepository }]
			},
			{
				repository: this.typeOrmCandidateSourceRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'candidateId', repository: this.typeOrmCandidateRepository }]
			},
			{
				repository: this.typeOrmCandidateInterviewRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'candidateId', repository: this.typeOrmCandidateRepository }]
			},
			{
				repository: this.typeOrmCandidateInterviewersRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'interviewId', repository: this.typeOrmCandidateInterviewRepository },
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }
				]
			},
			{
				repository: this.typeOrmCandidateExperienceRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'candidateId', repository: this.typeOrmCandidateRepository }]
			},
			{
				repository: this.typeOrmCandidateFeedbackRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'candidateId', repository: this.typeOrmCandidateRepository },
					{ column: 'interviewId', repository: this.typeOrmCandidateInterviewRepository },
					{ column: 'interviewerId', repository: this.typeOrmCandidateInterviewersRepository }
				]
			},
			{
				repository: this.typeOrmCandidatePersonalQualitiesRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'interviewId', repository: this.typeOrmCandidateInterviewRepository }]
			},
			{
				repository: this.typeOrmCandidateTechnologiesRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'interviewId', repository: this.typeOrmCandidateInterviewRepository }]
			},
			{
				repository: this.typeOrmCandidateCriterionsRatingRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'feedbackId', repository: this.typeOrmCandidateFeedbackRepository },
					{ column: 'technologyId', repository: this.typeOrmCandidateTechnologiesRepository },
					{ column: 'personalQualityId', repository: this.typeOrmCandidatePersonalQualitiesRepository }
				]
			},
			/**
			 * These entities need TENANT and ORGANIZATION
			 */
			{
				repository: this.typeOrmSkillRepository,
				uniqueIdentifier: [{ column: 'name' }],
				relations: [
					{
						joinTableName: 'skill_employee',
						foreignKeys: [
							{ column: 'skillId', repository: this.typeOrmSkillRepository },
							{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }
						]
					},
					{
						joinTableName: 'skill_organization',
						foreignKeys: [
							{ column: 'skillId', repository: this.typeOrmSkillRepository },
							{ column: 'organizationId', repository: this.typeOrmOrganizationRepository }
						]
					}
				]
			},
			{
				repository: this.typeOrmAccountingTemplateRepository
			},
			{
				repository: this.typeOrmApprovalPolicyRepository
			},
			{
				repository: this.typeOrmAvailabilitySlotRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }]
			},
			{
				repository: this.typeOrmEmployeeAppointmentRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }]
			},
			{
				repository: this.typeOrmAppointmentEmployeeRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository },
					{ column: 'employeeAppointmentId', repository: this.typeOrmEmployeeAppointmentRepository }
				]
			},
			/*
			 * Email & Template
			 */
			{
				repository: this.typeOrmEmailTemplateRepository
			},
			{
				repository: this.typeOrmEmailHistoryRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'emailTemplateId', repository: this.typeOrmEmailTemplateRepository },
					{ column: 'userId', repository: this.typeOrmUserRepository }
				]
			},
			{
				repository: this.typeOrmEstimateEmailRepository
			},
			/*
			 * Employee & Related Entities
			 */
			{
				repository: this.typeOrmEmployeeAwardRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }]
			},
			{
				repository: this.typeOrmEmployeeRecurringExpenseRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }]
			},
			{
				repository: this.typeOrmEmployeeSettingRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }]
			},
			{
				repository: this.typeOrmEmployeeLevelRepository
			},
			/*
			 * Equipment & Related Entities
			 */
			{
				repository: this.typeOrmEquipmentSharingPolicyRepository
			},
			{
				repository: this.typeOrmEquipmentRepository
			},
			{
				repository: this.typeOrmEquipmentSharingRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'equipmentId', repository: this.typeOrmEquipmentRepository },
					{ column: 'equipmentSharingPolicyId', repository: this.typeOrmEquipmentSharingPolicyRepository }
				],
				relations: [
					{
						joinTableName: 'equipment_shares_employees',
						foreignKeys: [
							{ column: 'equipmentSharingId', repository: this.typeOrmEquipmentSharingRepository },
							{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }
						]
					},
					{
						joinTableName: 'equipment_shares_teams',
						foreignKeys: [
							{ column: 'equipmentSharingId', repository: this.typeOrmEquipmentSharingRepository },
							{ column: 'organizationTeamId', repository: this.typeOrmOrganizationTeamRepository }
						]
					}
				]
			},
			/*
			 * Event Type & Related Entities
			 */
			{
				repository: this.typeOrmEventTypeRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }]
			},
			/*
			 * Invoice & Related Entities
			 */
			{
				repository: this.typeOrmInvoiceRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'sendTo', repository: this.typeOrmOrganizationContactRepository },
					{ column: 'organizationContactId', repository: this.typeOrmOrganizationContactRepository },
					{ column: 'fromOrganizationId', repository: this.typeOrmOrganizationRepository },
					{ column: 'toContactId', repository: this.typeOrmOrganizationContactRepository }
				]
			},
			{
				repository: this.typeOrmInvoiceItemRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'invoiceId', repository: this.typeOrmInvoiceRepository },
					{ column: 'taskId', repository: this.typeOrmTaskRepository },
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository },
					{ column: 'projectId', repository: this.typeOrmOrganizationProjectRepository },
					{ column: 'productId', repository: this.typeOrmProductRepository },
					{ column: 'expenseId', repository: this.typeOrmExpenseRepository }
				]
			},
			{
				repository: this.typeOrmInvoiceEstimateHistoryRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'userId', repository: this.typeOrmUserRepository },
					{ column: 'invoiceId', repository: this.typeOrmInvoiceRepository }
				]
			},
			/*
			 * Expense & Related Entities
			 */
			{
				repository: this.typeOrmExpenseCategoryRepository
			},
			{
				repository: this.typeOrmExpenseRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository },
					{ column: 'vendorId', repository: this.typeOrmOrganizationVendorRepository },
					{ column: 'categoryId', repository: this.typeOrmExpenseCategoryRepository },
					{ column: 'projectId', repository: this.typeOrmOrganizationProjectRepository }
				]
			},
			/*
			 * Income
			 */
			{
				repository: this.typeOrmIncomeRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }]
			},
			/*
			 * Feature & Related Entities
			 */
			{
				repository: this.typeOrmFeatureOrganizationRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'featureId', repository: this.typeOrmFeatureRepository }]
			},
			{
				repository: this.typeOrmGoalRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'ownerTeamId', repository: this.typeOrmOrganizationTeamRepository },
					{ column: 'ownerEmployeeId', repository: this.typeOrmEmployeeRepository },
					{ column: 'leadId', repository: this.typeOrmEmployeeRepository }
				]
			},
			/*
			 * Key Result & Related Entities
			 */
			{
				repository: this.typeOrmKeyResultRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'projectId', repository: this.typeOrmOrganizationProjectRepository },
					{ column: 'taskId', repository: this.typeOrmTaskRepository },
					{ column: 'leadId', repository: this.typeOrmEmployeeRepository },
					{ column: 'ownerId', repository: this.typeOrmEmployeeRepository },
					{ column: 'goalId', repository: this.typeOrmGoalRepository }
				]
			},
			{
				repository: this.typeOrmKeyResultTemplateRepository
			},
			{
				repository: this.typeOrmKeyResultUpdateRepository
			},
			/*
			 * Goal KPI & Related Entities
			 */
			{
				repository: this.typeOrmGoalKPIRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'leadId', repository: this.typeOrmEmployeeRepository }]
			},
			{
				repository: this.typeOrmGoalKPITemplateRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'leadId', repository: this.typeOrmEmployeeRepository }]
			},
			{
				repository: this.typeOrmGoalTemplateRepository
			},
			{
				repository: this.typeOrmGoalTimeFrameRepository
			},
			{
				repository: this.typeOrmGoalGeneralSettingRepository
			},
			/*
			 * Integration & Related Entities
			 */
			{
				repository: this.typeOrmIntegrationTenantRepository
			},
			{
				repository: this.typeOrmIntegrationSettingRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'integrationId', repository: this.typeOrmIntegrationTenantRepository }]
			},
			{
				repository: this.typeOrmIntegrationMapRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'integrationId', repository: this.typeOrmIntegrationTenantRepository }]
			},
			{
				repository: this.typeOrmIntegrationEntitySettingRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'integrationId', repository: this.typeOrmIntegrationTenantRepository }]
			},
			{
				repository: this.typeOrmIntegrationEntitySettingTiedRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'integrationEntitySettingId', repository: this.typeOrmIntegrationEntitySettingRepository }
				]
			},
			/*
			 * Invite & Related Entities
			 */
			{
				repository: this.typeOrmInviteRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'roleId', repository: this.typeOrmRoleRepository },
					{ column: 'invitedById', repository: this.typeOrmUserRepository },
					{ column: 'organizationContactId', repository: this.typeOrmOrganizationContactRepository }
				],
				relations: [
					{
						joinTableName: 'invite_organization_contact',
						foreignKeys: [
							{ column: 'inviteId', repository: this.typeOrmEquipmentSharingRepository },
							{ column: 'organizationContactId', repository: this.typeOrmOrganizationContactRepository }
						]
					},
					{
						joinTableName: 'invite_organization_department',
						foreignKeys: [
							{ column: 'inviteId', repository: this.typeOrmEquipmentSharingRepository },
							{
								column: 'organizationDepartmentId',
								repository: this.typeOrmOrganizationDepartmentRepository
							}
						]
					},
					{
						joinTableName: 'invite_organization_project',
						foreignKeys: [
							{ column: 'inviteId', repository: this.typeOrmEquipmentSharingRepository },
							{ column: 'organizationProjectId', repository: this.typeOrmOrganizationProjectRepository }
						]
					}
				]
			},
			{
				repository: this.typeOrmOrganizationTeamEmployeeRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'organizationTeamId', repository: this.typeOrmOrganizationTeamRepository },
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository },
					{ column: 'roleId', repository: this.typeOrmRoleRepository }
				]
			},
			/*
			 * Pipeline & Stage Entities
			 */
			{
				repository: this.typeOrmPipelineRepository
			},
			{
				repository: this.typeOrmPipelineStageRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'pipelineId', repository: this.typeOrmPipelineRepository }]
			},
			{
				repository: this.typeOrmDealRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'createdByUserId', repository: this.typeOrmUserRepository },
					{ column: 'stageId', repository: this.typeOrmPipelineStageRepository },
					{ column: 'clientId', repository: this.typeOrmOrganizationContactRepository }
				]
			},
			/*
			 * Product & Related Entities
			 */
			{
				repository: this.typeOrmProductCategoryRepository
			},
			{
				repository: this.typeOrmProductCategoryTranslationRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'referenceId', repository: this.typeOrmProductCategoryRepository }]
			},
			{
				repository: this.typeOrmProductTypeRepository
			},
			{
				repository: this.typeOrmProductTypeTranslationRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'referenceId', repository: this.typeOrmProductTypeRepository }]
			},
			{
				repository: this.typeOrmProductOptionGroupRepository
			},
			{
				repository: this.typeOrmProductOptionRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'groupId', repository: this.typeOrmProductOptionGroupRepository }]
			},
			{
				repository: this.typeOrmProductOptionTranslationRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'referenceId', repository: this.typeOrmProductOptionRepository }]
			},
			{
				repository: this.typeOrmProductOptionGroupTranslationRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'referenceId', repository: this.typeOrmProductOptionGroupRepository }]
			},
			{
				repository: this.typeOrmImageAssetRepository
			},
			{
				repository: this.typeOrmProductRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'featuredImageId', repository: this.typeOrmImageAssetRepository },
					{ column: 'typeId', repository: this.typeOrmProductTypeRepository },
					{ column: 'categoryId', repository: this.typeOrmProductCategoryRepository }
				],
				relations: [{ joinTableName: 'product_gallery_item' }]
			},
			{
				repository: this.typeOrmProductTranslationRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'referenceId', repository: this.typeOrmProductRepository }]
			},
			{
				repository: this.typeOrmProductVariantPriceRepository,
				isCheckRelation: true
			},
			{
				repository: this.typeOrmProductVariantSettingRepository
			},
			{
				repository: this.typeOrmProductVariantRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'productId', repository: this.typeOrmProductRepository },
					{ column: 'imageId', repository: this.typeOrmImageAssetRepository },
					{ column: 'priceId', repository: this.typeOrmProductVariantPriceRepository },
					{ column: 'settingsId', repository: this.typeOrmProductVariantSettingRepository }
				],
				relations: [{ joinTableName: 'product_variant_options_product_option' }]
			},
			{
				repository: this.typeOrmWarehouseRepository,
				uniqueIdentifier: [{ column: 'email' }, { column: 'code' }],
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'logoId', repository: this.typeOrmImageAssetRepository },
					{ column: 'contactId', repository: this.typeOrmContactRepository }
				]
			},
			{
				repository: this.typeOrmMerchantRepository,
				uniqueIdentifier: [{ column: 'email' }, { column: 'code' }],
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'logoId', repository: this.typeOrmImageAssetRepository },
					{ column: 'contactId', repository: this.typeOrmContactRepository }
				],
				relations: [{ joinTableName: 'warehouse_merchant' }]
			},
			{
				repository: this.typeOrmWarehouseProductRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'warehouseId', repository: this.typeOrmWarehouseRepository },
					{ column: 'productId', repository: this.typeOrmProductRepository }
				]
			},
			{
				repository: this.typeOrmWarehouseProductVariantRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'variantId', repository: this.typeOrmProductVariantRepository },
					{ column: 'warehouseProductId', repository: this.typeOrmWarehouseProductRepository }
				]
			},
			/*
			 * Payment & Related Entities
			 */
			{
				repository: this.typeOrmPaymentRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'invoiceId', repository: this.typeOrmInvoiceRepository },
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository },
					{ column: 'recordedById', repository: this.typeOrmUserRepository },
					{ column: 'projectId', repository: this.typeOrmOrganizationProjectRepository },
					{ column: 'contactId', repository: this.typeOrmOrganizationContactRepository }
				]
			},
			/*
			 * Request Approval & Related Entities
			 */
			{
				repository: this.typeOrmRequestApprovalRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'approvalPolicyId', repository: this.typeOrmApprovalPolicyRepository }]
			},
			{
				repository: this.typeOrmRequestApprovalEmployeeRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'requestApprovalId', repository: this.typeOrmRequestApprovalRepository },
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }
				]
			},
			{
				repository: this.typeOrmRequestApprovalTeamRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'requestApprovalId', repository: this.typeOrmRequestApprovalRepository },
					{ column: 'teamId', repository: this.typeOrmOrganizationTeamRepository }
				]
			},
			/*
			 * Tasks & Related Entities
			 */
			{
				repository: this.typeOrmTaskRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'projectId', repository: this.typeOrmOrganizationProjectRepository },
					{ column: 'creatorId', repository: this.typeOrmUserRepository },
					{ column: 'organizationSprintId', repository: this.typeOrmOrganizationSprintRepository }
				],
				relations: [{ joinTableName: 'task_employee' }, { joinTableName: 'task_team' }]
			},
			/*
			 * Timeoff & Related Entities
			 */
			{
				repository: this.typeOrmTimeOffPolicyRepository,
				relations: [{ joinTableName: 'time_off_policy_employee' }]
			},
			{
				repository: this.typeOrmTimeOffRequestRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'policyId', repository: this.typeOrmTimeOffPolicyRepository }],
				relations: [{ joinTableName: 'time_off_request_employee' }]
			},
			/*
			 * Timesheet & Related Entities
			 */
			{
				repository: this.typeOrmTimesheetRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository },
					{ column: 'approvedById', repository: this.typeOrmEmployeeRepository }
				]
			},
			{
				repository: this.typeOrmTimeLogRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository },
					{ column: 'timesheetId', repository: this.typeOrmTimesheetRepository },
					{ column: 'projectId', repository: this.typeOrmOrganizationProjectRepository },
					{ column: 'taskId', repository: this.typeOrmTaskRepository },
					{ column: 'organizationContactId', repository: this.typeOrmOrganizationContactRepository }
				],
				relations: [{ joinTableName: 'time_slot_time_logs' }]
			},
			{
				repository: this.typeOrmTimeSlotRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'employeeId', repository: this.typeOrmEmployeeRepository }]
			},
			{
				repository: this.typeOrmTimeSlotMinuteRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'timeSlotId', repository: this.typeOrmTimeSlotRepository }]
			},
			{
				repository: this.typeOrmScreenshotRepository,
				isCheckRelation: true,
				foreignKeys: [{ column: 'timeSlotId', repository: this.typeOrmTimeSlotRepository }]
			},
			{
				repository: this.typeOrmActivityRepository,
				isCheckRelation: true,
				foreignKeys: [
					{ column: 'employeeId', repository: this.typeOrmEmployeeRepository },
					{ column: 'projectId', repository: this.typeOrmOrganizationProjectRepository },
					{ column: 'timeSlotId', repository: this.typeOrmTimeSlotRepository },
					{ column: 'taskId', repository: this.typeOrmTaskRepository }
				]
			},
			/*
			 * Tag & Related Entities
			 */
			{
				repository: this.typeOrmTagRepository,
				relations: [
					{ joinTableName: 'tag_candidate' },
					{ joinTableName: 'tag_employee' },
					{ joinTableName: 'tag_equipment' },
					{ joinTableName: 'tag_event_type' },
					{ joinTableName: 'tag_expense' },
					{ joinTableName: 'tag_income' },
					{ joinTableName: 'tag_integration' },
					{ joinTableName: 'tag_invoice' },
					{ joinTableName: 'tag_merchant' },
					{ joinTableName: 'tag_organization_contact' },
					{ joinTableName: 'tag_organization_department' },
					{ joinTableName: 'tag_organization_employee_level' },
					{ joinTableName: 'tag_organization_employment_type' },
					{ joinTableName: 'tag_organization_expense_category' },
					{ joinTableName: 'tag_organization_position' },
					{ joinTableName: 'tag_organization_project' },
					{ joinTableName: 'tag_organization_team' },
					{ joinTableName: 'tag_organization_vendor' },
					{ joinTableName: 'tag_organization' },
					{ joinTableName: 'tag_payment' },
					{ joinTableName: 'tag_product' },
					{ joinTableName: 'tag_proposal' },
					{ joinTableName: 'tag_request_approval' },
					{ joinTableName: 'tag_task' },
					{ joinTableName: 'tag_warehouse' }
				]
			},
			...this.dynamicEntitiesClassMap
		] as IRepositoryModel<any>[];
	}
}
