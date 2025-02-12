import {  Controller, Get, Post, Query, Req, Res } from '@nestjs/common';
// import { AuthGuard } from 'src/guards/auth/auth.guard';
import { PdfService } from './pdf.service';
import { MailService } from './mail.service';
import { ReporteService } from './reporte.service';

@Controller('reporte')
export class ReporteController {
  constructor(
    private readonly reportesService: ReporteService,
    private readonly pdfService: PdfService,
    private readonly mailService: MailService
  ) { }

  // Obtener reporte dinámico según la entidad seleccionada
  @Get()
  // @UseGuards(AuthGuard)
  async obtenerReporte(
    @Query('entidad') entidad: string,  // ventas, compras, ingresos, egresos, inventario
    @Query('inicio') inicio: string,
    @Query('fin') fin: string
  ) {
    return this.reportesService.obtenerDatosPorRango(entidad, inicio, fin);
  }

  // Generar y descargar el PDF de cualquier entidad
  @Get('pdf')
  // @UseGuards(AuthGuard)
  async generarReportePDF(
    @Query('entidad') entidad: string,
    @Query('inicio') inicio: string,
    @Query('fin') fin: string,
    @Res() res
  ) {
    const datos = await this.reportesService.obtenerDatosPorRango(entidad, inicio, fin);
    const pdfBuffer = await this.pdfService.generarReporte(datos.data, entidad);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=Reporte_${entidad}.pdf`
    });

    res.send(pdfBuffer);
  }

  @Post('enviar')
  // @UseGuards(AuthGuard)
  @Post('enviar')
  async enviarReporteCorreo(@Res()res, @Req() req) {
    const { entidad, inicio, fin, email, asunto, mensaje } = req.body;
    
    console.log('req.body', req.body);
    
    const subject = asunto;
    const body = mensaje;
    const datos = await this.reportesService.obtenerDatosPorRango(entidad, inicio, fin);
    const detalles= await this.reportesService.obtenerDetallesPorRango(entidad, inicio, fin);

    console.log('detalles del controlador', detalles);
    
    if (!datos.data.length) {
      return { message: `No hay registros en ${entidad} dentro del rango de fechas.` };
    }

    const pdfBuffer = await this.pdfService.generarReporte(datos.data, entidad);

    const pdfBufferDetalles = await this.pdfService.generarReporteDetalles(detalles.data, entidad);

    const respuesta =await this.mailService.enviarCorreoConAdjunto(email, subject, body, pdfBuffer,pdfBufferDetalles, `Reporte_${entidad}.pdf`,`ReporteDetalles_${entidad}.pdf`);

    res.send(respuesta);
  }

  
}
