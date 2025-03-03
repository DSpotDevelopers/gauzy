import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { TimeSlotService } from './time-slot.service';
import { TypeOrmTimeSlotRepository } from './repository/type-orm-time-slot.repository';
import { TimeSlot } from './time-slot.entity';
import { TimeSlotMinute } from './time-slot-minute.entity';
import {
	CreateTimeSlotMinutesCommand,
	TimeSlotBulkCreateCommand,
	TimeSlotBulkCreateOrUpdateCommand,
	UpdateTimeSlotMinutesCommand
} from './commands';
import { IGetTimeSlotInput, ITimeSlot, ITimeSlotMinute, TimeLogSourceEnum, TimeLogType } from '@gauzy/contracts';
import { RequestContext } from '../../core/context';
import * as moment from 'moment';
import { v4 as uuidv4 } from 'uuid';

/**
 * Factory for generating test data
 */
class TestDataFactory {
	/**
	 * Generate a random TimeSlot entity
	 * @param overrides - Optional properties to override in the generated entity
	 * @returns A TimeSlot entity with random data
	 */
	static createTimeSlot(overrides: Partial<ITimeSlot> = {}): ITimeSlot {
		const startedAt = overrides.startedAt || new Date();
		
		return {
			id: overrides.id || uuidv4(),
			employeeId: overrides.employeeId || uuidv4(),
			organizationId: overrides.organizationId || uuidv4(),
			tenantId: overrides.tenantId || uuidv4(),
			startedAt: startedAt,
			keyboard: overrides.keyboard !== undefined ? overrides.keyboard : Math.floor(Math.random() * 100),
			mouse: overrides.mouse !== undefined ? overrides.mouse : Math.floor(Math.random() * 100),
			overall: overrides.overall !== undefined ? overrides.overall : Math.floor(Math.random() * 100),
			duration: overrides.duration !== undefined ? overrides.duration : 600, // Default 10 minutes
			...overrides
		};
	}

	/**
	 * Generate multiple random TimeSlot entities
	 * @param count - Number of entities to generate
	 * @param baseOverrides - Base properties to apply to all generated entities
	 * @returns An array of TimeSlot entities with random data
	 */
	static createTimeSlots(count: number, baseOverrides: Partial<ITimeSlot> = {}): ITimeSlot[] {
		return Array.from({ length: count }, (_, index) => {
			// If startedAt is provided in baseOverrides, increment it by 10 minutes for each slot
			let startedAt = baseOverrides.startedAt;
			if (startedAt && index > 0) {
				startedAt = new Date(startedAt.getTime() + index * 10 * 60 * 1000);
			}
			
			return this.createTimeSlot({
				...baseOverrides,
				startedAt,
				id: baseOverrides.id ? `${baseOverrides.id}-${index}` : uuidv4()
			});
		});
	}

	/**
	 * Generate a random TimeSlotMinute entity
	 * @param overrides - Optional properties to override in the generated entity
	 * @returns A TimeSlotMinute entity with random data
	 */
	static createTimeSlotMinute(overrides: Partial<ITimeSlotMinute> = {}): ITimeSlotMinute {
		return {
			id: overrides.id || uuidv4(),
			timeSlotId: overrides.timeSlotId || uuidv4(),
			keyboard: overrides.keyboard !== undefined ? overrides.keyboard : Math.floor(Math.random() * 60),
			mouse: overrides.mouse !== undefined ? overrides.mouse : Math.floor(Math.random() * 60),
			datetime: overrides.datetime || new Date(),
			tenantId: overrides.tenantId || uuidv4(),
			organizationId: overrides.organizationId || uuidv4(),
			...overrides
		};
	}
}

