import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';

export async function hashPassword(
  password: string,
  configService: ConfigService,
): Promise<string> {
  const saltRounds = configService.get<number>('HASH_ROUNDS');
  return bcrypt.hash(password, saltRounds);
}
