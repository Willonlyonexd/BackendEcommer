import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { SegmentationService } from './segmentation.service';
import { SegmentationController } from './segmentation.controller';

@Module({
  imports: [HttpModule],
  providers: [SegmentationService],
  controllers: [SegmentationController],
})
export class SegmentationModule {}
