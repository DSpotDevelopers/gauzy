import { Injectable } from '@nestjs/common';
import { Not } from 'typeorm';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { isEmpty } from '@gauzy/common';
import { RequestContext } from '../../../core/context';
import { TypeOrmOrganizationTeamRepository } from '../../../organization-team/repository';

@ValidatorConstraint({ name: 'IsTeamAlreadyExist', async: true })
@Injectable()
export class TeamAlreadyExistConstraint implements ValidatorConstraintInterface {
	constructor(readonly typeOrmOrganizationTeamRepository: TypeOrmOrganizationTeamRepository) {}

	/**
	 * Validates if a given name is not already in use in the specified organization.
	 *
	 * @param name - The name to validate.
	 * @param args - Validation arguments, expected to contain organization ID and tenant ID.
	 * @returns True if the name is not in use or if there's no organization ID, false otherwise.
	 */
	async validate(name: any, args: ValidationArguments): Promise<boolean> {
		if (isEmpty(name)) {
			return true; // Empty value is considered valid
		}

		const payload = args.object as { organizationId?: string; organization?: { id: string }; id?: string };
		const organizationId = payload.organizationId || payload.organization?.id;

		if (!organizationId) {
			return true; // Validation is irrelevant without an organization ID
		}

		const tenantId = RequestContext.currentTenantId();
		const queryConditions: Record<string, any> = { name, organizationId, tenantId };

		if (payload.id) {
			queryConditions.id = Not(payload.id); // Exclude current entity from check
		}

		try {
			return !(await this.typeOrmOrganizationTeamRepository.findOneByOrFail(queryConditions));
		} catch (error) {
			return true; // No existing team found, hence valid
		}
	}

	/**
	 * Gets default message when validation for this constraint fail.
	 */
	defaultMessage(validationArguments?: ValidationArguments): string {
		const { value } = validationArguments;
		return `The team name '${value}' is already in use. Please choose a different name.`;
	}
}
