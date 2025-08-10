// // src/gpt/gpt.controller.ts
// import { Controller, Post, Body } from '@nestjs/common';
// import { GptService } from './gpt.service';

// @Controller('gpt')
// export class GptController {
//   constructor(private readonly gptService: GptService) {}

//   @Post('ask')
// async ask(@Body() body: { prompt: string }) {
//   const response = await this.gptService.ask(body.prompt);
//   return response; // et non pas { response }
// }
// }
import { Controller, Post, Body, BadRequestException } from '@nestjs/common';
import { GptService } from './gpt.service';

@Controller('gpt')
export class GptController {
  constructor(private readonly gptService: GptService) {}

  @Post('ask')
  async ask(@Body() body: { prompt: string }) {
    // console.log('🧾 Question reçue :', body);
    const response = await this.gptService.ask(body.prompt);
    return { response };
  }
}
