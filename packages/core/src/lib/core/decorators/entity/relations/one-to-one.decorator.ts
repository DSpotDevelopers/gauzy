import { ObjectUtils } from "../../../../core/util/object-utils";
import { TypeORMInverseSide, TypeORMRelationOptions, TypeORMTarget, TypeOrmCascadeOption } from "./shared-types";
import { TypeOrmOneToOne } from "./type-orm";

type TargetEntity<T> = TypeORMTarget<T>;
type InverseSide<T> = TypeORMInverseSide<T>;
type RelationOptions<T, O> = TypeORMRelationOptions & {
    cascade?: TypeOrmCascadeOption;
};

/**
 * Decorator for defining One-to-One relationships in TypeORM.
 *
 * @param typeFunctionOrTarget - Type or target function for the related entity.
 * @param inverseSideOrOptions - Inverse side of the relationship or additional options.
 * @param options - Additional options for the One-to-One relationship.
 * @returns PropertyDecorator
 */
export function MultiORMOneToOne<T, O>(
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

        // Use TypeORM decorator for One-to-One
        TypeOrmOneToOne(typeFunctionOrTarget as TypeORMTarget<T>, inverseSideOrOptions as TypeORMInverseSide<T>, options as TypeORMRelationOptions)(target, propertyKey);
    };
}
