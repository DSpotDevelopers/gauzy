// Modified code from https://github.com/xmlking/ngx-starter-kit.
// MIT License, see https://github.com/xmlking/ngx-starter-kit/blob/develop/LICENSE
// Copyright (c) 2018 Sumanth Chinthagunta

import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { filter, map, some } from 'underscore';
import { ConfigService } from '@gauzy/config';
import {
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
	CandidateSkill,
	CandidateSource,
	CandidateTechnologies,
	Contact,
	Deal,
	EmailHistory,
	Employee,
	EmployeeAppointment,
	EmployeeAward,
	EmployeeLevel,
	EmployeeRecurringExpense,
	EmployeeSetting,
	Equipment,
	EquipmentSharing,
	EstimateEmail,
	EventType,
	Expense,
	ExpenseCategory,
	FeatureOrganization,
	Goal,
	GoalKPI,
	GoalKPITemplate,
	GoalTemplate,
	GoalTimeFrame,
	Income,
	IntegrationEntitySetting,
	IntegrationEntitySettingTied,
	IntegrationMap,
	IntegrationSetting,
	IntegrationTenant,
	Invite,
	Invoice,
	InvoiceEstimateHistory,
	InvoiceItem,
	KeyResult,
	KeyResultTemplate,
	KeyResultUpdate,
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
	ProductOption,
	ProductVariant,
	ProductVariantPrice,
	ProductVariantSetting,
	RequestApproval,
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
	User,
	UserOrganization
} from '../../core/entities/internal';
import { RequestContext } from '../../core/context';
import { TypeOrmActivityRepository } from '../../time-tracking/activity/repository';
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
import { TypeOrmCandidateSkillRepository } from '../../candidate-skill/repository';
import { TypeOrmCandidateSourceRepository } from '../../candidate-source/repository';
import { TypeOrmCandidateTechnologiesRepository } from '../../candidate-technologies/repository';
import { TypeOrmCandidateRepository } from '../../candidate/repository';
import { TypeOrmContactRepository } from '../../contact/repository';
import { TypeOrmDealRepository } from '../../deal/repository';
import { TypeOrmEmailHistoryRepository } from '../../email-history/repository';
import { TypeOrmEmployeeAppointmentRepository } from '../../employee-appointment/repository';
import { TypeOrmEmployeeAwardRepository } from '../../employee-award/repository';
import { TypeOrmEmployeeLevelRepository } from '../../employee-level/repository';
import { TypeOrmEmployeeRecurringExpenseRepository } from '../../employee-recurring-expense/repository';
import { TypeOrmEmployeeSettingRepository } from '../../employee-setting/repository';
import { TypeOrmEmployeeRepository } from '../../employee/repository';
import { TypeOrmEquipmentSharingRepository } from '../../equipment-sharing/repository';
import { TypeOrmEquipmentRepository } from '../../equipment/repository';
import { TypeOrmEstimateEmailRepository } from '../../estimate-email/repository';
import { TypeOrmEventTypeRepository } from '../../event-types/repository';
import { TypeOrmExpenseCategoryRepository } from '../../expense-categories/repository';
import { TypeOrmExpenseRepository } from '../../expense/repository';
import { TypeOrmFeatureOrganizationRepository } from '../../feature/repository';
import { TypeOrmGoalKPITemplateRepository } from '../../goal-kpi-template/repository';
import { TypeOrmGoalKPIRepository } from '../../goal-kpi/repository';
import { TypeOrmGoalTemplateRepository } from '../../goal-template/repository';
import { TypeOrmGoalTimeFrameRepository } from '../../goal-time-frame/repository';
import { TypeOrmGoalRepository } from '../../goal/repository';
import { TypeOrmIncomeRepository } from '../../income/repository';
import { TypeOrmIntegrationEntitySettingTiedRepository } from '../../integration-entity-setting-tied/repository';
import { TypeOrmIntegrationEntitySettingRepository } from '../../integration-entity-setting/repository';
import { TypeOrmIntegrationMapRepository } from '../../integration-map/repository';
import { TypeOrmIntegrationSettingRepository } from '../../integration-setting/repository';
import { TypeOrmIntegrationTenantRepository } from '../../integration-tenant/repository';
import { TypeOrmInviteRepository } from '../../invite/repository';
import { TypeOrmInvoiceEstimateHistoryRepository } from '../../invoice-estimate-history/repository';
import { TypeOrmInvoiceItemRepository } from '../../invoice-item/repository';
import { TypeOrmInvoiceRepository } from '../../invoice/repository';
import { TypeOrmKeyResultTemplateRepository } from '../../keyresult-template/repository';
import { TypeOrmKeyResultUpdateRepository } from '../../keyresult-update/repository';
import { TypeOrmKeyResultRepository } from '../../keyresult/repository';
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
import { TypeOrmProductCategoryRepository } from '../../product-category/repository';
import { TypeOrmProductOptionRepository } from '../../product-option/repository';
import { TypeOrmProductVariantSettingRepository } from '../../product-setting/repository';
import { TypeOrmProductVariantPriceRepository } from '../../product-variant-price/repository';
import { TypeOrmProductVariantRepository } from '../../product-variant/repository';
import { TypeOrmProductRepository } from '../../product/repository';
import { TypeOrmRequestApprovalRepository } from '../../request-approval/repository';
import { TypeOrmSkillRepository } from '../../skills/repository';
import { TypeOrmTagRepository } from '../../tags/repository';
import { TypeOrmTaskRepository } from '../../tasks/repository';
import { TypeOrmTenantSettingRepository } from '../../tenant/tenant-setting/repository';
import { TypeOrmTimeOffPolicyRepository } from '../../time-off-policy/repository';
import { TypeOrmTimeOffRequestRepository } from '../../time-off-request/repository';
import { TypeOrmScreenshotRepository } from '../../time-tracking/screenshot/repository';
import { TypeOrmTimeLogRepository } from '../../time-tracking/time-log/repository';
import { TypeOrmTimeSlotRepository } from '../../time-tracking/time-slot/repository';
import { TypeOrmTimesheetRepository } from '../../time-tracking/timesheet/repository';
import { TypeOrmUserOrganizationRepository } from '../../user-organization/repository';
import { TypeOrmUserRepository } from '../../user/repository';

