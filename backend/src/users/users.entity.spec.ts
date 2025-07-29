import { User } from './users.entity';
import { Project } from '../projects/projects.entity';
import { Task } from '../tasks/tasks.entity';
import { UserRole } from './users.entity';

describe('User Entity', () => {
  it('should be defined', () => {
    expect(new User()).toBeDefined();
  });

  it('should have all properties', () => {
    const user = new User();
    user.id = 1;
    user.nom = 'Doe';
    user.prenom = 'John';
    user.telephone = '1234567890';
    user.email = 'john@example.com';
    user.password = 'hashedpassword';
    user.role = UserRole.MEMBRE_EQUIPE;
    user.isActive = true;
    user.projets = [];
    user.tachesAssignees = [];

    expect(user.id).toEqual(1);
    expect(user.nom).toEqual('Doe');
    expect(user.prenom).toEqual('John');
    expect(user.telephone).toEqual('1234567890');
    expect(user.email).toEqual('john@example.com');
    expect(user.password).toEqual('hashedpassword');
    expect(user.role).toEqual(UserRole.MEMBRE_EQUIPE);
    expect(user.isActive).toEqual(true);
    expect(user.projets).toEqual([]);
    expect(user.tachesAssignees).toEqual([]);
  });

  it('should have correct enum values', () => {
    expect(UserRole.ADMIN).toEqual('ADMIN');
    expect(UserRole.CHEF_PROJET).toEqual('CHEF_PROJET');
    expect(UserRole.MEMBRE_EQUIPE).toEqual('MEMBRE_EQUIPE');
    expect(UserRole.GESTIONNAIRE_RESSOURCES).toEqual('GESTIONNAIRE_RESSOURCES');
  });
});