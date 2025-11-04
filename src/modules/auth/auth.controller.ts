// src/modules/auth/auth.controller.ts
import { Controller, Post, Body, HttpCode, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  /**
   * Endpoint para registrar un nuevo usuario
   */
  @Post('register')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  signUp(@Body() registerDto: RegisterDto) {
    return this.authService.register(
      registerDto.Nombre_Usuario,
      registerDto.email,
      registerDto.password,
    );
  }

  /**
   * Endpoint para iniciar sesión
   */
  @HttpCode(HttpStatus.OK) // Devuelve 200 OK en lugar de 201 Created
  @Post('login')
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  signIn(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto.email, loginDto.password);
  }
}