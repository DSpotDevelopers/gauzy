import { ObjectUtils } from '../../../../core/util/object-utils';
import { TypeOrmManyToOne } from './type-orm';
import {
	TypeORMInverseSide,
	TypeORMRelationOptions,
	TypeORMTarget,
	TypeOrmCascadeOption
} from './shared-types';

type TargetEntity<T> = TypeORMTarget<T>;
type InverseSide<T> = TypeORMInverseSide<T>;
export type RelationOptions<T, O> = TypeORMRelationOptions & {
	cascade?: TypeOrmCascadeOption;
};

/**
 * Decorator for defining Many-to-One relationships in TypeORM.
 *
 * @param typeFunctionOrTarget - Type or target function for the related entity.
 * @param inverseSideOrOptions - Inverse side of the relationship or additional options.
 * @param options - Additional options for the Many-to-One relationship.
 * @returns PropertyDecorator
 */
export function MultiORMManyToOne<T, O>(
	typeFunctionOrTarget: TargetEntity<T>,
	inverseSideOrOptions?: InverseSide<T> | RelationOptions<T, O>,
	options?: RelationOptions<T, O>
): PropertyDecorator {
	if (ObjectUtils.isObject(inverseSideOrOptions)) {
		options = <RelationOptions<T, O>>inverseSideOrOptions;
	}

	return (target: any, propertyKey: string) => {
		// If options are not provided, initialize an empty object
		if (!options) options = {} as RelationOptions<T, O>;

		// Use TypeORM decorator for Many-to-One
		TypeOrmManyToOne(
			typeFunctionOrTarget as TypeORMTarget<T>,
			inverseSideOrOptions as TypeORMInverseSide<T>,
			options as TypeORMRelationOptions
		)(target, propertyKey);
	};
}
