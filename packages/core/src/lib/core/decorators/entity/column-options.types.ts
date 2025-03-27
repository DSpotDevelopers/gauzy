import { ColumnType as TypeORMColumnType, ColumnOptions as TypeORMColumnOptions } from 'typeorm';

//
type CommonColumnOptions<T> = Omit<TypeORMColumnOptions, 'type'> & {
    type?: ColumnDataType;
    relationId?: boolean; // Need to prevent property decorator when relationId column
};

// Represents the type of data that can be used for a column in TypeORM.
export type ColumnDataType = TypeORMColumnType;

// Represents common column options that can be used in TypeORM.
export type ColumnOptions<T> = CommonColumnOptions<T>;
