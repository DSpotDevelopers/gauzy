import { Entity as TypeOrmEntity } from 'typeorm';
import { isObject } from "@gauzy/common";
import { TypeOrmEntityOptions } from "./entity-options.types";

/**
 * Decorator for creating entities with TypeORM decorators.
 * @param options Options for the entity.
 */
export function MultiORMEntity<T>(options?: TypeOrmEntityOptions): ClassDecorator;

/**
 * Decorator for creating entities with TypeORM decorators.
 * @param name Name of the entity table.
 * @param options Options for the entity.
 */
export function MultiORMEntity<T>(name?: string, options?: TypeOrmEntityOptions): ClassDecorator;

/**
 * Decorator for creating entities with TypeORM decorators.
 * @param nameOrOptions Name of the entity table or options for the entity.
 * @param maybeOptions Options for the entity (if nameOrOptions is a string).
 * @returns Class decorator.
 */
export function MultiORMEntity<T>(
    nameOrOptions?: string | TypeOrmEntityOptions,
    maybeOptions?: TypeOrmEntityOptions
): ClassDecorator {
    // Extract TypeORM options based on the type of nameOrOptions
    const typeOrmOptions: any = isObject(nameOrOptions) ? (nameOrOptions as TypeOrmEntityOptions) : nameOrOptions || {};

    /**
     * Class decorator for creating entities with TypeORM decorators.
     * @param target The target class.
     */
    return (target: any) => {
        // Apply TypeORM entity decorator to the target class
        TypeOrmEntity(typeOrmOptions, maybeOptions)(target);
    };
}
