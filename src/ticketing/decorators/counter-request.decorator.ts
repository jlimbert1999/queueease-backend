import { createParamDecorator, ExecutionContext, InternalServerErrorException } from '@nestjs/common';

export const CounterRequest = createParamDecorator<string, ExecutionContext>(
  (propertyPath: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const counter = request['counter'];
    if (!counter) throw new InternalServerErrorException('Not counter in request');
    return !propertyPath ? counter : counter[propertyPath];
  },
);
