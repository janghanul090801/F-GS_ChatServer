import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Chat Server')
    .setDescription('F-GS ChatServer')
    .setVersion('1.0')
    .addServer('https://fg.sunrin.kr/ws')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.use(cookieParser());
  app.enableCors({
    origin: (origin, callback) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(null, true);
    },
    credentials: true, // 쿠키 허용
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowHeaders: '*',
  });

  await app.listen(3001);
}
bootstrap();
