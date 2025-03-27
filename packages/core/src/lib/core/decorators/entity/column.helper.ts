import { DataSourceOptions } from 'typeorm';
import { ColumnDataType } from './column-options.types';

/**
 * Resolve the database column type.
 * @param columnType - The input column type.
 * @returns The resolved column type.
 */
export function resolveDbType(columnType: ColumnDataType): ColumnDataType {
	return columnType;
}

/**
 * Maps a generic type to a database-specific column type based on the provided database engine.
 *
 * @param dbEngine - The type of the database engine.
 * @param type - The generic type to be mapped.
 * @returns The database-specific column type.
 */
export function getColumnType(dbEngine: DataSourceOptions['type'], type: string): ColumnDataType {
	switch (type) {
		case 'string':
			return 'varchar';
	}
	return 'varchar';
}
