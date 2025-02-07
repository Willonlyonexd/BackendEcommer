import { Injectable } from '@nestjs/common';
import PDFDocument = require('pdfkit');


@Injectable()
export class PdfService {
    async generarReporte(datos: any[], entidad?: string): Promise<Buffer> {
        if (!entidad) {
            throw new Error("El parámetro 'entidad' es requerido para generar el reporte.");
        }

        const doc = new PDFDocument();
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => { });

        doc.fontSize(20).text(`Reporte de ${entidad.toUpperCase()}`, { align: 'center' });
        doc.moveDown();

        datos.forEach((item, index) => {
            doc.fontSize(12).text(`${index + 1}. Fecha: ${item.createdAT}`);
            doc.text(`Total: $${item.total || 'N/A'}`);
            doc.text(`Usuario: ${item.usuario || 'N/A'}`);
            doc.text(`Proveedor: ${item.proveedor || 'N/A'}`);
            doc.moveDown();
        });

        doc.end();
        return new Promise((resolve) => {
            doc.on('end', () => {
                resolve(Buffer.concat(buffers));
            });
        });
    }


}
