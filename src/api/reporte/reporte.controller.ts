import { Body, Controller, Get, Post, Query, Res } from '@nestjs/common';
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
  async enviarReporteCorreo(
    @Body('entidad') entidad: string,
    @Body('inicio') inicio: string,
    @Body('fin') fin: string,
    @Body('emails') emails: string[],
    @Body('subject') subject: string,
    @Body('body') body: string
  ) {
    const datos = await this.reportesService.obtenerDatosPorRango(entidad, inicio, fin);

    if (!datos.data.length) {
      return { message: `No hay registros en ${entidad} dentro del rango de fechas.` };
    }

    const pdfBuffer = await this.pdfService.generarReporte(datos.data, entidad);

    await this.mailService.enviarCorreoConAdjunto(emails, subject, body, pdfBuffer, `Reporte_${entidad}.pdf`);

    return { message: `El reporte de ${entidad} se envió correctamente a los destinatarios.` };
  }

  // async enviarReporteCorreo(
  //   @Query('entidad') entidad: string,
  //   @Query('inicio') inicio: string,
  //   @Query('fin') fin: string,
  //   @Query('emails') emails: string,
  //   @Query('subject') subject: string,
  //   @Query('body') body: string
  // ) {
  //   const datos = await this.reportesService.obtenerDatosPorRango(entidad, inicio, fin);
  //   if (!datos.data.length) {
  //     return { message: `No hay registros en ${entidad} dentro del rango de fechas.` };
  //   }

  //   const pdfBuffer = await this.pdfService.generarReporte(datos.data, entidad);
  //   const destinatarios = emails.split(',').map(email => email.trim());

  //   await this.mailService.enviarCorreoConAdjunto(destinatarios, subject, body, pdfBuffer, `Reporte_${entidad}.pdf`);

  //   return { message: `El reporte de ${entidad} se envió correctamente a los destinatarios.` };
  // }
}
