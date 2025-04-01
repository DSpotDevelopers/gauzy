import { JoinColumn, RelationId } from 'typeorm';
import { IProductTypeTranslation as IProductCategoryTranslation } from '@gauzy/contracts';
import { ApiProperty } from '@nestjs/swagger';
import { ProductCategory, TranslationBase } from '../core/entities/internal';
import { ColumnIndex, MultiORMColumn, MultiORMEntity, MultiORMManyToOne } from './../core/decorators/entity';

@MultiORMEntity('product_category_translation')
export class ProductCategoryTranslation extends TranslationBase implements IProductCategoryTranslation {
	@ApiProperty({ type: () => String })
	@MultiORMColumn()
	name: string;

	@ApiProperty({ type: () => String })
	@MultiORMColumn({ nullable: true })
	description: string;

	@ApiProperty({ type: () => String })
	@MultiORMColumn({ nullable: false })
	languageCode: string;

	/*
	|--------------------------------------------------------------------------
	| @ManyToOne
	|--------------------------------------------------------------------------
	*/

	/**
	 * ProductCategory
	 */
	@ApiProperty({ type: () => ProductCategory })
	@MultiORMManyToOne(() => ProductCategory, (productCategory) => productCategory.translations, {
		onDelete: 'CASCADE',
		onUpdate: 'CASCADE'
	})
	@JoinColumn()
	reference: ProductCategory;

	@ApiProperty({ type: () => String })
	@RelationId((it: ProductCategoryTranslation) => it.reference)
	@ColumnIndex()
	@MultiORMColumn({ relationId: true })
	referenceId: string;
}
