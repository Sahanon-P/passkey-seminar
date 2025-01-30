import { Body, Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import {
  AuthenticationResponseJSON,
  RegistrationResponseJSON,
} from '@simplewebauthn/server';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('register')
  async register(@Body() body: { email: string }) {
    return await this.appService.register(body.email);
  }

  @Post('register/verify')
  async verifyRegister(
    @Body() body: { email: string; data: RegistrationResponseJSON },
  ) {
    return await this.appService.verifyRegister(body.email, body.data);
  }

  @Post('login')
  async login(@Body() body: { email: string }) {
    return await this.appService.login(body.email);
  }

  @Post('login/verify')
  async verifyLogin(
    @Body() body: { email: string; data: AuthenticationResponseJSON },
  ) {
    return this.appService.verifyLogin(body.email, body.data);
  }
}
