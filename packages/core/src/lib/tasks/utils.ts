import { FileStorageProviderEnum } from '@gauzy/contracts';
import { FileStorage } from '../core/file-storage';
import { TaskPriority, TaskSize, TaskStatus } from '../core';

/**
 * Get full icon url for items with an icon
 * This function depends on tenant and organization, so it should be called
 * only with the proper context
 *
 * @param items
 */
export const setFullIconUrl = async (items: (TaskPriority | TaskSize | TaskStatus)[]) => {
	const store = new FileStorage().setProvider(FileStorageProviderEnum.LOCAL);
	const provider = store.getProviderInstance();

	// Fetch fullIconUrl for items with an icon
	for (const item of items) {
		if (item.icon) {
			item.fullIconUrl = await provider.url(item.icon);
		}
	}
};
