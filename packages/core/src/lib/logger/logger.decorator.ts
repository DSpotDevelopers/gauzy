import { Logger as NestLogger } from '@nestjs/common';

export const prefixesForLoggers: string[] = new Array<string>();

/**
 * Logger decorator function that creates a logger instance with a specified prefix.
 * This decorator can be applied to class properties to provide a standardized logging mechanism.
 *
 * @param prefix - The prefix to be added to log messages for better identification
 * @returns A property decorator that sets up a logger instance
 */
export function Logger(): PropertyDecorator {
	return (target: any, propertyKey: string | symbol) => {
		const loggerInstance = new NestLogger(`GZY - ${target.constructor?.name}`);

		// Define the property with the logger instance
		Object.defineProperty(target, propertyKey, {
			value: loggerInstance,
			writable: false,
			enumerable: true,
			configurable: false
		});
	};
}
