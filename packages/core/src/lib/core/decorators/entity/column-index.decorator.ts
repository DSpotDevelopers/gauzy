import { Index as TypeOrmIndex, IndexOptions as TypeOrmIndexOptions } from 'typeorm';
import { ObjectUtils } from '../../../core/util/object-utils';

// Extend your TypeOrmIndexOptions
type CombinedIndexOptions<T> = string | string[] | ((object: any) => any[] | { [key: string]: number }) | TypeOrmIndexOptions;

export function ColumnIndex<T>(options?: CombinedIndexOptions<T>): ClassDecorator & PropertyDecorator;
export function ColumnIndex<T>(name?: string, options?: CombinedIndexOptions<T>): ClassDecorator & PropertyDecorator;
export function ColumnIndex<T>(name: string, fields: string[], options?: CombinedIndexOptions<T>): ClassDecorator & PropertyDecorator;
export function ColumnIndex<T>(fields: string[], options?: CombinedIndexOptions<T>): ClassDecorator & PropertyDecorator;

/**
 * ColumnIndex decorator for TypeOrm.
 *
 * @param nameOrFieldsOrOptions
 * @param maybeFieldsOrOptions
 * @param maybeOptions
 * @returns
 */
export function ColumnIndex<T>(
    nameOrFieldsOrOptions?: CombinedIndexOptions<T>,
    maybeFieldsOrOptions?: CombinedIndexOptions<T> | { synchronize: false },
    maybeOptions?: CombinedIndexOptions<T>
) {
    // normalize parameters
    const name = typeof nameOrFieldsOrOptions === 'string' ? nameOrFieldsOrOptions : undefined;

    const fields = typeof nameOrFieldsOrOptions === 'string' ? <string[]>maybeFieldsOrOptions : (nameOrFieldsOrOptions as string[]);

    let options = ObjectUtils.isObject(nameOrFieldsOrOptions) && !Array.isArray(nameOrFieldsOrOptions) ? nameOrFieldsOrOptions : maybeOptions;

    if (!options) {
        options = ObjectUtils.isObject(maybeFieldsOrOptions) && !Array.isArray(maybeFieldsOrOptions) ? (maybeFieldsOrOptions as TypeOrmIndexOptions) : maybeOptions;
    }

    /**
     * Decorator for applying indexes in TypeORM.
     * It can be used to decorate fields in an entity class.
     *
     * @param target The prototype of the class (in case of class decorator) or the constructor of the class (in case of property decorator).
     * @param propertyKey The name of the property to which the decorator is applied. This is undefined for class decorators.
     */
    return (target: any, propertyKey?: string) => {
        // Apply TypeORM index. If 'name' and 'fields' are specified it creates a named index on the specified properties.
        // Otherwise, it uses 'options' to determine the indexing strategy.
        applyTypeOrmIndex(target, propertyKey, name, fields, options as TypeOrmIndexOptions);
    };
}

/**
 * Applies a TypeORM index to the specified target.
 *
 * @param target The class or class property to which the index will be applied.
 * @param propertyKey The name of the property, if applying to a specific property.
 * @param name Optional name of the index for named indexes.
 * @param properties Optional list of properties to be indexed.
 * @param options Optional TypeORM indexing options.
 */
export function applyTypeOrmIndex(
    target: any,
    propertyKey: string | undefined,
    name: string | undefined,
    fields: string[] | undefined,
    options: TypeOrmIndexOptions = {}
) {
    if (name && fields) {
        // Applies a named index on specified properties with additional options
        TypeOrmIndex(name, fields, options)(target, propertyKey);
    } else if (name) {
        // Applies a named index with additional options (without specifying properties)
        TypeOrmIndex(name, options)(target, propertyKey);
    } else if (fields) {
        // Applies an index on specified properties without a name or additional options
        TypeOrmIndex(fields)(target, propertyKey);
    } else if (options) {
        // Applies an index with only options, without specifying a name or properties
        TypeOrmIndex(options)(target, propertyKey);
    } else {
        // Applies a default index when no name, properties, or options are specified
        TypeOrmIndex()(target, propertyKey);
    }
}
