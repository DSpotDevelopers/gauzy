import { In } from 'typeorm';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { GauzyAIService } from '@gauzy/plugin-integration-ai';
import { Employee, TypeOrmEmployeeRepository } from '@gauzy/core';
import { EmployeeUpworkJobsSearchCriterion } from '../../employee-upwork-jobs-search-criterion.entity';
import { JobPreset } from '../../job-preset.entity';
import { SaveEmployeePresetCommand } from '../save-employee-preset.command';
import { TypeOrmJobPresetRepository, TypeOrmEmployeeUpworkJobsSearchCriterionRepository } from '../../repository';

@CommandHandler(SaveEmployeePresetCommand)
export class SaveEmployeePresetHandler implements ICommandHandler<SaveEmployeePresetCommand> {
	constructor(
		@InjectRepository(JobPreset)
		private readonly typeOrmJobPresetRepository: TypeOrmJobPresetRepository,

		@InjectRepository(Employee)
		private readonly typeOrmEmployeeRepository: TypeOrmEmployeeRepository,

		@InjectRepository(EmployeeUpworkJobsSearchCriterion)
		private readonly typeOrmEmployeeUpworkJobsSearchCriterionRepository: TypeOrmEmployeeUpworkJobsSearchCriterionRepository,

		private readonly _gauzyAIService: GauzyAIService
	) {}

	/**
	 * Saves employee presets and syncs job search criteria.
	 *
	 * @param command The SaveEmployeePresetCommand object containing input data.
	 * @returns A Promise resolving to an array of JobPreset objects.
	 */
	public async execute(command: SaveEmployeePresetCommand): Promise<JobPreset[]> {
		const { input } = command;
		const { employeeId } = input;

		// Find the employee with related data
		let employee = await this.typeOrmEmployeeRepository.findOne({
			where: { id: employeeId },
			relations: ['user', 'organization', 'customFields.jobPresets']
		});

		// Find the job preset with related criteria
		const jobPreset = await this.typeOrmJobPresetRepository.findOne({
			where: { id: In(input.jobPresetIds) },
			relations: { jobPresetCriterions: true }
		});

		// Map job preset criteria to employee criterions
		const employeeCriterions = jobPreset.jobPresetCriterions.map(
			(item) => new EmployeeUpworkJobsSearchCriterion({ ...item, employeeId })
		);

		// Update employee custom fields with job presets
		employee.customFields['jobPresets'] = input.jobPresetIds.map((id) => new JobPreset({ id }));
		await this.typeOrmEmployeeRepository.save(employee);

		// Delete existing employee job search criteria
		await this.typeOrmEmployeeUpworkJobsSearchCriterionRepository.delete({ employeeId });

		// Save new employee job search criteria
		await this.typeOrmEmployeeUpworkJobsSearchCriterionRepository.save(employeeCriterions);

		// Sync Gauzy employee job search criteria
		this._gauzyAIService.syncGauzyEmployeeJobSearchCriteria(employee, employeeCriterions);

		// Find the employee with related data
		employee = await this.typeOrmEmployeeRepository.findOne({
			where: { id: employeeId },
			relations: ['customFields.jobPresets']
		});

		return employee.customFields['jobPresets'];
	}
}
