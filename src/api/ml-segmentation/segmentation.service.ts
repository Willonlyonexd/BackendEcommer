import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';


@Injectable()
export class SegmentationService {
  private readonly baseUrl = 'https://backendpysegmentacion.onrender.com/api';

  constructor(private readonly httpService: HttpService) {}

  async getSegmentationStatus(): Promise<any> {
    const response$ = this.httpService.get(`${this.baseUrl}/segmentation/status`);
    const response = await lastValueFrom(response$);
    return response.data;
  }

  async runSegmentation(): Promise<any> {
    const response$ = this.httpService.post(`${this.baseUrl}/segmentation/run`);
    const response = await lastValueFrom(response$);
    return response.data;
  }

  async getCustomerSegment(customerId: string): Promise<any> {
    const response$ = this.httpService.get(`${this.baseUrl}/customer/segment/${customerId}`);
    const response = await lastValueFrom(response$);
    return response.data;
  }

  async checkNewData(): Promise<any> {
    const response$ = this.httpService.get(`${this.baseUrl}/segmentation/check-new-data`);
    const response = await lastValueFrom(response$);
    return response.data;
  }
  async getClientesSegmentados(): Promise<any> {
    const url = 'https://backendpysegmentacion.onrender.com/api/segmentation/customers';
    const response = await lastValueFrom(this.httpService.get(url));
    return response.data;
  }
  
}  
