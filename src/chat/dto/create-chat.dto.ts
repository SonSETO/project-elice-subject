import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  message: string;

  @IsNumber()
  @IsOptional()
  room?: number;

  @IsNumber()
  @IsOptional()
  targetUserId?: number;

  @IsNumber()
  @IsOptional()
  otherUserId?: number;
}
