import { Controller, Get, Post, Param } from '@nestjs/common';
import { SegmentationService } from './segmentation.service';

@Controller('segmentation')
export class SegmentationController {
  constructor(private readonly segmentationService: SegmentationService) {}

  @Get('status')
  async getStatus() {
    return await this.segmentationService.getSegmentationStatus();
  }

  @Post('run')
  async run() {
    return await this.segmentationService.runSegmentation();
  }

  @Get('customer/:id')
  async getCustomer(@Param('id') id: string) {
    return await this.segmentationService.getCustomerSegment(id);
  }

  @Get('check-new-data')
  async checkNewData() {
    return await this.segmentationService.checkNewData();
  }
  @Get('clientes')
  async getClientesSegmentados() {
    return this.segmentationService.getClientesSegmentados();
  }
}