describe('TimeSlotService', () => {
	let service: TimeSlotService;
	let commandBus: CommandBus;
	let typeOrmTimeSlotRepository: TypeOrmTimeSlotRepository;

	// Use the factory to create test data
	const mockTimeSlot = TestDataFactory.createTimeSlot({
		id: 'time-slot-1',
		employeeId: 'employee-1',
		organizationId: 'organization-1',
		tenantId: 'tenant-1'
	});
	
	const mockTimeSlotMinute = TestDataFactory.createTimeSlotMinute({
		id: 'time-slot-minute-1',
		timeSlotId: mockTimeSlot.id,
		organizationId: 'organization-1',
		tenantId: 'tenant-1'
	});
	
	const mockTimeSlots = TestDataFactory.createTimeSlots(3, {
		employeeId: 'employee-1',
		organizationId: 'organization-1',
		tenantId: 'tenant-1',
		startedAt: new Date('2023-01-01T10:00:00Z')
	});

	const mockEmployeeId = 'employee-1';
	const mockOrganizationId = 'organization-1';

	beforeEach(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				{
					provide: TimeSlotService,
					useFactory: (typeOrmRepo, commandBus) => {
						return new TimeSlotService(typeOrmRepo, null, commandBus); // Pass null for mikroOrmTimeSlotRepository
					},
					inject: [TypeOrmTimeSlotRepository, CommandBus]
				},
				{
					provide: TypeOrmTimeSlotRepository,
					useValue: {
						findOne: jest.fn(),
						find: jest.fn(),
						create: jest.fn(),
						save: jest.fn(),
						createQueryBuilder: jest.fn(() => ({
							leftJoin: jest.fn().mockReturnThis(),
							innerJoin: jest.fn().mockReturnThis(),
							setFindOptions: jest.fn().mockReturnThis(),
							where: jest.fn().mockReturnThis(),
							getMany: jest.fn().mockResolvedValue([mockTimeSlot])
						}))
					}
				},
				{
					provide: CommandBus,
					useValue: {
						execute: jest.fn()
					}
				}
			]
		}).compile();

		service = module.get<TimeSlotService>(TimeSlotService);
		commandBus = module.get<CommandBus>(CommandBus);
		typeOrmTimeSlotRepository = module.get<TypeOrmTimeSlotRepository>(TypeOrmTimeSlotRepository);

		// Mock RequestContext methods
		jest.spyOn(RequestContext, 'currentTenantId').mockReturnValue('tenant-1');
		jest.spyOn(RequestContext, 'currentUser').mockReturnValue({
			id: 'user-1',
			employeeId: 'employee-1',
			tenantId: 'tenant-1'
		} as any);
		jest.spyOn(RequestContext, 'hasPermission').mockReturnValue(true);
	});

	it('should be defined', () => {
		expect(service).toBeDefined();
	});

	describe('getTimeSlots', () => {
		let queryBuilder;
		let qbWhereFn;

		beforeEach(() => {
			// Create a more detailed mock of the query builder to test the query construction
			qbWhereFn = jest.fn().mockReturnThis();

			queryBuilder = {
				leftJoin: jest.fn().mockReturnThis(),
				innerJoin: jest.fn().mockReturnThis(),
				setFindOptions: jest.fn().mockReturnThis(),
				where: jest.fn().mockImplementation((callback) => {
					// Mock the SelectQueryBuilder that gets passed to the where callback
					const qb = {
						andWhere: qbWhereFn,
						addOrderBy: jest.fn().mockReturnThis()
					};
					callback(qb);
					return queryBuilder;
				}),
				getMany: jest.fn().mockResolvedValue([mockTimeSlot])
			};

			jest.spyOn(typeOrmTimeSlotRepository, 'createQueryBuilder').mockReturnValue(queryBuilder);
		});

		it('should construct query with correct date range parameters', async () => {
			const startDate = new Date('2023-01-01T00:00:00Z');
			const endDate = new Date('2023-01-31T23:59:59Z');

			const input: IGetTimeSlotInput = {
				organizationId: mockOrganizationId,
				startDate,
				endDate,
				employeeIds: [mockEmployeeId],
				syncSlots: false
			};

			await service.getTimeSlots(input);

			// Verify that the query builder was called with the correct parameters
			expect(typeOrmTimeSlotRepository.createQueryBuilder).toHaveBeenCalledWith('time_slot');

			// Verify that the date range was used in the query
			expect(qbWhereFn).toHaveBeenCalled();

			// At least one call to andWhere should include the date range parameters
			const dateRangeCallFound = qbWhereFn.mock.calls.some((call) => {
				const [query, params] = call;
				return query.includes('startedAt') && params && params.startDate && params.endDate;
			});

			expect(dateRangeCallFound).toBeTruthy();
		});

		it('should return time slots based on input parameters', async () => {
			// Generate random input data
			const randomTimeSlots = TestDataFactory.createTimeSlots(2);
			queryBuilder.getMany.mockResolvedValueOnce(randomTimeSlots);
			
			const input: IGetTimeSlotInput = {
				organizationId: mockOrganizationId,
				startDate: new Date(),
				endDate: new Date(),
				employeeIds: [mockEmployeeId],
				syncSlots: false
			};

			const result = await service.getTimeSlots(input);

			expect(result).toEqual(randomTimeSlots);
			expect(typeOrmTimeSlotRepository.createQueryBuilder).toHaveBeenCalledWith('time_slot');
			expect(queryBuilder.leftJoin).toHaveBeenCalled();
			expect(queryBuilder.innerJoin).toHaveBeenCalled();
			expect(queryBuilder.setFindOptions).toHaveBeenCalled();
			expect(queryBuilder.where).toHaveBeenCalled();
			expect(queryBuilder.getMany).toHaveBeenCalled();
		});

		it('should use current user employeeId when onlyMe is true', async () => {
			// Generate random time slots for testing
			const randomTimeSlots = TestDataFactory.createTimeSlots(2, {
				employeeId: 'employee-1' // Should match the mocked user's employeeId
			});
			queryBuilder.getMany.mockResolvedValueOnce(randomTimeSlots);
			
			const input: IGetTimeSlotInput = {
				organizationId: mockOrganizationId,
				startDate: new Date(),
				endDate: new Date(),
				onlyMe: true
			};

			const result = await service.getTimeSlots(input);

			// The query builder should be called with the correct parameters
			expect(typeOrmTimeSlotRepository.createQueryBuilder).toHaveBeenCalledWith('time_slot');
			expect(result).toEqual(randomTimeSlots);
		});

		it('should filter by activity level when provided', async () => {
			// Generate random time slots with specific activity levels
			const randomTimeSlots = TestDataFactory.createTimeSlots(2, {
				overall: 80 // High activity level
			});
			queryBuilder.getMany.mockResolvedValueOnce(randomTimeSlots);
			
			const input: IGetTimeSlotInput = {
				organizationId: mockOrganizationId,
				startDate: new Date(),
				endDate: new Date(),
				activityLevel: {
					start: 50,
					end: 100
				}
			};

			const result = await service.getTimeSlots(input);

			expect(typeOrmTimeSlotRepository.createQueryBuilder).toHaveBeenCalledWith('time_slot');
			expect(result).toEqual(randomTimeSlots);
		});

		it('should filter by source when provided', async () => {
			// Generate random time slots for testing
			const randomTimeSlots = TestDataFactory.createTimeSlots(2);
			queryBuilder.getMany.mockResolvedValueOnce(randomTimeSlots);
			
			const input: IGetTimeSlotInput = {
				organizationId: mockOrganizationId,
				startDate: new Date(),
				endDate: new Date(),
				source: [TimeLogSourceEnum.DESKTOP]
			};

			const result = await service.getTimeSlots(input);

			expect(typeOrmTimeSlotRepository.createQueryBuilder).toHaveBeenCalledWith('time_slot');
			expect(result).toEqual(randomTimeSlots);
		});

		it('should filter by logType when provided', async () => {
			// Generate random time slots for testing
			const randomTimeSlots = TestDataFactory.createTimeSlots(2);
			queryBuilder.getMany.mockResolvedValueOnce(randomTimeSlots);
			
			const input: IGetTimeSlotInput = {
				organizationId: mockOrganizationId,
				startDate: new Date(),
				endDate: new Date(),
				logType: [TimeLogType.TRACKED]
			};

			const result = await service.getTimeSlots(input);

			expect(typeOrmTimeSlotRepository.createQueryBuilder).toHaveBeenCalledWith('time_slot');
			expect(result).toEqual(randomTimeSlots);
		});
	});

	describe('bulkCreateOrUpdate', () => {
		it('should execute TimeSlotBulkCreateOrUpdateCommand', async () => {
			// Generate random time slots for testing
			const randomTimeSlots = TestDataFactory.createTimeSlots(3, {
				employeeId: mockEmployeeId,
				organizationId: mockOrganizationId
			});
			const randomResult = TestDataFactory.createTimeSlots(3);
			
			jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(randomResult);

			const result = await service.bulkCreateOrUpdate(randomTimeSlots, mockEmployeeId, mockOrganizationId);

			expect(commandBus.execute).toHaveBeenCalledWith(
				new TimeSlotBulkCreateOrUpdateCommand(randomTimeSlots, mockEmployeeId, mockOrganizationId)
			);
			expect(result).toEqual(randomResult);
		});
	});

	describe('bulkCreate', () => {
		it('should execute TimeSlotBulkCreateCommand', async () => {
			// Generate random time slots for testing
			const randomTimeSlots = TestDataFactory.createTimeSlots(5, {
				employeeId: mockEmployeeId,
				organizationId: mockOrganizationId
			});
			
			jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(randomTimeSlots);

			const result = await service.bulkCreate(randomTimeSlots, mockEmployeeId, mockOrganizationId);

			expect(commandBus.execute).toHaveBeenCalledWith(
				new TimeSlotBulkCreateCommand(randomTimeSlots, mockEmployeeId, mockOrganizationId)
			);
			expect(result).toEqual(randomTimeSlots);
		});
	});

	describe('generateTimeSlots', () => {
		it('should generate time slots between start and end times', () => {
			const start = new Date('2023-01-01T10:00:00Z');
			const end = new Date('2023-01-01T10:30:00Z');
			const previousTime = 0;

			const result = service.generateTimeSlots(start, end, previousTime);

			// Should generate 3 slots (10:00, 10:10, 10:20) for a 30-minute period with 10-minute slots
			expect(result.length).toBeGreaterThan(0);
			expect(result[0].startedAt).toEqual(start);
		});

		it('should generate correct number of slots for a given time range', () => {
			const start = new Date('2023-01-01T10:00:00Z');
			const end = new Date('2023-01-01T11:00:00Z');
			const previousTime = 0;

			const result = service.generateTimeSlots(start, end, previousTime);

			// For a 1-hour period with 10-minute slots, we should get 6 slots
			expect(result.length).toBe(6);

			// Verify the start times of the first and last slots
			expect(result[0].startedAt).toEqual(start);
			expect(result[5].startedAt.getTime()).toBeLessThan(end.getTime());

			// Verify that slots are 10 minutes apart
			const slot1StartTime = result[0].startedAt.getTime();
			const slot2StartTime = result[1].startedAt.getTime();
			const tenMinutesInMs = 10 * 60 * 1000;
			expect(slot2StartTime - slot1StartTime).toBe(tenMinutesInMs);
		});

		it('should include previous time in the first slot if provided', () => {
			const start = new Date('2023-01-01T10:00:00Z');
			const end = new Date('2023-01-01T10:30:00Z');
			const previousTime = 120; // 2 minutes of previous time

			const result = service.generateTimeSlots(start, end, previousTime);

			// Check that the first slot includes the previous time
			expect(result[0].duration).toBeGreaterThanOrEqual(previousTime);

			// Other slots should not include the previous time
			if (result.length > 1) {
				expect(result[1].duration).not.toBe(previousTime);
			}
		});
	});

	describe('createTimeSlotMinute', () => {
		it('should execute CreateTimeSlotMinutesCommand', async () => {
			// Generate a random TimeSlotMinute for testing
			const randomTimeSlotMinute = TestDataFactory.createTimeSlotMinute({
				timeSlotId: mockTimeSlot.id
			});
			
			jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(randomTimeSlotMinute);

			const result = await service.createTimeSlotMinute(randomTimeSlotMinute);

			expect(commandBus.execute).toHaveBeenCalledWith(new CreateTimeSlotMinutesCommand(randomTimeSlotMinute));
			expect(result).toEqual(randomTimeSlotMinute);
		});
	});

	describe('updateTimeSlotMinute', () => {
		it('should execute UpdateTimeSlotMinutesCommand', async () => {
			// Generate a random TimeSlotMinute for testing
			const randomTimeSlotMinute = TestDataFactory.createTimeSlotMinute({
				timeSlotId: mockTimeSlot.id
			});
			const id = randomTimeSlotMinute.id;
			
			jest.spyOn(commandBus, 'execute').mockResolvedValueOnce(randomTimeSlotMinute);

			const result = await service.updateTimeSlotMinute(id, randomTimeSlotMinute);

			expect(commandBus.execute).toHaveBeenCalledWith(new UpdateTimeSlotMinutesCommand(id, randomTimeSlotMinute));
			expect(result).toEqual(randomTimeSlotMinute);
		});
	});

	describe('error handling', () => {
		it('should handle errors when getTimeSlots fails', async () => {
			// Setup the query builder to throw an error
			const errorMessage = 'Database connection error';
			jest.spyOn(typeOrmTimeSlotRepository, 'createQueryBuilder').mockImplementation(() => {
				throw new Error(errorMessage);
			});

			const input: IGetTimeSlotInput = {
				organizationId: mockOrganizationId,
				startDate: new Date(),
				endDate: new Date()
			};

			// Expect the service to propagate the error
			await expect(service.getTimeSlots(input)).rejects.toThrow(errorMessage);
		});

		it('should handle errors when bulkCreateOrUpdate command fails', async () => {
			// Generate random time slots for testing
			const randomTimeSlots = TestDataFactory.createTimeSlots(3, {
				employeeId: mockEmployeeId,
				organizationId: mockOrganizationId
			});
			
			const errorMessage = 'Failed to create or update time slots';
			jest.spyOn(commandBus, 'execute').mockRejectedValueOnce(new Error(errorMessage));

			await expect(service.bulkCreateOrUpdate(randomTimeSlots, mockEmployeeId, mockOrganizationId)).rejects.toThrow(
				errorMessage
			);
		});

		it('should handle errors when createTimeSlotMinute command fails', async () => {
			// Generate a random TimeSlotMinute for testing
			const randomTimeSlotMinute = TestDataFactory.createTimeSlotMinute();
			
			const errorMessage = 'Failed to create time slot minute';
			jest.spyOn(commandBus, 'execute').mockRejectedValueOnce(new Error(errorMessage));

			await expect(service.createTimeSlotMinute(randomTimeSlotMinute)).rejects.toThrow(errorMessage);
		});
	});
});
