import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class EstadisticaService {
  constructor(
    @InjectModel('venta') private readonly ventaModel: Model<any>,
    @InjectModel('ventaDetalle') private readonly ventaDetalleModel: Model<any>,
  ) { }

  /**
   * Calcula el total de ventas en la plataforma.
   */
  async totalVentas(filtro?: string): Promise<number> {
    let matchStage = {};
    if (filtro) {
      matchStage = this.getFechaFiltro(filtro);
    }

    const resultado = await this.ventaModel.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    return resultado.length > 0 ? resultado[0].total : 0;
  }

  /**
   * Retorna la cantidad total de ventas realizadas.
   */
  async cantidadVentasRealizadas(filtro?: string): Promise<number> {
    let matchStage = {};
    if (filtro) {
      matchStage = this.getFechaFiltro(filtro);
    }

    return await this.ventaModel.countDocuments(matchStage);
  }

  /**
   * Obtiene los ingresos generados en un periodo de tiempo.
   */
  async ingresosGenerados(filtro?: string): Promise<number> {
    let matchStage = {};
    if (filtro) {
      matchStage = this.getFechaFiltro(filtro);
    }

    const resultado = await this.ventaModel.aggregate([
      { $match: matchStage },
      { $group: { _id: null, total: { $sum: '$total' } } },
    ]);

    return resultado.length > 0 ? resultado[0].total : 0;
  }

  /**
   * Retorna los productos más vendidos con su cantidad total.
   */
  async productosMasVendidos(limit: string | number = 5): Promise<any[]> {
    const limitNumber = Number(limit); // 🔥 Convierte a número

    if (isNaN(limitNumber) || limitNumber <= 0) {
      throw new Error("El parámetro 'limit' debe ser un número válido mayor a 0.");
    }

    return await this.ventaDetalleModel.aggregate([
      { $group: { _id: '$producto', totalVendidos: { $sum: '$cantidad' } } },
      { $sort: { totalVendidos: -1 } },
      { $limit: limitNumber }, // 🔥 Asegura que aquí llegue un número
      {
        $lookup: {
          from: 'productos',
          localField: '_id',
          foreignField: '_id',
          as: 'productoInfo'
        }
      },
      { $unwind: '$productoInfo' },
      { $project: { _id: 0, producto: '$productoInfo.titulo', totalVendidos: 1 } },
    ]);
  }


  /**
   * Método dinámico para filtrar por fecha.
   */
  private getFechaFiltro(periodo: string): object {
    const fechaInicio = new Date();
    if (periodo === 'dia') {
      fechaInicio.setHours(0, 0, 0, 0);
    } else if (periodo === 'semana') {
      fechaInicio.setDate(fechaInicio.getDate() - 7);
    } else if (periodo === 'mes') {
      fechaInicio.setMonth(fechaInicio.getMonth() - 1);
    } else if (periodo === 'año') {
      fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
    }
    return { createdAT: { $gte: fechaInicio } };
  }
}
