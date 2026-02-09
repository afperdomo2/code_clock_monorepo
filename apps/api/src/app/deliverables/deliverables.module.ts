import { Module } from '@nestjs/common';
import { PrismaModule } from '@code-clock-mono/prisma-client';
import { DeliverablesController } from './deliverables.controller';
import { DeliverablesService } from './deliverables.service';

@Module({
  imports: [PrismaModule],
  controllers: [DeliverablesController],
  providers: [DeliverablesService],
})
export class DeliverablesModule {}
