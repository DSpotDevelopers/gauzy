import { Column } from 'typeorm';
import { ColumnEmbeddedOptions as TypeOrmEmbeddedOptions } from 'typeorm/decorator/options/ColumnEmbeddedOptions';
import { Type } from '@gauzy/common';
import { filterOptions } from './entity.helper';

/**
 * ColumnEmbeddedOptions combines options from TypeORM embedded column.
 * It merges all properties from TypeOrmEmbeddedOptions.
 */
export type ColumnEmbeddedOptions = TypeOrmEmbeddedOptions;

/**
 * Options for embedding columns in entities.
 */
export type EntityColumnEmbeddedOptions = {
    /**
     * Function returning the Type of the TypeORM embeddable entity.
     * Used to reference the embedded class in TypeORM.
     */
    typeOrmEmbeddableEntity?: () => Type;
};

/**
 * Decorator for creating entities with TypeORM decorators.
 * @param options Options for the entity.
 */
export function EmbeddedColumn(
    typeOrTarget?: EntityColumnEmbeddedOptions,
    options?: ColumnEmbeddedOptions
): PropertyDecorator;

/**
 * A decorator factory for mapping an embeddable column.
 * @param typeFunctionOrTarget The type, function, or target entity for the  TypeORM Embedded column.
 * @param options Additional options for the TypeORM column.
 * @returns A property decorator.
 */
export function EmbeddedColumn<T>(
    typeOrTarget?: EntityColumnEmbeddedOptions,
    options?: ColumnEmbeddedOptions
): PropertyDecorator {
    // If options are not provided, initialize an empty object
    if (!options) options = { prefix: false } as ColumnEmbeddedOptions;

    // Return a property decorator function
    return (target: any, propertyKey: string) => {
        // Apply the @Column decorator with mapped Type ORM options
        const typeOrmOptions = parseTypeOrmEmbeddableColumnOptions(options);
        Column(typeOrTarget.typeOrmEmbeddableEntity, typeOrmOptions)(target, propertyKey);
    };
}

/**
 * Parses and processes TypeORM embeddable column options.
 *
 * @param restOptions The TypeORM embedded column options to be filtered and processed.
 * @returns A new object with only key-value pairs where the value is defined.
 */
export const parseTypeOrmEmbeddableColumnOptions = (
    restOptions: TypeOrmEmbeddedOptions
): Record<string, any> => {
    // Filter out undefined options from the given object
    const filteredOptions = filterOptions({
        ...restOptions
    });

    // Return the filtered object with only defined properties
    return filteredOptions;
};
