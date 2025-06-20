import { createParamDecorator, ExecutionContext, SetMetadata } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const Public = () => SetMetadata('isPublic', true);

export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export const RequireSubscription = (plan?: string) => 
  SetMetadata('subscription', { required: true, plan });

export const RateLimit = (limit: number, windowMs: number) =>
  SetMetadata('rateLimit', { limit, windowMs });

export const ApiKeyRequired = () => SetMetadata('apiKey', true);

export const FeatureFlag = (flag: string) => SetMetadata('featureFlag', flag);

export const AuditLog = (action: string) => SetMetadata('auditLog', action);

export const ValidateOwnership = (resource: string) => 
  SetMetadata('validateOwnership', resource);

export const CacheKey = (key: string, ttl?: number) => 
  SetMetadata('cache', { key, ttl });

export const Transform = (transformFn: Function) => 
  SetMetadata('transform', transformFn);