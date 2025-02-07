import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
        host: 'tecnoweb.edu', // Cambia esto si usas Gmail o Outlook
        port: 587,
        secure: false,
        auth: {
            user: 'ana@tecnoweb.edu',
            pass: '1234'
        },
        logger: true,
        debug: true,
        tls: {
            rejectUnauthorized: false // Si estás usando un certificado autofirmado
        }
    });

    async enviarCorreoConAdjunto(destinatarios: string[], subject: string, body: string, pdfBuffer: Buffer, fileName: string) {
        try {
            const info = await this.transporter.sendMail({
                from: '"Tecnoweb" <ana@tecnoweb.edu>',
                to: destinatarios.join(', '),
                subject,
                text: body,
                attachments: [
                    {
                        filename: fileName,
                        content: pdfBuffer
                    }
                ]
            });

            console.log('Correo enviado:', info.messageId);
        } catch (error) {
            console.error('Error al enviar correo:', error);
        }
    }
}
