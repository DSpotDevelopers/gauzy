import { BadRequestException, Injectable, Logger as NestLogger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as PdfPrinter from 'pdfmake';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@gauzy/config';
import { Logger } from '../logger';

@Injectable()
export class PdfmakerService {
	@Logger()
	private readonly logger: NestLogger;

	private readonly public_path: string;
	private readonly _dirname: string;
	private readonly _basename = '/invoices/pdf/';
	private readonly fonts: any = {
		Helvetica: {
			normal: 'Helvetica',
			bold: 'Helvetica-Bold',
			italics: 'Helvetica-Oblique',
			bolditalics: 'Helvetica-BoldOblique'
		}
	};

	private _fileName = `document-${uuidv4()}`;
	setFilename(filename: string) {
		this._fileName = filename;
		return this;
	}
	get filename(): string {
		return this._fileName;
	}

	constructor(private readonly configService: ConfigService) {
		this.public_path = this.configService.assetOptions.assetPublicPath || __dirname;
		this._dirname = path.join(this.public_path, this._basename);
	}

	/*
	 * Generate Invoice/Estimate Pdf
	 */
	async generatePdf(docDefinition): Promise<Buffer> {
		try {
			const printer = new PdfPrinter(this.fonts);
			const pdfDefinition = {
				watermark: docDefinition['watermark'],
				content: docDefinition['content'],
				defaultStyle: {
					font: 'Helvetica'
				}
			};

			if (!fs.existsSync(this._dirname)) {
				fs.mkdirSync(this._dirname, { recursive: true });
			}

			const filename = `${this.filename}.pdf`;
			const filePath = path.join(this._dirname, filename);

			return await new Promise<Buffer>((resolve, reject) => {
				const pdfDoc = printer.createPdfKitDocument(pdfDefinition, {});
				pdfDoc.pipe(fs.createWriteStream(filePath));

				const chunks = [];
				pdfDoc.on('readable', () => {
					let chunk: string;
					while ((chunk = pdfDoc.read()) !== null) {
						chunks.push(chunk);
					}
				});

				pdfDoc.on('end', async () => {
					Buffer.concat(chunks);
					if (!Buffer?.length) return reject(new Error('PDF generation failed'));
					//convert pdf to Buffer
					const pdf = await new Promise<Buffer>((resolve, reject) => {
						try {
							fs.readFile(filePath, {}, (err, data) => {
								if (err) {
									reject(err);
								} else {
									//unlink after read pdf into Buffer form
									if (fs.existsSync(filePath)) {
										fs.unlinkSync(filePath);
									}
									resolve(data);
								}
							});
						} catch (err) {
							this.logger.error(`Error reading generated PDF: ${err}`);
							reject(err);
						}
					});
					resolve(pdf);
				});
				pdfDoc.end();
			});
		} catch (error) {
			this.logger.error(`Error while generating PDF: ${error}`);
			throw new BadRequestException(error);
		}
	}
}
