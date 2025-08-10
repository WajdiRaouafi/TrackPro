// import { Test, TestingModule } from '@nestjs/testing';
// import { UsersController } from './users.controller';
// import { UsersService } from './users.service';
// import { User } from './users.entity';
// import { CreateUserDto } from './dto/create-user.dto';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { UserRole } from './users.entity';
// import { JwtAuthGuard } from '../auth/jwt.guard';
// import { ExecutionContext } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// describe('UsersController', () => {
//   let controller: UsersController;
//   let usersService: UsersService;

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

//   const mockRequest = {
//     user: {
//       id: 1,
//     },
//   };

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       controllers: [UsersController],
//       providers: [
//         {
//           provide: UsersService,
//           useValue: {
//             create: jest.fn().mockResolvedValue(mockUser),
//             findAll: jest.fn().mockResolvedValue([mockUser]),
//             findOne: jest.fn().mockResolvedValue(mockUser),
//             update: jest.fn().mockResolvedValue(mockUser),
//             remove: jest.fn().mockResolvedValue(undefined),
//           },
//         },
//         Reflector,
//       ],
//     })
//       .overrideGuard(JwtAuthGuard)
//       .useValue({
//         canActivate: (context: ExecutionContext) => {
//           const req = context.switchToHttp().getRequest();
//           req.user = mockRequest.user;
//           return true;
//         },
//       })
//       .compile();

//     controller = module.get<UsersController>(UsersController);
//     usersService = module.get<UsersService>(UsersService);
//   });

//   describe('create', () => {
//     it('should create a new user', async () => {
//       const createUserDto: any = {
//         nom: 'Doe',
//         prenom: 'John',
//         telephone: '1234567890',
//         email: 'john@example.com',
//         password: 'password123',
//         role: UserRole.MEMBRE_EQUIPE,
//       };

//       const result = await controller.create(null as any, createUserDto);
//       expect(usersService.create).toHaveBeenCalledWith({
//         ...createUserDto,
//         photoUrl: undefined,
//       });
//       expect(result).toEqual(mockUser);
//     });
//   });

//   describe('findAll', () => {
//     it('should return an array of users', async () => {
//       const result = await controller.findAll();
//       expect(usersService.findAll).toHaveBeenCalled();
//       expect(result).toEqual([mockUser]);
//     });
//   });

//   describe('findOne', () => {
//     it('should return a single user', async () => {
//       const result = await controller.findOne(1);
//       expect(usersService.findOne).toHaveBeenCalledWith(1);
//       expect(result).toEqual(mockUser);
//     });
//   });

//   describe('update', () => {
//     it('should update a user', async () => {
//       const updateUserDto: UpdateUserDto = { nom: 'Updated' };
//       const result = await controller.update(1, updateUserDto as Partial<User>);
//       expect(usersService.update).toHaveBeenCalledWith(
//         1,
//         updateUserDto as Partial<User>,
//       );
//       expect(result).toEqual(mockUser);
//     });
//   });

//   describe('updateOwnProfile', () => {
//     it('should update only allowed fields', async () => {
//       const updateData = {
//         nom: 'Updated',
//         prenom: 'Jane',
//         telephone: '0987654321',
//         email: 'new@example.com', // should be ignored
//         role: UserRole.ADMIN, // should be ignored
//       };

//       const expectedUpdate = {
//         nom: 'Updated',
//         prenom: 'Jane',
//         telephone: '0987654321',
//       };

//       jest.spyOn(usersService, 'update').mockResolvedValueOnce({
//         ...mockUser,
//         ...expectedUpdate,
//       });

//       const result = await controller.updateOwnProfile(
//         mockRequest as any,
//         updateData,
//       );
//       expect(usersService.update).toHaveBeenCalledWith(1, expectedUpdate);
//       expect(result.nom).toEqual('Updated');
//       expect(result.prenom).toEqual('Jane');
//       expect(result.telephone).toEqual('0987654321');
//       expect(result.email).toEqual('john@example.com'); // original value
//       expect(result.role).toEqual(UserRole.MEMBRE_EQUIPE); // original value
//     });
//   });

//   describe('remove', () => {
//     it('should delete a user', async () => {
//       await controller.remove(1);
//       expect(usersService.remove).toHaveBeenCalledWith(1);
//     });
//   });
// });
