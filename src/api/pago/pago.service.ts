import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PagoService {
  private apiUrl: string;
  private readonly logger = new Logger(PagoService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiUrl = this.configService.get<string>('PAGOFACIL_API_URL');
  }

  // 1. Autenticación para obtener el AccessToken
  private async authenticate(): Promise<string> {
    const tokenService = this.configService.get<string>('PAGOFACIL_TOKENSERVICE');
    const tokenSecret = this.configService.get<string>('PAGOFACIL_TOKENSECRET');

    const response: { data: { error: number; status: number; values: string } } = await firstValueFrom(
      this.httpService.post(`${this.apiUrl}/login`, {
        TokenService: tokenService,
        TokenSecret: tokenSecret,
      })
    );

    if (response.data.error === 0 && response.data.status === 1) {
      return response.data.values; // Este es el AccessToken
    } else {
      throw new Error('Error de autenticación con PagoFacil');
    }
  }

  // 2. Generación de QR para el pago
  public async generateQR(pedido: any): Promise<any> {
    const accessToken = await this.authenticate();

    const headers = {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    };

    const timestamp = Date.now();  // Obtiene el tiempo actual en milisegundos
    const lastSevenDigits = timestamp.toString().slice(-7);

    // const body = {
    //   tcCommerceID: this.configService.get<string>('PAGOFACIL_COMMERCEID'),
    //   tcNroPago: lastSevenDigits,
    //   tcNombreUsuario: pedido.cliente.nombre,
    //   tnCiNit: Math.floor(Math.random() * 777777),
    //   tnTelefono: Math.floor(Math.random() * 99999999),
    //   tcCorreo: pedido.cliente.email,
    //   tcCodigoClienteEmpresa: Date.now().toString(),
    //   tnMontoClienteEmpresa: parseFloat(pedido.total).toFixed(2),
    //   tnMoneda: 2, // 2 = Bolivianos
    //   tcUrlCallBack: this.configService.get<string>('PAGOFACIL_URLCALLBACK'),
    //   tcUrlReturn: this.configService.get<string>('PAGOFACIL_URLRETURN'),
    //   taPedidoDetalle: [
    //     {
    //       Serial: Math.floor(Math.random() * 10000),
    //       Producto: `Pedido ${Math.floor(Math.random() * 1000)}`,
    //       Cantidad: pedido.cantidad,
    //       Precio: parseFloat(pedido.precio).toFixed(2),
    //       Descuento: pedido.descuento,
    //       Total: parseFloat(pedido.total).toFixed(2)
    //     },
    //   ],
    // };
    const body = {
      tcCommerceID: this.configService.get<string>('PAGOFACIL_COMMERCEID'),
      tcNroPago: lastSevenDigits,  // Asegurate de que sea único y correcto
      tcNombreUsuario: pedido.cliente.nombre,
      tnCiNit: pedido.cliente.ci_nit ? parseInt(pedido.cliente.ci_nit) : Math.floor(Math.random() * 777777),
      tnTelefono: pedido.cliente.numeroTelf ? parseInt(pedido.cliente.numeroTelf) : Math.floor(Math.random() * 99999999),
      tcCorreo: pedido.cliente.email,
      tcCodigoClienteEmpresa: pedido.id,  // Usamos el ID de la venta como identificador
      tnMontoClienteEmpresa: parseFloat(pedido.total).toFixed(2),
      tnMoneda: 2, // 2 = Bolivianos
      tcUrlCallBack: this.configService.get<string>('PAGOFACIL_URLCALLBACK'),
      tcUrlReturn: this.configService.get<string>('PAGOFACIL_URLRETURN'),

      // Mapeo de los detalles del pedido
      taPedidoDetalle: pedido.detalles.map((detalle: any) => ({
        Serial: detalle.serial,
        Producto: detalle.producto,
        Cantidad: detalle.cantidad,
        Precio: parseFloat(detalle.precio).toFixed(2),
        Descuento: detalle.descuento || 0,
        Total: parseFloat(detalle.total).toFixed(2)
      }))
    };


    const response: { data: { error: number; status: number; values: string } } = await firstValueFrom(
      this.httpService.post(`${this.apiUrl}/pagoqr`, JSON.stringify(body), { headers })
    );

    if (response.data.error === 0 && response.data.status === 1) {
      const values = response.data.values.split(';')[1];
      const valuesT = response.data.values.split(';')[0];
      const transaccion = JSON.parse(valuesT);
      const qrData = JSON.parse(values);
      return {
        transaccion,
        qr: `data:image/png;base64,${qrData.qrImage}`
      };
    } else {
      throw new Error('Error al generar el QR');
    }
  }

  async processPaymentCallback(callbackData: any) {
    // Aquí procesas los datos del callback
    this.logger.log(`Procesando el callback para el PedidoID: ${callbackData.PedidoID}`);

    // Lógica para actualizar el estado del pedido en la base de datos
    // Por ejemplo:
    // await this.orderRepository.updateStatus(callbackData.PedidoID, callbackData.Estado);

    return { success: true, pedidoId: callbackData.PedidoID, estado: callbackData.Estado };
  }

  async verificarPago(pedidoId: number) {
    const headers = {
      'Authorization': `Bearer ${this.configService.get<string>('PAGOFACIL_ACCESSTOKEN')}`,
      'Content-Type': 'application/json',
    };

    const body = {
      TransaccionDePago: pedidoId
    };

    const response = await firstValueFrom(
      this.httpService.post(`${this.apiUrl}/consultartransaccion`, JSON.stringify(body), { headers })
    );

    const data = response.data.values;

    return {
      // pedidoId,
      // estadoPago, // 1: completado, 0: pendiente o fallido
      // message: messageEstado,
      data
    };
  }

}
