import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { EstadisticaService } from './estadistica.service';
import { AuthGuard } from 'src/guards/auth/auth.guard';

@Controller('estadisticas')
export class EstadisticaController {
  constructor(private readonly estadisticaService: EstadisticaService) { }

  @Get('total-ventas')
  @UseGuards(AuthGuard)
  async totalVentas(@Query('filtro') filtro?: string) {
    return { total: await this.estadisticaService.totalVentas(filtro) };
  }

  @Get('cantidad-ventas')
  @UseGuards(AuthGuard)
  async cantidadVentasRealizadas(@Query('filtro') filtro?: string) {
    return { cantidad: await this.estadisticaService.cantidadVentasRealizadas(filtro) };
  }

  @Get('ingresos')
  @UseGuards(AuthGuard)
  async ingresosGenerados(@Query('filtro') filtro?: string) {
    return { ingresos: await this.estadisticaService.ingresosGenerados(filtro) };
  }

  @Get('productos-mas-vendidos')
  @UseGuards(AuthGuard)
  async productosMasVendidos(@Query('limit') limit?: string) {
    return await this.estadisticaService.productosMasVendidos(Number(limit));
  }

}
