import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import wildcardMatch from 'wildcard-match';

export const getCorsOptions = (allowedOrigins: string[]): CorsOptions => {
  const allowedOriginMatchers = allowedOrigins.map(origin =>
    wildcardMatch(origin, { separator: false }),
  );
  const allowedOriginRegexes = allowedOriginMatchers.map(matcher => matcher.regexp);

  return {
    origin: (origin, callback) => {
      if (allowedOriginRegexes.some(regex => regex.test(origin))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    optionsSuccessStatus: 200,
    exposedHeaders: 'Authorization',
  };
};
