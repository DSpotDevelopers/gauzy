import { Injectable } from '@nestjs/common';
import { ValidationArguments, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { IRole } from '@gauzy/contracts';
import { RequestContext } from '../../../core/context';
import { TypeOrmRoleRepository } from '../../../role/repository';

/**
 * Role should existed validation constraint
 *
 * @param validationOptions
 * @returns
 */
@ValidatorConstraint({ name: 'IsRoleShouldExist', async: true })
@Injectable()
export class RoleShouldExistConstraint implements ValidatorConstraintInterface {
	constructor(readonly typeOrmRoleRepository: TypeOrmRoleRepository) {}

	/**
	 * Validates if the given role exists for the current tenant.
	 *
	 * @param role - The role to validate, either as a string ID or an IRole object.
	 * @returns True if the role exists, false otherwise.
	 */
	async validate(role: string | IRole): Promise<boolean> {
		if (!role) return false;

		const roleId: string = typeof role === 'string' ? role : role.id;
		if (!roleId) return false;

		const tenantId = RequestContext.currentTenantId();
		try {
			return !!(await this.typeOrmRoleRepository.findOneByOrFail({ id: roleId, tenantId }));
		} catch (error) {
			return false; // Role does not exist
		}
	}

	/**
	 * Gets default message when validation for this constraint fail.
	 */
	defaultMessage(validationArguments?: ValidationArguments): string {
		const { value } = validationArguments;
		return `Please provide a valid value for the role. The value '${JSON.stringify(
			value
		)}' is not recognized as a valid role identifier.`;
	}
}
