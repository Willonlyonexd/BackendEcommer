import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com', // Cambia esto si usas Gmail o Outlook
        port: 587,
        secure: false,
        auth: {
            user: 'junior.zf.99@gmail.com',
            pass: 'exis igvj uegr tmjc'
        },
    });

    async enviarCorreoConAdjunto(destinatarios: string[], subject: string, body: string, pdfBuffer: Buffer, fileName: string) {
        try {
            const info = await this.transporter.sendMail({
                from: '"Tkm jeans" <sopote@tecnoweb.edu>',
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
