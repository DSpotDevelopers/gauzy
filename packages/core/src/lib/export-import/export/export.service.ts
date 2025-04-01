import { Injectable, OnModuleInit, Logger as NestLogger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { camelCase } from 'typeorm/util/StringUtils';
import { ColumnMetadata } from 'typeorm/metadata/ColumnMetadata';
import { BehaviorSubject } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import * as archiver from 'archiver';
import * as csv from 'csv-writer';
import * as fs from 'fs';
import * as path from 'path';
import * as fse from 'fs-extra';
import { ConfigService } from '@gauzy/config';
import { getEntitiesFromPlugins } from '@gauzy/plugin';
import { isFunction, isNotEmpty } from '@gauzy/common';
import { ConnectionEntityManager } from '../../database/connection-entity-manager';
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
	Country,
	Currency,
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
	Tenant,
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
} from './../../core/entities/internal';
import { RequestContext } from './../../core/context';
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
import { TypeOrmCountryRepository } from '../../country/repository';
import { TypeOrmCurrencyRepository } from '../../currency/repository';
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
import { TypeOrmTenantRepository } from '../../tenant/repository';
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

export interface IColumnRelationMetadata {
	joinTableName: string;
}
export interface IRepositoryModel<T> {
	repository: Repository<T>;
	tenantBase?: boolean;
	relations?: IColumnRelationMetadata[];
	condition?: any;
}

@Injectable()
export class ExportService implements OnModuleInit {
	@Logger()
	private readonly logger: NestLogger;

	private _dirname: string;
	private readonly _basename = '/export';

	public idZip = new BehaviorSubject<string>('');
	public idCsv = new BehaviorSubject<string>('');

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

		@InjectRepository(Country)
		private readonly typeOrmCountryRepository: TypeOrmCountryRepository,

		@InjectRepository(Currency)
		private readonly typeOrmCurrencyRepository: TypeOrmCurrencyRepository,

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

