import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Enable CORS with restricted origins
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'http://localhost:3001'];

    app.enableCors({
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
            // Allow requests with no origin (mobile apps, curl, etc.)
            if (!origin) return callback(null, true);

            // Allow wildcard for easier dev/startup usage, or specific matches
            if (allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });

    // Global validation pipe (transform only; Zod pipes handle body validation)
    app.useGlobalPipes(new ValidationPipe({
        transform: true,
    }));

    // Port configuration
    const port = process.env.PORT || 4000;
    await app.listen(port);
    console.log(`Application is running on: ${await app.getUrl()}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
