import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { TransactionsModule } from './modules/transactions/transactions.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.env.${process.env.NODE_ENV || 'development'}`,
    }),
    
    // Configuración de TypeORM para PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get('DB_USERNAME', 'postgres'),
        password: configService.get('DB_PASSWORD', 'postgres'),
        database: configService.get('DB_DATABASE', 'famisuper'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE', false),
        logging: configService.get<boolean>('DB_LOGGING', false),
        migrations: [__dirname + '/database/migrations/**/*{.ts,.js}'],
        migrationsTableName: 'migrations',
      }),
    }),
    
    // Módulos de la aplicación
    AuthModule,
    UsersModule,
    TransactionsModule,
    ReportsModule,
  ],
})
export class AppModule {}
