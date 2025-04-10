import { Controller, UseGuards, Get, Query, HttpStatus, Post, Body, Param, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CommandBus } from '@nestjs/cqrs';
import { IInvoiceItem, IPagination, PermissionsEnum } from '@gauzy/contracts';
import { CrudController } from './../core/crud';
import { InvoiceItem } from './invoice-item.entity';
import { InvoiceItemService } from './invoice-item.service';
import { InvoiceItemBulkCreateCommand } from './commands';
import { BulkBodyLoadTransformPipe, ParseJsonPipe, UUIDValidationPipe } from './../shared/pipes';
import { PermissionGuard, TenantPermissionGuard } from './../shared/guards';
import { Permissions } from './../shared/decorators';
import { InvoiceItemBulkInputDTO } from './dto';
import { InvoiceService } from '../invoice/invoice.service';
@ApiTags('InvoiceItem')
@UseGuards(TenantPermissionGuard, PermissionGuard)
@Controller()
export class InvoiceItemController extends CrudController<InvoiceItem> {
	constructor(
		private readonly invoiceItemService: InvoiceItemService,
		private readonly invoiceService: InvoiceService,
		private readonly commandBus: CommandBus
	) {
		super(invoiceItemService);
	}

	@Permissions(
		PermissionsEnum.INVOICES_VIEW,
		PermissionsEnum.ORG_INVOICES_VIEW,
		PermissionsEnum.INVOICES_HANDLE,
		PermissionsEnum.ALL_ORG_VIEW
	)
	@Get()
	async findAll(@Query('data', ParseJsonPipe) data: any): Promise<IPagination<IInvoiceItem>> {
		const { relations = [], findInput = null, invoiceId = null } = data;
		await this.invoiceService.checkIfUserCanAccessInvoiceForReadById(invoiceId);
		return this.invoiceItemService.findAll({
			where: findInput,
			relations
		});
	}

	@ApiOperation({ summary: 'Create invoice item in Bulk' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Invoice item have been successfully created.'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input, The response body may contain clues as to what went wrong'
	})
	@Permissions(
		PermissionsEnum.INVOICES_EDIT,
		PermissionsEnum.ORG_INVOICES_EDIT,
		PermissionsEnum.INVOICES_HANDLE,
		PermissionsEnum.ALL_ORG_EDIT
	)
	@Post('/bulk/:invoiceId')
	async createBulk(
		@Param('invoiceId', UUIDValidationPipe) invoiceId: string,
		@Body(BulkBodyLoadTransformPipe, new ValidationPipe({ transform: true })) input: InvoiceItemBulkInputDTO
	): Promise<any> {
		const { invoice } = await this.invoiceService.checkIfUserCanAccessInvoiceForWrite(invoiceId, true);
		this.invoiceItemService.checkForEmployee(invoice, input.list);
		return this.commandBus.execute(new InvoiceItemBulkCreateCommand(invoiceId, input.list));
	}
}