@Injectable()
export class FactoryResetService {
	repositories: Repository<any>[];

	constructor(
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

		@InjectRepository(CandidateSkill)
		private readonly typeOrmCandidateSkillRepository: TypeOrmCandidateSkillRepository,

		@InjectRepository(CandidateSource)
		private readonly typeOrmCandidateSourceRepository: TypeOrmCandidateSourceRepository,

		@InjectRepository(CandidateTechnologies)
		private readonly typeOrmCandidateTechnologiesRepository: TypeOrmCandidateTechnologiesRepository,

		@InjectRepository(Contact)
		private readonly typeOrmContactRepository: TypeOrmContactRepository,

		@InjectRepository(Deal)
		private readonly typeOrmDealRepository: TypeOrmDealRepository,

		@InjectRepository(EmailHistory)
		private readonly typeOrmEmailHistoryRepository: TypeOrmEmailHistoryRepository,

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

		@InjectRepository(EstimateEmail)
		private readonly typeOrmEstimateEmailRepository: TypeOrmEstimateEmailRepository,

		@InjectRepository(EventType)
		private readonly typeOrmEventTypeRepository: TypeOrmEventTypeRepository,

		@InjectRepository(Expense)
		private readonly typeOrmExpenseRepository: TypeOrmExpenseRepository,

		@InjectRepository(ExpenseCategory)
		private readonly typeOrmExpenseCategoryRepository: TypeOrmExpenseCategoryRepository,

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

		@InjectRepository(Income)
		private readonly typeOrmIncomeRepository: TypeOrmIncomeRepository,

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

		@InjectRepository(EmployeeLevel)
		private readonly typeOrmEmployeeLevelRepository: TypeOrmEmployeeLevelRepository,

		@InjectRepository(OrganizationAward)
		private readonly typeOrmOrganizationAwardRepository: TypeOrmOrganizationAwardRepository,

		@InjectRepository(Organization)
		private readonly typeOrmOrganizationRepository: TypeOrmOrganizationRepository,

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

		@InjectRepository(ProductCategory)
		private readonly typeOrmProductCategoryRepository: TypeOrmProductCategoryRepository,

		@InjectRepository(ProductOption)
		private readonly typeOrmProductOptionRepository: TypeOrmProductOptionRepository,

		@InjectRepository(ProductVariantSetting)
		private readonly typeOrmProductVariantSettingRepository: TypeOrmProductVariantSettingRepository,

		@InjectRepository(ProductVariant)
		private readonly typeOrmProductVariantRepository: TypeOrmProductVariantRepository,

		@InjectRepository(ProductVariantPrice)
		private readonly typeOrmProductVariantPriceRepository: TypeOrmProductVariantPriceRepository,

		@InjectRepository(Skill)
		private readonly typeOrmSkillRepository: TypeOrmSkillRepository,

		@InjectRepository(Screenshot)
		private readonly typeOrmScreenshotRepository: TypeOrmScreenshotRepository,

		@InjectRepository(RequestApproval)
		private readonly typeOrmRequestApprovalRepository: TypeOrmRequestApprovalRepository,

		@InjectRepository(Tag)
		private readonly typeOrmTagRepository: TypeOrmTagRepository,

		@InjectRepository(Task)
		private readonly typeOrmTaskRepository: TypeOrmTaskRepository,

		@InjectRepository(Timesheet)
		private readonly typeOrmTimesheetRepository: TypeOrmTimesheetRepository,

		@InjectRepository(TimeLog)
		private readonly typeOrmTimeLogRepository: TypeOrmTimeLogRepository,

		@InjectRepository(TimeSlot)
		private readonly typeOrmTimeSlotRepository: TypeOrmTimeSlotRepository,

		@InjectRepository(TimeOffRequest)
		private readonly typeOrmTimeOffRequestRepository: TypeOrmTimeOffRequestRepository,

		@InjectRepository(TimeOffPolicy)
		private readonly typeOrmTimeOffPolicyRepository: TypeOrmTimeOffPolicyRepository,

		@InjectRepository(TenantSetting)
		private readonly typeOrmTenantSettingRepository: TypeOrmTenantSettingRepository,

		@InjectRepository(User)
		private readonly typeOrmUserRepository: TypeOrmUserRepository,

		@InjectRepository(UserOrganization)
		private readonly typeOrmUserOrganizationRepository: TypeOrmUserOrganizationRepository,

		private readonly configService: ConfigService
	) {}

