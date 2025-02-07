import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ReporteService {
  constructor(
    @InjectModel('venta') private readonly ventaModel: Model<any>,
    @InjectModel('ingreso') private readonly ingresoModel: Model<any>,
  ) { }

  // Validación: La fecha de fin no puede ser menor que la de inicio
  async obtenerDatosPorRango(entidad: string, inicio: string, fin: string) {
    try {
      const fechaInicio = new Date(inicio);
      const fechaFin = new Date(fin);

      // Validación: La fecha de fin no puede ser menor que la de inicio
      if (fechaFin < fechaInicio) {
        return { success: false, message: "La fecha de fin no puede ser menor que la fecha de inicio." };
      }

      const modelos = {
        ventas: this.ventaModel,
        ingresos: this.ingresoModel,
      };

      if (!modelos[entidad]) {
        return { success: false, message: `La entidad '${entidad}' no es válida.` };
      }

      const datos = await modelos[entidad].find({
        createdAT: { $gte: fechaInicio, $lte: fechaFin }
      }).lean();

      return { success: true, data: datos };
    } catch (error) {
      console.error("Error en obtenerDatosPorRango:", error);
      return { success: false, message: "Ocurrió un error al obtener los datos." };
    }
  }


}
