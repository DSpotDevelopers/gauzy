import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import * as moment from 'moment';
import { TimeLogUpdateHandler } from './time-log-update.handler';
import { TimeLogUpdateCommand } from '../time-log-update.command';
import { TypeOrmTimeLogRepository } from '../../repository/type-orm-time-log.repository';
import { TypeOrmTimeSlotRepository } from '../../../time-slot/repository/type-orm-time-slot.repository';
import { TimeSlotService } from '../../../time-slot/time-slot.service';
import { TimeLog } from '../../time-log.entity';
import { RequestContext } from '../../../../core/context';
import { TimesheetFirstOrCreateCommand, TimesheetRecalculateCommand } from '../../../timesheet/commands';
import { UpdateEmployeeTotalWorkedHoursCommand } from '../../../../employee/commands';
import { ID, TimeLogSourceEnum } from '@gauzy/contracts';

describe('TimeLogUpdateHandler', () => {
	let handler: TimeLogUpdateHandler;
	let typeOrmTimeLogRepository: jest.Mocked<TypeOrmTimeLogRepository>;
	let typeOrmTimeSlotRepository: jest.Mocked<TypeOrmTimeSlotRepository>;
	let commandBus: jest.Mocked<CommandBus>;
	let timeSlotService: jest.Mocked<TimeSlotService>;

	const mockTimeLog = {
		id: 'time-log-id',
		startedAt: new Date('2023-01-01T10:00:00Z'),
		stoppedAt: new Date('2023-01-01T12:00:00Z'),
		employeeId: 'employee-id',
		organizationId: 'organization-id',
		timesheetId: 'timesheet-id',
		source: TimeLogSourceEnum.WEB_TIMER
	} as TimeLog;

	const mockTimesheet = {
		id: 'timesheet-id',
		employeeId: 'employee-id',
		organizationId: 'organization-id'
	};

	const mockTimeSlots = [
		{
			id: 'time-slot-1',
			startedAt: new Date('2023-01-01T10:00:00Z'),
			employeeId: 'employee-id',
			organizationId: 'organization-id'
		},
		{
			id: 'time-slot-2',
			startedAt: new Date('2023-01-01T11:00:00Z'),
			employeeId: 'employee-id',
			organizationId: 'organization-id'
		}
	];

	beforeEach(async () => {
		// Create mock implementations
		const mockTypeOrmTimeLogRepository = {
			findOneBy: jest.fn(),
			update: jest.fn(),
			save: jest.fn()
		};

		const mockTypeOrmTimeSlotRepository = {
			createQueryBuilder: jest.fn().mockReturnThis(),
			leftJoinAndSelect: jest.fn().mockReturnThis(),
			where: jest.fn().mockReturnThis(),
			andWhere: jest.fn().mockReturnThis(),
			getMany: jest.fn(),
			remove: jest.fn(),
			softRemove: jest.fn()
		};

		const mockCommandBus = {
			execute: jest.fn()
		};

		const mockTimeSlotService = {
			generateTimeSlots: jest.fn(),
			bulkCreate: jest.fn()
		};

		const module: TestingModule = await Test.createTestingModule({
			providers: [
				TimeLogUpdateHandler,
				{
					provide: TypeOrmTimeLogRepository,
					useValue: mockTypeOrmTimeLogRepository
				},
				{
					provide: TypeOrmTimeSlotRepository,
					useValue: mockTypeOrmTimeSlotRepository
				},
				{
					provide: CommandBus,
					useValue: mockCommandBus
				},
				{
					provide: TimeSlotService,
					useValue: mockTimeSlotService
				}
			]
		}).compile();

		handler = module.get<TimeLogUpdateHandler>(TimeLogUpdateHandler);
		typeOrmTimeLogRepository = module.get(TypeOrmTimeLogRepository) as jest.Mocked<TypeOrmTimeLogRepository>;
		typeOrmTimeSlotRepository = module.get(TypeOrmTimeSlotRepository) as jest.Mocked<TypeOrmTimeSlotRepository>;
		commandBus = module.get(CommandBus) as jest.Mocked<CommandBus>;
		timeSlotService = module.get(TimeSlotService) as jest.Mocked<TimeSlotService>;

		// Mock RequestContext
		jest.spyOn(RequestContext, 'currentTenantId').mockReturnValue('tenant-id');
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('should be defined', () => {
		expect(handler).toBeDefined();
	});

	describe('execute', () => {
		it('should update a time log without updating time slots', async () => {
			// Arrange
			const input = { description: 'Updated description' };
			const command = new TimeLogUpdateCommand(input, mockTimeLog.id);

			typeOrmTimeLogRepository.findOneBy.mockResolvedValue(mockTimeLog);
			typeOrmTimeLogRepository.findOneBy.mockResolvedValueOnce(mockTimeLog);

			// Act
			const result = await handler.execute(command);

			// Assert
			expect(typeOrmTimeLogRepository.update).toHaveBeenCalledWith(mockTimeLog.id, input);
			expect(timeSlotService.generateTimeSlots).toHaveBeenCalledWith(
				mockTimeLog.startedAt,
				mockTimeLog.stoppedAt
			);
			expect(commandBus.execute).not.toHaveBeenCalled();
			expect(result).toEqual(mockTimeLog);
		});

		it('should update a time log and update time slots when startedAt is changed', async () => {
			// Arrange
			const newStartedAt = new Date('2023-01-01T09:00:00Z');
			const input = { startedAt: newStartedAt };
			const command = new TimeLogUpdateCommand(input, mockTimeLog.id);

			typeOrmTimeLogRepository.findOneBy.mockResolvedValue(mockTimeLog);
			typeOrmTimeLogRepository.findOneBy.mockResolvedValueOnce(mockTimeLog);

			commandBus.execute.mockResolvedValueOnce(mockTimesheet);

			const updatedTimeSlots = [
				{ startedAt: newStartedAt, employeeId: 'employee-id', organizationId: 'organization-id' },
				{
					startedAt: new Date('2023-01-01T10:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				}
			];

			timeSlotService.generateTimeSlots.mockReturnValueOnce(mockTimeSlots);
			timeSlotService.generateTimeSlots.mockReturnValueOnce(updatedTimeSlots);

			typeOrmTimeSlotRepository.getMany.mockResolvedValue([]);

			// Act
			const result = await handler.execute(command);

			// Assert
			expect(commandBus.execute).toHaveBeenCalledWith(expect.any(TimesheetFirstOrCreateCommand));
			expect(timeSlotService.generateTimeSlots).toHaveBeenCalledTimes(2);
			expect(typeOrmTimeLogRepository.update).toHaveBeenCalledWith(mockTimeLog.id, {
				...input,
				timesheetId: mockTimesheet.id
			});
			expect(commandBus.execute).toHaveBeenCalledWith(expect.any(TimesheetRecalculateCommand));
			expect(commandBus.execute).toHaveBeenCalledWith(expect.any(UpdateEmployeeTotalWorkedHoursCommand));
			expect(result).toEqual(mockTimeLog);
		});

		it('should handle conflicting time slots when updating time log', async () => {
			// Arrange
			const newStoppedAt = new Date('2023-01-01T13:00:00Z');
			const input = { stoppedAt: newStoppedAt };
			const command = new TimeLogUpdateCommand(input, mockTimeLog.id);

			typeOrmTimeLogRepository.findOneBy.mockResolvedValue(mockTimeLog);
			typeOrmTimeLogRepository.findOneBy.mockResolvedValueOnce(mockTimeLog);

			commandBus.execute.mockResolvedValueOnce(mockTimesheet);

			const existingTimeSlots = [
				{
					startedAt: new Date('2023-01-01T10:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				},
				{
					startedAt: new Date('2023-01-01T11:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				}
			];

			const updatedTimeSlots = [
				{
					startedAt: new Date('2023-01-01T10:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				},
				{
					startedAt: new Date('2023-01-01T11:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				},
				{
					startedAt: new Date('2023-01-01T12:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				}
			];

			timeSlotService.generateTimeSlots.mockReturnValueOnce(existingTimeSlots);
			timeSlotService.generateTimeSlots.mockReturnValueOnce(updatedTimeSlots);

			typeOrmTimeSlotRepository.getMany.mockResolvedValue([]);

			// Act
			const result = await handler.execute(command);

			// Assert
			expect(commandBus.execute).toHaveBeenCalledWith(expect.any(TimesheetFirstOrCreateCommand));
			expect(timeSlotService.generateTimeSlots).toHaveBeenCalledTimes(2);
			expect(timeSlotService.bulkCreate).toHaveBeenCalled();
			expect(commandBus.execute).toHaveBeenCalledWith(expect.any(TimesheetRecalculateCommand));
			expect(result).toEqual(mockTimeLog);
		});

		it('should handle force delete of conflicting time slots', async () => {
			// Arrange
			const newStartedAt = new Date('2023-01-01T09:30:00Z');
			const input = { startedAt: newStartedAt };
			const command = new TimeLogUpdateCommand(input, mockTimeLog.id, false, true);

			typeOrmTimeLogRepository.findOneBy.mockResolvedValue(mockTimeLog);
			typeOrmTimeLogRepository.findOneBy.mockResolvedValueOnce(mockTimeLog);

			commandBus.execute.mockResolvedValueOnce(mockTimesheet);

			const existingTimeSlots = [
				{
					startedAt: new Date('2023-01-01T10:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				},
				{
					startedAt: new Date('2023-01-01T11:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				}
			];

			const updatedTimeSlots = [
				{ startedAt: newStartedAt, employeeId: 'employee-id', organizationId: 'organization-id' },
				{
					startedAt: new Date('2023-01-01T10:30:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				}
			];

			timeSlotService.generateTimeSlots.mockReturnValueOnce(existingTimeSlots);
			timeSlotService.generateTimeSlots.mockReturnValueOnce(updatedTimeSlots);

			typeOrmTimeSlotRepository.getMany.mockResolvedValue(existingTimeSlots);

			// Act
			const result = await handler.execute(command);

			// Assert
			expect(typeOrmTimeSlotRepository.remove).toHaveBeenCalled();
			expect(typeOrmTimeSlotRepository.softRemove).not.toHaveBeenCalled();
			expect(result).toEqual(mockTimeLog);
		});

		it('should handle manual time slots', async () => {
			// Arrange
			const newStartedAt = new Date('2023-01-01T09:00:00Z');
			const input = { startedAt: newStartedAt };
			const command = new TimeLogUpdateCommand(input, mockTimeLog.id, true);

			typeOrmTimeLogRepository.findOneBy.mockResolvedValue(mockTimeLog);
			typeOrmTimeLogRepository.findOneBy.mockResolvedValueOnce(mockTimeLog);

			commandBus.execute.mockResolvedValueOnce(mockTimesheet);

			const existingTimeSlots = [
				{
					startedAt: new Date('2023-01-01T10:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				},
				{
					startedAt: new Date('2023-01-01T11:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				}
			];

			const updatedTimeSlots = [
				{ startedAt: newStartedAt, employeeId: 'employee-id', organizationId: 'organization-id' },
				{
					startedAt: new Date('2023-01-01T10:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				}
			];

			timeSlotService.generateTimeSlots.mockReturnValueOnce(existingTimeSlots);
			timeSlotService.generateTimeSlots.mockReturnValueOnce(updatedTimeSlots);

			typeOrmTimeSlotRepository.getMany.mockResolvedValue([]);

			// Act
			const result = await handler.execute(command);

			// Assert
			expect(timeSlotService.bulkCreate).not.toHaveBeenCalled();
			expect(result).toEqual(mockTimeLog);
		});

		it('should handle non-web timer sources', async () => {
			// Arrange
			const customTimeLog = {
				...mockTimeLog,
				source: TimeLogSourceEnum.MOBILE
			};

			const newStartedAt = new Date('2023-01-01T09:00:00Z');
			const input = { startedAt: newStartedAt };
			const command = new TimeLogUpdateCommand(input, customTimeLog.id);

			typeOrmTimeLogRepository.findOneBy.mockResolvedValue(customTimeLog);
			typeOrmTimeLogRepository.findOneBy.mockResolvedValueOnce(customTimeLog);

			commandBus.execute.mockResolvedValueOnce(mockTimesheet);

			const existingTimeSlots = [
				{
					startedAt: new Date('2023-01-01T10:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				},
				{
					startedAt: new Date('2023-01-01T11:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				}
			];

			const updatedTimeSlots = [
				{ startedAt: newStartedAt, employeeId: 'employee-id', organizationId: 'organization-id' },
				{
					startedAt: new Date('2023-01-01T10:00:00Z'),
					employeeId: 'employee-id',
					organizationId: 'organization-id'
				}
			];

			timeSlotService.generateTimeSlots.mockReturnValueOnce(existingTimeSlots);
			timeSlotService.generateTimeSlots.mockReturnValueOnce(updatedTimeSlots);

			typeOrmTimeSlotRepository.getMany.mockResolvedValue([]);

			// Act
			const result = await handler.execute(command);

			// Assert
			expect(timeSlotService.bulkCreate).not.toHaveBeenCalled();
			expect(result).toEqual(customTimeLog);
		});
	});

	describe('private methods', () => {
		it('should get time log by ID', async () => {
			// Arrange
			typeOrmTimeLogRepository.findOneBy.mockResolvedValue(mockTimeLog);

			// Act
			const result = await (handler as any).getTimeLogByIdOrInstance('time-log-id');

			// Assert
			expect(typeOrmTimeLogRepository.findOneBy).toHaveBeenCalledWith({ id: 'time-log-id' });
			expect(result).toEqual(mockTimeLog);
		});

		it('should return time log instance directly if provided', async () => {
			// Act
			const result = await (handler as any).getTimeLogByIdOrInstance(mockTimeLog);

			// Assert
			expect(typeOrmTimeLogRepository.findOneBy).not.toHaveBeenCalled();
			expect(result).toEqual(mockTimeLog);
		});

		it('should identify conflicting start times correctly', () => {
			// Arrange
			const existingSlots = [
				{ startedAt: new Date('2023-01-01T10:00:00Z') },
				{ startedAt: new Date('2023-01-01T11:00:00Z') }
			];

			const newSlots = [
				{ startedAt: new Date('2023-01-01T10:00:00Z') },
				{ startedAt: new Date('2023-01-01T12:00:00Z') }
			];

			// Act
			const result = (handler as any).getConflictingStartTimes(existingSlots, newSlots);

			// Assert
			expect(result.length).toBe(1);
			expect(result[0]).toEqual(new Date('2023-01-01T11:00:00Z'));
		});
	});
});