	async onModuleInit() {
		this.registerCoreRepositories();
	}

	async reset() {
		if (this.configService.get('demo') === true) {
			throw new ForbiddenException();
		}
		const userId = RequestContext.currentUserId();
		const tenantId = RequestContext.currentTenantId();

		const user = await this.typeOrmUserRepository.findOneBy({
			id: userId,
			tenantId
		});
		user.thirdPartyId = null;
		user.preferredLanguage = null;
		user.preferredComponentLayout = null;
		await this.typeOrmUserRepository.save(user);

		const oldOrganization = await this.typeOrmUserOrganizationRepository.findOne({
			order: {
				createdAt: 'ASC'
			},
			select: ['organizationId'],
			where: {
				userId: userId
			}
		});
		const organizations = await this.typeOrmUserOrganizationRepository.find({
			select: ['organizationId'],
			where: {
				userId: userId
			}
		});

		const allOrganizationsIds = map(organizations, (org) => {
			return org.organizationId;
		});
		const deleteOrganizationIds = filter(allOrganizationsIds, (organizationsId) => {
			return organizationsId != oldOrganization.organizationId;
		});

		const findInput = {
			organizationIds: allOrganizationsIds,
			tenantId: user.tenantId
		};

		await this.deleteSpecificTables(findInput);
		if (deleteOrganizationIds?.length > 0) {
			await this.typeOrmUserOrganizationRepository.delete({
				userId: userId,
				organizationId: In(deleteOrganizationIds),
				tenantId: user.tenantId
			});
			await this.typeOrmOrganizationRepository.delete({
				id: In(deleteOrganizationIds),
				tenantId: user.tenantId
			});
		}

		const firstOrganization = await this.typeOrmOrganizationRepository.findOneBy({
			id: oldOrganization.organizationId
		});

		return firstOrganization;
	}

	async deleteSpecificTables(findInput: { organizationIds: string[]; tenantId: string }) {
		for (const repository of this.repositories) {
			await this.deleteRepository(repository, findInput);
		}
	}

	async deleteRepository(
		repository: Repository<any>,
		findInput: {
			organizationIds: string[];
			tenantId: string;
		}
	): Promise<any> {
		let conditions: any = {};
		const columns = repository.metadata.ownColumns.map((column) => column.propertyName);
		const tenantId = some(columns, (column) => {
			return column === 'tenantId';
		});
		const organizationId = some(columns, (column) => {
			return column === 'organizationId';
		});

		if (tenantId && organizationId) {
			conditions = {
				tenantId: findInput['tenantId'],
				organizationId: In(findInput['organizationIds'])
			};
		}
		if (tenantId && !organizationId) {
			conditions = {
				tenantId: findInput['tenantId']
			};
		}
		return repository.delete(conditions);
	}

