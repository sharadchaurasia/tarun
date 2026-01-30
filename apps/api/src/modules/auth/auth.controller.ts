import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { Public } from '../../common/decorators/public.decorator.js';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('register')
  register(
    @Body() body: { name: string; email: string; password: string; tenantName: string },
  ) {
    return this.authService.register(body);
  }

  @Public()
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body);
  }
}
