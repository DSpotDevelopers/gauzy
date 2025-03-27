import { JoinTable } from 'typeorm';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ICandidate, IEmployee, IOrganizationEmploymentType, ITag } from '@gauzy/contracts';
import { Candidate, Employee, Tag, TenantOrganizationBaseEntity } from '../core/entities/internal';
import { MultiORMColumn, MultiORMEntity, MultiORMManyToMany } from './../core/decorators/entity';

@MultiORMEntity('organization_employment_type')
export class OrganizationEmploymentType extends TenantOrganizationBaseEntity implements IOrganizationEmploymentType {
	@MultiORMColumn()
	name: string;

	/*
	|--------------------------------------------------------------------------
	| @ManyToMany
	|--------------------------------------------------------------------------
	*/

	@ApiPropertyOptional({ type: () => Tag, isArray: true })
	@MultiORMManyToMany(() => Tag, (tag) => tag.organizationEmploymentTypes, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	@JoinTable({
		name: 'tag_organization_employment_type'
	})
	tags?: ITag[];

	/**
	 * Employee
	 */
	@ApiPropertyOptional({ type: () => Employee, isArray: true })
	@MultiORMManyToMany(() => Employee, (employee) => employee.organizationEmploymentTypes, {
		cascade: ['update'],
	})
	@JoinTable({
		name: 'organization_employment_type_employee'
	})
	members?: IEmployee[];

	/**
	 * Candidate
	 */
	@ApiPropertyOptional({ type: () => Candidate, isArray: true })
	@MultiORMManyToMany(() => Candidate, (candidate) => candidate.organizationEmploymentTypes, {
		onUpdate: 'CASCADE',
		onDelete: 'CASCADE',
	})
	@JoinTable({
		name: 'candidate_employment_type'
	})
	candidates?: ICandidate[];
}