		@InjectRepository(Tenant)
		private readonly typeOrmTenantRepository: TypeOrmTenantRepository,

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
		private readonly _connectionEntityManager: ConnectionEntityManager
	) {}

	async onModuleInit() {
		const public_path = this.configService.assetOptions.assetPublicPath || __dirname;
		//base import csv directory path
		this._dirname = path.join(public_path, this._basename);

		await this.createDynamicInstanceForPluginEntities();
		await this.registerCoreRepositories();
	}

	async createFolders(): Promise<any> {
		return new Promise((resolve, reject) => {
			const id = uuidv4();
			this.idCsv.next(id);
			fs.access(`${this._dirname}/${id}/csv`, (error) => {
				if (!error) {
					resolve(null);
				} else {
					fs.mkdir(`${this._dirname}/${id}/csv`, { recursive: true }, (err) => {
						if (err) reject(err);
						resolve('');
					});
				}
			});
		});
	}

	async archiveAndDownload(): Promise<any> {
		return new Promise((resolve, reject) => {
			const id = uuidv4();
			const fileNameS = id + '_export.zip';
			this.idZip.next(fileNameS);

			const output = fs.createWriteStream(`${this._dirname}/${fileNameS}`);

			const archive = archiver('zip', {
				zlib: { level: 9 }
			});

			output.on('close', function () {
				resolve('');
			});

			output.on('end', function () {
				this.logger.verbose('Data has been drained');
			});

			archive.on('warning', function (err) {
				if (err.code === 'ENOENT') {
					reject(err);
				} else {
					this.logger.error(`Unexpected error archiving and downloading: ${err}`);
				}
			});

			archive.on('error', reject);

			let id$ = '';
			this.idCsv.subscribe((idCsv) => {
				id$ = idCsv;
			});

			archive.pipe(output);
			archive.directory(`${this._dirname}/${id$}/csv`, false);
			archive.finalize();
		});
	}

	async getAsCsv(item: IRepositoryModel<any>, where: { tenantId: string }): Promise<any> {
		const conditions = {};
		if (item.tenantBase !== false) {
			conditions['where'] = {
				tenantId: where['tenantId']
			};
		}

		/*
		 * Replace condition with default condition
		 */
		if (isNotEmpty(item.condition) && isNotEmpty(conditions['where'])) {
			const {
				condition: { replace = 'tenantId', column = 'id' }
			} = item;
			if (`${replace}` in conditions['where']) {
				delete conditions['where'][replace];
				conditions['where'][column] = where[replace];
			}
		}

		const { repository } = item;
		const nameFile = repository.metadata.tableName;

		const [items, count] = await repository.findAndCount(conditions);
		if (count > 0) {
			return await this.csvWriter(nameFile, items);
		}

		return false;
	}

	async csvWriter(filename: string, items: any[]) {
		const createCsvWriter = csv.createObjectCsvWriter;
		const dataIn = [];
		const dataKeys = Object.keys(items[0]);

		for (const count of dataKeys) {
			dataIn.push({ id: count, title: count });
		}

		let id$ = '';
		this.idCsv.subscribe((id) => {
			id$ = id;
		});

		const csvWriter = createCsvWriter({
			path: `${this._dirname}/${id$}/csv/${filename}.csv`,
			header: dataIn
		});

		await csvWriter.writeRecords(items);
		return items;
	}

	async csvTemplateWriter(filename: string, columns: any) {
		if (columns) {
			const createCsvWriter = csv.createObjectCsvWriter;
			const dataIn = [];
			const dataKeys = columns;

			for (const count of dataKeys) {
				dataIn.push({ id: count, title: count });
			}

			let id$ = '';
			this.idCsv.subscribe((id) => {
				id$ = id;
			});

			const csvWriter = createCsvWriter({
				path: `${this._dirname}/${id$}/csv/${filename}.csv`,
				header: dataIn
			});

			await csvWriter.writeRecords([]);
			return '';
		}
		return false;
	}

	async downloadToUser(res) {
		let fileName = '';

		this.idZip.subscribe((filename) => {
			fileName = filename;
		});

		res.download(`${this._dirname}/${fileName}`);
		return '';
	}

	async deleteCsvFiles(): Promise<string | null> {
		return new Promise((resolve) => {
			let id$ = '';

			this.idCsv.subscribe((id) => {
				id$ = id;
			});

			fs.access(`${this._dirname}/${id$}`, (error) => {
				if (!error) {
					fse.removeSync(`${this._dirname}/${id$}`);
					resolve('');
				} else {
					resolve(null);
				}
			});
		});
	}
	async deleteArchive(): Promise<string | null> {
		return new Promise((resolve) => {
			let fileName = '';
			this.idZip.subscribe((fileName$) => {
				fileName = fileName$;
			});
			fs.access(`${this._dirname}/${fileName}`, (error) => {
				if (!error) {
					fse.removeSync(`${this._dirname}/${fileName}`);
					resolve('');
				} else {
					resolve(null);
				}
			});
		});
	}

	async exportTables() {
		for await (const item of this.repositories) {
			await this.getAsCsv(item, {
				tenantId: RequestContext.currentTenantId()
			});

			// export pivot relational tables
			if (isNotEmpty(item.relations)) {
				await this.exportRelationalTables(item, {
					tenantId: RequestContext.currentTenantId()
				});
			}
		}
		return true;
	}

	async exportSpecificTables(names: string[]) {
		for await (const item of this.repositories) {
			const nameFile = item.repository.metadata.tableName;
			if (names.includes(nameFile)) {
				await this.getAsCsv(item, {
					tenantId: RequestContext.currentTenantId()
				});

				// export pivot relational tables
				if (isNotEmpty(item.relations)) {
					await this.exportRelationalTables(item, {
						tenantId: RequestContext.currentTenantId()
					});
				}
			}
		}
		return true;
	}

	/*
	 * Export Many To Many Pivot Table Using TypeORM Relations
	 */
	async exportRelationalTables(entity: IRepositoryModel<any>, where: { tenantId: string }) {
		const { repository, relations } = entity;
		const masterTable = repository.metadata.givenTableName;

		for await (const item of repository.metadata.manyToManyRelations) {
			const relation = relations.find(
				(relation: IColumnRelationMetadata) => relation.joinTableName === item.joinTableName
			);
			if (relation) {
				const [joinColumn] = item.joinColumns;
				if (joinColumn) {
					const { entityMetadata, propertyName, referencedColumn } = joinColumn;

					const referenceColumn = referencedColumn.propertyName;
					const referenceTableName = entityMetadata.givenTableName;
					let sql = `
						SELECT
							${referenceTableName}.*
						FROM
							${referenceTableName}
						INNER JOIN ${masterTable}
							ON "${referenceTableName}"."${propertyName}" = "${masterTable}"."${referenceColumn}"
					`;
					if (entity.tenantBase !== false) {
						sql += ` WHERE "${masterTable}"."tenantId" = '${where['tenantId']}'`;
					}

					const items = await repository.manager.query(sql);
					if (isNotEmpty(items)) {
						await this.csvWriter(referenceTableName, items);
					}
				}
			}
		}
	}

	async exportSpecificTablesSchema() {
		for await (const item of this.repositories) {
			const { repository, relations } = item;
			const nameFile = repository.metadata.tableName;
			const columns = repository.metadata.ownColumns.map((column: ColumnMetadata) => column.propertyName);

			await this.csvTemplateWriter(nameFile, columns);

			// export pivot relational tables
			if (isNotEmpty(relations)) {
				await this.exportRelationalTablesSchema(item);
			}
		}
		return true;
	}

	async exportRelationalTablesSchema(entity: IRepositoryModel<any>) {
		const { repository, relations } = entity;
		for await (const item of repository.metadata.manyToManyRelations) {
			const relation = relations.find(
				(relation: IColumnRelationMetadata) => relation.joinTableName === item.joinTableName
			);
			if (relation) {
				const referenceTableName = item.junctionEntityMetadata.givenTableName;
				const columns = item.junctionEntityMetadata.columns.map(
					(column: ColumnMetadata) => column.propertyName
				);

				await this.csvTemplateWriter(referenceTableName, columns);
			}
		}
	}

	/*
	 * Load all plugins entities for export data
	 */
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
	 */
	private async registerCoreRepositories() {
		this.repositories = [
			{
				repository: this.typeOrmAccountingTemplateRepository
			},
			{
				repository: this.typeOrmActivityRepository
			},
			{
				repository: this.typeOrmAppointmentEmployeeRepository
			},
			{
				repository: this.typeOrmApprovalPolicyRepository
			},
			{
				repository: this.typeOrmAvailabilitySlotRepository
			},
			{
				repository: this.typeOrmCandidateRepository,
				relations: [
					{ joinTableName: 'candidate_department' },
					{ joinTableName: 'candidate_employment_type' },
					{ joinTableName: 'tag_candidate' }
				]
			},
			{
				repository: this.typeOrmCandidateCriterionsRatingRepository
			},
			{
				repository: this.typeOrmCandidateDocumentRepository
			},
			{
				repository: this.typeOrmCandidateEducationRepository
			},
			{
				repository: this.typeOrmCandidateExperienceRepository
			},
			{
				repository: this.typeOrmCandidateFeedbackRepository
			},
			{
				repository: this.typeOrmCandidateInterviewersRepository
			},
			{
				repository: this.typeOrmCandidateInterviewRepository
			},
			{
				repository: this.typeOrmCandidatePersonalQualitiesRepository
			},
			{
				repository: this.typeOrmCandidateSkillRepository
			},
			{
				repository: this.typeOrmCandidateSourceRepository
			},
			{
				repository: this.typeOrmCandidateTechnologiesRepository
			},
			{
				repository: this.typeOrmCustomSmtpRepository
			},
			{
				repository: this.typeOrmContactRepository
			},
			{
				repository: this.typeOrmCountryRepository,
				tenantBase: false
			},
			{
				repository: this.typeOrmCurrencyRepository,
				tenantBase: false
			},
			{
				repository: this.typeOrmDealRepository
			},
			{
				repository: this.typeOrmEmailHistoryRepository
			},
			{
				repository: this.typeOrmEmailTemplateRepository
			},
			{
				repository: this.typeOrmEmployeeAppointmentRepository
			},
			{
				repository: this.typeOrmEmployeeAwardRepository
			},
			{
				repository: this.typeOrmEmployeeLevelRepository,
				relations: [{ joinTableName: 'tag_organization_employee_level' }]
			},
			{
				repository: this.typeOrmEmployeeRecurringExpenseRepository
			},
			{
				repository: this.typeOrmEmployeeRepository,
				relations: [{ joinTableName: 'tag_employee' }]
			},
			{
				repository: this.typeOrmEmployeeSettingRepository
			},
			{
				repository: this.typeOrmEquipmentRepository,
				relations: [{ joinTableName: 'tag_equipment' }]
			},
			{
				repository: this.typeOrmEquipmentSharingRepository,
				relations: [
					{ joinTableName: 'equipment_shares_employees' },
					{ joinTableName: 'equipment_shares_teams' }
				]
			},
			{
				repository: this.typeOrmEquipmentSharingPolicyRepository
			},
			{
				repository: this.typeOrmEstimateEmailRepository
			},
			{
				repository: this.typeOrmEventTypeRepository,
				relations: [{ joinTableName: 'tag_event_type' }]
			},
			{
				repository: this.typeOrmExpenseCategoryRepository,
				relations: [{ joinTableName: 'tag_organization_expense_category' }]
			},
			{
				repository: this.typeOrmExpenseRepository,
				relations: [{ joinTableName: 'tag_expense' }]
			},
			{
				repository: this.typeOrmFeatureRepository,
				tenantBase: false
			},
			{
				repository: this.typeOrmFeatureOrganizationRepository
			},
			{
				repository: this.typeOrmGoalKPIRepository
			},
			{
				repository: this.typeOrmGoalKPITemplateRepository
			},
			{
				repository: this.typeOrmGoalRepository
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
			{
				repository: this.typeOrmIncomeRepository,
				relations: [{ joinTableName: 'tag_income' }]
			},
			{
				repository: this.typeOrmIntegrationEntitySettingRepository
			},
			{
				repository: this.typeOrmIntegrationEntitySettingTiedRepository
			},
			{
				repository: this.typeOrmIntegrationMapRepository
			},
			{
				repository: this.typeOrmIntegrationRepository,
				tenantBase: false,
				relations: [{ joinTableName: 'integration_integration_type' }, { joinTableName: 'tag_integration' }]
			},
			{
				repository: this.typeOrmIntegrationSettingRepository
			},
			{
				repository: this.typeOrmIntegrationTypeRepository,
				tenantBase: false
			},
			{
				repository: this.typeOrmIntegrationTenantRepository
			},
			{
				repository: this.typeOrmInviteRepository,
				relations: [
					{ joinTableName: 'invite_organization_contact' },
					{ joinTableName: 'invite_organization_department' },
					{ joinTableName: 'invite_organization_project' }
				]
			},
			{
				repository: this.typeOrmInvoiceEstimateHistoryRepository
			},
			{
				repository: this.typeOrmInvoiceItemRepository
			},
			{
				repository: this.typeOrmInvoiceRepository,
				relations: [{ joinTableName: 'tag_invoice' }]
			},
			{
				repository: this.typeOrmKeyResultRepository
			},
			{
				repository: this.typeOrmKeyResultTemplateRepository
			},
			{
				repository: this.typeOrmKeyResultUpdateRepository
			},
			{
				repository: this.typeOrmLanguageRepository,
				tenantBase: false
			},
			{
				repository: this.typeOrmOrganizationAwardRepository
			},
			{
				repository: this.typeOrmOrganizationContactRepository,
				relations: [
					{ joinTableName: 'organization_contact_employee' },
					{ joinTableName: 'tag_organization_contact' }
				]
			},
			{
				repository: this.typeOrmOrganizationDepartmentRepository,
				relations: [
					{ joinTableName: 'organization_department_employee' },
					{ joinTableName: 'tag_organization_department' }
				]
			},
			{
				repository: this.typeOrmOrganizationDocumentRepository
			},
			{
				repository: this.typeOrmOrganizationEmploymentTypeRepository,
				relations: [
					{ joinTableName: 'organization_employment_type_employee' },
					{ joinTableName: 'tag_organization_employment_type' }
				]
			},
			{
				repository: this.typeOrmOrganizationLanguageRepository
			},
			{
				repository: this.typeOrmOrganizationPositionRepository,
				relations: [{ joinTableName: 'tag_organization_position' }]
			},
			{
				repository: this.typeOrmOrganizationProjectRepository,
				relations: [
					{ joinTableName: 'organization_project_employee' },
					{ joinTableName: 'tag_organization_project' }
				]
			},
			{
				repository: this.typeOrmOrganizationRecurringExpenseRepository
			},
			{
				repository: this.typeOrmOrganizationRepository,
				relations: [{ joinTableName: 'tag_organization' }]
			},
			{
				repository: this.typeOrmOrganizationSprintRepository
			},
			{
				repository: this.typeOrmOrganizationTeamEmployeeRepository
			},
			{
				repository: this.typeOrmOrganizationTeamRepository,
				relations: [{ joinTableName: 'tag_organization_team' }]
			},
			{
				repository: this.typeOrmOrganizationVendorRepository,
				relations: [{ joinTableName: 'tag_organization_vendor' }]
			},
			{
				repository: this.typeOrmPaymentRepository,
				relations: [{ joinTableName: 'tag_payment' }]
			},
			{
				repository: this.typeOrmPipelineRepository
			},
			{
				repository: this.typeOrmProductCategoryRepository
			},
			{
				repository: this.typeOrmProductCategoryTranslationRepository
			},
			{
				repository: this.typeOrmProductOptionRepository
			},
			{
				repository: this.typeOrmProductOptionGroupRepository
			},
			{
				repository: this.typeOrmProductOptionGroupTranslationRepository
			},
			{
				repository: this.typeOrmProductOptionTranslationRepository
			},
			{
				repository: this.typeOrmProductRepository,
				relations: [{ joinTableName: 'product_gallery_item' }, { joinTableName: 'tag_product' }]
			},
			{
				repository: this.typeOrmProductTranslationRepository
			},
			{
				repository: this.typeOrmProductTypeRepository
			},
			{
				repository: this.typeOrmProductTypeTranslationRepository
			},
			{
				repository: this.typeOrmProductVariantPriceRepository
			},
			{
				repository: this.typeOrmProductVariantRepository,
				relations: [{ joinTableName: 'product_variant_options_product_option' }]
			},
			{
				repository: this.typeOrmProductVariantSettingRepository
			},
			{
				repository: this.typeOrmImageAssetRepository
			},
			{
				repository: this.typeOrmWarehouseRepository,
				relations: [{ joinTableName: 'tag_warehouse' }]
			},
			{
				repository: this.typeOrmMerchantRepository,
				relations: [{ joinTableName: 'warehouse_merchant' }, { joinTableName: 'tag_merchant' }]
			},
			{
				repository: this.typeOrmWarehouseProductRepository
			},
			{
				repository: this.typeOrmWarehouseProductVariantRepository
			},
			{
				repository: this.typeOrmReportCategoryRepository,
				tenantBase: false
			},
			{
				repository: this.typeOrmReportOrganizationRepository
			},
			{
				repository: this.typeOrmReportRepository,
				tenantBase: false
			},
			{
				repository: this.typeOrmRequestApprovalRepository,
				relations: [{ joinTableName: 'tag_request_approval' }]
			},
			{
				repository: this.typeOrmRequestApprovalEmployeeRepository
			},
			{
				repository: this.typeOrmRequestApprovalTeamRepository
			},
			{
				repository: this.typeOrmRolePermissionRepository
			},
			{
				repository: this.typeOrmRoleRepository
			},
			{
				repository: this.typeOrmScreenshotRepository
			},
			{
				repository: this.typeOrmSkillRepository,
				relations: [{ joinTableName: 'skill_employee' }, { joinTableName: 'skill_organization' }]
			},
			{
				repository: this.typeOrmPipelineStageRepository
			},
			{
				repository: this.typeOrmTagRepository
			},
			{
				repository: this.typeOrmTaskRepository,
				relations: [
					{ joinTableName: 'task_employee' },
					{ joinTableName: 'task_team' },
					{ joinTableName: 'tag_task' }
				]
			},
			{
				repository: this.typeOrmTenantRepository,
				condition: { column: 'id', replace: 'tenantId' }
			},
			{
				repository: this.typeOrmTenantSettingRepository
			},
			{
				repository: this.typeOrmTimeLogRepository,
				relations: [{ joinTableName: 'time_slot_time_logs' }]
			},
			{
				repository: this.typeOrmTimeOffPolicyRepository,
				relations: [{ joinTableName: 'time_off_policy_employee' }]
			},
			{
				repository: this.typeOrmTimeOffRequestRepository,
				relations: [{ joinTableName: 'time_off_request_employee' }]
			},
			{
				repository: this.typeOrmTimesheetRepository
			},
			{
				repository: this.typeOrmTimeSlotRepository
			},
			{
				repository: this.typeOrmTimeSlotMinuteRepository
			},
			{
				repository: this.typeOrmUserOrganizationRepository
			},
			{
				repository: this.typeOrmUserRepository
			},
			...this.dynamicEntitiesClassMap
		] as IRepositoryModel<any>[];
	}
}
