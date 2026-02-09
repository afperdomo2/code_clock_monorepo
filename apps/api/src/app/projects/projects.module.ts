import { Module } from '@nestjs/common';
import { PrismaModule } from '@code-clock-mono/prisma-client';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
