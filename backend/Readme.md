# Sigma Backend - No-Code Mobile App Builder

Production-ready backend for the Sigma no-code mobile app builder platform.

## Quick Start

1. Clone repository
2. Copy `.env.example` to `.env` and configure
3. Run `docker-compose up -d`
4. Run `npm run migrate && npm run seed`
5. Start development: `npm run start:dev`

## API Documentation

Swagger documentation available at: `http://localhost:3000/api`

## Architecture

- **Framework**: NestJS + TypeScript
- **Database**: PostgreSQL + Redis
- **Authentication**: JWT + OAuth2
- **File Storage**: AWS S3
- **Queue System**: Bull Queue
- **Code Generation**: Flutter + Amplify Gen 2
- **Deployment**: GitHub Actions + AWS Amplify

## Features

- Visual app designer backend
- Automatic Flutter code generation
- Amplify Gen 2 backend generation
- GitHub repository automation
- App Store & Play Store deployment
- Admin dashboard generation
- Real-time monitoring

## Environment Variables

See `.env.example` for required configuration.

## Production Deployment

1. Build: `npm run build`
2. Deploy Docker image
3. Configure environment variables
4. Run migrations: `npm run migrate`

## License

MIT