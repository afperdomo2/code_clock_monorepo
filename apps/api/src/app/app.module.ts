import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';
import { FirstRunGuard } from './common/guards/first-run.guard';
import { DeliverablesModule } from './deliverables/deliverables.module';
import { ProjectsModule } from './projects/projects.module';
import { SetupModule } from './setup/setup.module';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 60_000, limit: 10 },
      { name: 'medium', ttl: 600_000, limit: 100 },
    ]),
    UsersModule,
    ProjectsModule,
    DeliverablesModule,
    TimeEntriesModule,
    AuthModule,
    SetupModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: FirstRunGuard,
    },
  ],
})
export class AppModule {}
