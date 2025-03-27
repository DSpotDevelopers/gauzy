import { EntityOptions as TypeEntityOptions } from 'typeorm';
import { Type } from '@gauzy/common';

/**
 * Options for TypeORM entities.
 */
export type TypeOrmEntityOptions = TypeEntityOptions & {
    /**
     * Optional function returning the repository constructor.
     */
    typeOrmRepository?: () => Type;
};
