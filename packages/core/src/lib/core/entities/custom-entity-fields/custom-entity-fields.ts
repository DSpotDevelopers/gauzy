import { CustomEmbeddedFields } from '@gauzy/common';
import { TypeOrmEmployeeEntityCustomFields } from './employee';
import { TypeOrmTagEntityCustomFields } from './tag';
import { TypeOrmOrganizationProjectEntityCustomFields } from './organization-project';

/**
 * Defines the structure for entity field registration configuration.
 */
export type EntityFieldRegistrationConfig = {
	entityName: keyof CustomEmbeddedFields; // Entity name from CustomEmbeddedFields
	customFields: any; // Custom fields associated with the entity
};

/**
 * Registrations for TypeORM custom entity fields.
 *
 * This array contains configurations for custom fields in TypeORM entities.
 * Each entry specifies the name of the entity and the associated custom fields.
 */
export const typeOrmCustomEntityFieldRegistrations: EntityFieldRegistrationConfig[] = [
	{ entityName: 'Employee', customFields: TypeOrmEmployeeEntityCustomFields },
	{ entityName: 'Tag', customFields: TypeOrmTagEntityCustomFields },
	{ entityName: 'OrganizationProject', customFields: TypeOrmOrganizationProjectEntityCustomFields }
];
