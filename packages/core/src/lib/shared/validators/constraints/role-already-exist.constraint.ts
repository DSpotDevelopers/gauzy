import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { isEmpty } from '@gauzy/common';
import { RequestContext } from '../../../core/context';
import { TypeOrmRoleRepository } from '../../../role/repository';

/**
 * Role already existed validation constraint
 *
 * @param validationOptions
 * @returns
 */
@ValidatorConstraint({ name: 'IsRoleAlreadyExist', async: true })
@Injectable()
export class RoleAlreadyExistConstraint implements ValidatorConstraintInterface {
	constructor(readonly typeOrmRoleRepository: TypeOrmRoleRepository) {}

	/**
	 * Validates if a role with the given name does not exist for the current tenant.
	 *
	 * @param name - The name of the role to validate.
	 * @returns True if the role does not exist (passes validation), false otherwise.
	 */
	async validate(name: string): Promise<boolean> {
		if (isEmpty(name)) return true;

		const tenantId: string = RequestContext.currentTenantId();
		try {
			return !(await this.typeOrmRoleRepository.findOneByOrFail({ name, tenantId }));
		} catch (error) {
			// Check the specific error type (e.g., EntityNotFoundError) to ensure the error is due to the role not being found
			// Consider logging or handling other types of errors if necessary
			return true; // If the role is not found, validation passes
		}
	}

	/**
	 * Gets default message when validation for this constraint fail.
	 */
	defaultMessage(validationArguments?: ValidationArguments): string {
		const { value } = validationArguments;
		return `The role name '${value}' is already in use. Please choose a unique name for the new role.`;
	}
}
