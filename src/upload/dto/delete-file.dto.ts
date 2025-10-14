import { IsString, IsNotEmpty, IsArray, ArrayMinSize } from 'class-validator';

export class DeleteFileDto {
  @IsString()
  @IsNotEmpty()
  key!: string;
}

export class DeleteMultipleFilesDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  keys!: string[];
}
