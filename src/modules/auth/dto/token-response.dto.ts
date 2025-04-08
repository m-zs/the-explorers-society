import { ApiProperty } from '@nestjs/swagger';

export class TokenResponseDto {
  @ApiProperty({
    description: 'JWT Access Token',
  })
  accessToken: string;
}
