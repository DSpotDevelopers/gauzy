import { ObjectType, RelationOptions as TypeOrmRelationOptions } from 'typeorm';

// Define valid TypeORM cascade options
export type TypeOrmCascadeOption = boolean | ('insert' | 'update' | 'remove' | 'soft-remove' | 'recover');

// Type definition for the TypeORM target.
export type TypeORMTarget<T> = string | ((type?: any) => ObjectType<T>);

// Type definition for the TypeORM inverse side.
export type TypeORMInverseSide<T> = string | ((object: T) => any);

// Type definition for the TypeORM relation options, excluding cascade.
export type TypeORMRelationOptions = Omit<TypeOrmRelationOptions, 'cascade'>;
