import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class NewQuoteDto {
  @IsNotEmpty()
  @IsString()
  content: string;
}
