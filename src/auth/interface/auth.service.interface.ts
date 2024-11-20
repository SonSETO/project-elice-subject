import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';

export interface IAuthService {
  register(createUserDto: CreateUserDto, passwordConfirm: string): Promise<any>;

  sendAuthMail(email: string): Promise<void>;

  validateAuthCode(email: string, code: string): Promise<void>;

  login(loginDto: LoginDto): Promise<{ accessToken: string }>;
}
