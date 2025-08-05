import { Injectable ,BadRequestException} from '@nestjs/common';
import OpenAI from 'openai';
import { UsersService } from 'src/users/users.service';
import { ProjectsService } from 'src/projects/projects.service';

@Injectable()
export class GptService {
  private openai: OpenAI;

  constructor(
    private readonly usersService: UsersService,
    private readonly projectsService: ProjectsService,
  ) {
    this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }

  async ask(question: string): Promise<string> {
    if (!question || typeof question !== 'string' || !question.trim()) {
      throw new BadRequestException('Le prompt est vide ou invalide.');
    }

    const response = await this.openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: question }],
      max_tokens: 150,
      temperature: 0.5,
      functions: [
        {
          name: 'getActiveUserCount',
          description: 'Retourne le nombre d’utilisateurs actifs',
          parameters: { type: 'object', properties: {} },
        },
        {
          name: 'getTotalUserCount',
          description: 'Retourne le nombre total d’utilisateurs',
          parameters: { type: 'object', properties: {} },
        },
        {
          name: 'getUserRolesBreakdown',
          description: 'Retourne le nombre d’utilisateurs par rôle',
          parameters: { type: 'object', properties: {} },
        },
        {
          name: 'getTotalProjectCount',
          description: 'Retourne le nombre total de projets',
          parameters: { type: 'object', properties: {} },
        },
        {
          name: 'getUserRoleStatus',
          description:
            'Retourne le rôle et le statut (actif/inactif) d’un utilisateur basé sur son nom ou email.',
          parameters: {
            type: 'object',
            properties: {
              identifier: {
                type: 'string',
                description: 'Nom ou email de l’utilisateur',
              },
            },
            required: ['identifier'],
          },
        },
      ],
    });

    const choice = response.choices[0];

    // Handle GPT function calls
    if (choice.finish_reason === 'function_call') {
      const fn = choice.message.function_call?.name;
      const args = choice.message.function_call?.arguments;

      switch (fn) {
        case 'getActiveUserCount': {
          const count = await this.usersService.countActiveUsers();
          return `Il y a actuellement ${count} utilisateur${count > 1 ? 's' : ''} actif${count > 1 ? 's' : ''}.`;
        }

        case 'getTotalUserCount': {
          const count = await this.usersService.countTotalUsers();
          return `Il y a ${count} utilisateur${count > 1 ? 's' : ''} au total.`;
        }

        case 'getUserRolesBreakdown': {
          const roleCounts = await this.usersService.countUsersByRole();
          const lines = Object.entries(roleCounts).map(
            ([role, count]) => `- ${role} : ${count}`,
          );
          return `Répartition des rôles :\n${lines.join('\n')}`;
        }

        case 'getTotalProjectCount': {
          const count = await this.projectsService.countProjects();
          return `Il y a ${count} projet${count > 1 ? 's' : ''} au total.`;
        }

        case 'getUserRoleStatus': {
          let identifier = '';
          try {
            const parsed = JSON.parse(args ?? '{}');
            identifier = parsed.identifier;
          } catch (e) {
            return `Erreur de lecture des paramètres fournis.`;
          }

          if (!identifier) {
            return `Aucun identifiant d’utilisateur fourni.`;
          }

          const user = await this.usersService.findByNameOrEmail(identifier);
          if (!user) {
            return `Aucun utilisateur trouvé avec "${identifier}".`;
          }

          return `L'utilisateur ${user.prenom} a le rôle ${user.role} et son profil est ${user.isActive ? 'actif' : 'inactif'}.`;
        }
      }
    }

    return choice.message.content ?? 'Je n’ai pas compris la question.';
  }
}
