import { Module } from '@nestjs/common';
import { AdminOwnerController } from './admin-owner.controller';
import { AdminOwnerService } from './admin-owner.service';

@Module({
  controllers: [AdminOwnerController],
  providers: [AdminOwnerService],
})
export class AdminOwnerModule {}
