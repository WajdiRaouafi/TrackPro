// import { Test, TestingModule } from '@nestjs/testing';
// import { getRepositoryToken } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';
// import { User } from './users.entity';
// import { UsersService } from './users.service';
// import { BadRequestException } from '@nestjs/common';
// import * as bcrypt from 'bcrypt';
// import { UserRole } from './users.entity';

// describe('UsersService', () => {
//   let service: UsersService;
//   let userRepository: jest.Mocked<Partial<Repository<User>>>;

//   const mockUser: User = {
//     id: 1,
//     nom: 'Doe',
//     prenom: 'John',
//     telephone: '1234567890',
//     email: 'john@example.com',
//     password: 'hashedpassword',
//     role: UserRole.MEMBRE_EQUIPE,
//     isActive: true,
//     photoUrl: '/uploads/profile/photo-123.jpg',
//     projets: [],
//     tachesAssignees: [],
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         UsersService,
//         {
//           provide: getRepositoryToken(User),
//           useValue: {
//             create: jest.fn().mockReturnValue(mockUser),
//             save: jest.fn().mockResolvedValue(mockUser),
//             find: jest.fn().mockResolvedValue([mockUser]),
//             findOneBy: jest
//               .fn()
//               .mockImplementation((condition) =>
//                 condition.email === 'john@example.com'
//                   ? Promise.resolve(mockUser)
//                   : Promise.resolve(null),
//               ),
//             update: jest.fn().mockResolvedValue({ affected: 1 }),
//             delete: jest.fn().mockResolvedValue({ affected: 1 }),
//           },
//         },
//       ],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//     userRepository = module.get(getRepositoryToken(User));
//     (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue(
//       'hashedpassword',
//     );
//   });

//   afterEach(() => {
//     jest.clearAllMocks();
//   });

//   describe('create', () => {
//     it('should create a new user with hashed password', async () => {
//       const createUserDto = {
//         nom: 'Doe',
//         prenom: 'John',
//         telephone: '1234567890',
//         email: 'new@example.com',
//         password: 'password123',
//         role: UserRole.MEMBRE_EQUIPE,
//         photoUrl: '/uploads/profile/photo-456.jpg',
//       };

//       jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);

//       const result = await service.create(createUserDto);
//       expect(userRepository.create).toHaveBeenCalledWith({
//         ...createUserDto,
//         password: 'hashedpassword',
//       });
//       expect(userRepository.save).toHaveBeenCalled();
//       expect(result).toEqual(mockUser);
//     });

//     it('should throw BadRequestException if email already exists', async () => {
//       const existingUserDto = {
//         email: 'john@example.com',
//         password: 'password123',
//         role: UserRole.MEMBRE_EQUIPE,
//       };

//       await expect(service.create(existingUserDto as any)).rejects.toThrow(
//         BadRequestException,
//       );
//     });
//   });

//   describe('findOne', () => {
//     it('should return a user when found', async () => {
//       jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(mockUser);
//       const result = await service.findOne(1);
//       expect(result).toEqual(mockUser);
//     });

//     it('should return null when user not found', async () => {
//       jest.spyOn(userRepository, 'findOneBy').mockResolvedValueOnce(null);
//       const result = await service.findOne(999);
//       expect(result).toBeNull();
//     });
//   });

//   describe('remove', () => {
//     it('should delete a user and return deletion result', async () => {
//       const result = await service.remove(1);
//       expect(userRepository.delete).toHaveBeenCalledWith(1);
//       expect(result).toEqual({ affected: 1 });
//     });
//   });
// });
