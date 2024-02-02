import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private schema: ZodSchema) {}

  transform(value: unknown, metadata: ArgumentMetadata) {
    if (metadata.type != 'body') return value;
    try {
      const parsedValue = this.schema.parse(value);

      return parsedValue;
    } catch (error) {
      if (error instanceof ZodError) {
        console.log(error.issues);
        const errorMsg = error.issues[0].message;
        throw new BadRequestException(`${errorMsg}`);
      } else {
        throw new BadRequestException(`${error}`);
      }
    }
  }
}
