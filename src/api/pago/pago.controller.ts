import { Controller, Post, Body, Logger } from '@nestjs/common';
import { PagoService } from './pago.service';

@Controller('pago')
export class PagoController {
  private readonly logger = new Logger(PagoController.name);

  constructor(private readonly pagoService: PagoService) { }

  @Post('checkout')
  async checkout(@Body() pedido: any) {
    try {
      const response = await this.pagoService.generateQR(pedido);
      return response;
    } catch (error) {
      return { error: error.message };
    }
  }

  @Post('verificar')
  async verificarPago(@Body() data: { pedidoId: number }) {
    try {
      const resultado = await this.pagoService.verificarPago(data.pedidoId);
      return resultado;
    } catch (error) {
      return { error: error.message };
    }
  }
  // // Nuevo endpoint para manejar el callback de PagoFacil
  // @Post('callback')
  // async handleCallback(@Body() callbackData: any) {
  //   this.logger.log('Callback recibido de PagoFacil:', callbackData);

  //   try {
  //     // Lógica para actualizar el estado del pedido según la info del callback
  //     const result = await this.pagoService.processPaymentCallback(callbackData);

  //     return {
  //       message: 'Callback recibido y procesado correctamente.',
  //       result,
  //     };
  //   } catch (error) {
  //     this.logger.error('Error procesando el callback:', error);
  //     return {
  //       error: 'Error procesando el callback.',
  //       details: error.message,
  //     };
  //   }
  // }


}