	private registerCoreRepositories() {
		this.repositories = [
			this.typeOrmTagRepository,
			this.typeOrmActivityRepository,
			this.typeOrmApprovalPolicyRepository,
			this.typeOrmAppointmentEmployeeRepository,
			this.typeOrmAvailabilitySlotRepository,
			this.typeOrmCandidateCriterionsRatingRepository,
			this.typeOrmCandidateDocumentRepository,
			this.typeOrmCandidateEducationRepository,
			this.typeOrmCandidateExperienceRepository,
			this.typeOrmCandidateFeedbackRepository,
			this.typeOrmCandidateInterviewersRepository,
			this.typeOrmCandidateInterviewRepository,
			this.typeOrmCandidateRepository,
			this.typeOrmCandidateSkillRepository,
			this.typeOrmCandidateSourceRepository,
			this.typeOrmCandidateTechnologiesRepository,
			this.typeOrmDealRepository,
			this.typeOrmKeyResultRepository,
			this.typeOrmKeyResultTemplateRepository,
			this.typeOrmKeyResultUpdateRepository,
			this.typeOrmGoalKPIRepository,
			this.typeOrmGoalKPITemplateRepository,
			this.typeOrmGoalRepository,
			this.typeOrmGoalTemplateRepository,
			this.typeOrmGoalTimeFrameRepository,
			this.typeOrmEmailHistoryRepository,
			this.typeOrmTimeLogRepository,
			this.typeOrmTimeOffPolicyRepository,
			this.typeOrmTimeOffRequestRepository,
			this.typeOrmTimesheetRepository,
			this.typeOrmTimeSlotRepository,
			this.typeOrmInvoiceItemRepository,
			this.typeOrmInvoiceEstimateHistoryRepository,
			this.typeOrmInvoiceRepository,
			this.typeOrmFeatureOrganizationRepository,
			this.typeOrmEmployeeAppointmentRepository,
			this.typeOrmEmployeeAwardRepository,
			this.typeOrmEmployeeLevelRepository,
			this.typeOrmEmployeeRecurringExpenseRepository,
			this.typeOrmEmployeeRepository,
			this.typeOrmEmployeeSettingRepository,
			this.typeOrmEquipmentSharingRepository,
			this.typeOrmEquipmentRepository,
			this.typeOrmEstimateEmailRepository,
			this.typeOrmEventTypeRepository,
			this.typeOrmExpenseCategoryRepository,
			this.typeOrmExpenseRepository,
			this.typeOrmIncomeRepository,
			this.typeOrmIntegrationEntitySettingRepository,
			this.typeOrmIntegrationEntitySettingTiedRepository,
			this.typeOrmIntegrationMapRepository,
			this.typeOrmIntegrationSettingRepository,
			this.typeOrmIntegrationTenantRepository,
			this.typeOrmInviteRepository,
			this.typeOrmOrganizationAwardRepository,
			this.typeOrmOrganizationDepartmentRepository,
			this.typeOrmOrganizationDocumentRepository,
			this.typeOrmOrganizationEmploymentTypeRepository,
			this.typeOrmOrganizationLanguageRepository,
			this.typeOrmOrganizationPositionRepository,
			this.typeOrmOrganizationSprintRepository,
			this.typeOrmOrganizationTeamEmployeeRepository,
			this.typeOrmOrganizationTeamRepository,
			this.typeOrmOrganizationVendorRepository,
			this.typeOrmOrganizationRecurringExpenseRepository,
			this.typeOrmOrganizationProjectRepository,
			this.typeOrmOrganizationContactRepository,
			this.typeOrmProductCategoryRepository,
			this.typeOrmProductOptionRepository,
			this.typeOrmProductRepository,
			this.typeOrmProductVariantPriceRepository,
			this.typeOrmProductVariantRepository,
			this.typeOrmProductVariantSettingRepository,
			this.typeOrmPaymentRepository,
			this.typeOrmPipelineRepository,
			this.typeOrmRequestApprovalRepository,
			this.typeOrmScreenshotRepository,
			this.typeOrmSkillRepository,
			this.typeOrmPipelineStageRepository,
			this.typeOrmContactRepository,
			this.typeOrmTaskRepository,
			this.typeOrmTenantSettingRepository
		];
	}
}
