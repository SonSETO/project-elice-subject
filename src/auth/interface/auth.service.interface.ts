import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoginDto } from '../dto/login.dto';
import { User } from 'src/users/entities/user.entity';

export interface IAuthService {
  register(createUserDto: CreateUserDto): Promise<User>;

  sendAuthMail(email: string): Promise<void>;

  validateAuthCode(email: string, code: string): Promise<void>;

  login(loginDto: LoginDto): Promise<{ accessToken: string }>;
}
