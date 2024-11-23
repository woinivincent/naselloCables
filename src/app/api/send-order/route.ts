
import path from 'path';
import ExcelJS from 'exceljs';
import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';

interface OrderItem {
  code: string;
  type: string;
  color: string;
  quantity: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  notes: string;
}

interface OrderData {
  items: OrderItem[];
  customerInfo: CustomerInfo;
}

export async function POST(req: Request) {
  try {
    const data: OrderData = await req.json();
    const { items, customerInfo } = data;

    // Ruta del archivo Excel plantilla
    const templatePath = path.resolve('data/planilla_pedidos.xlsx'); // Cambia esta ruta con la ubicación de tu archivo
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(templatePath);
    const sheet = workbook.getWorksheet('Pedido');

    // Rellenar información del cliente
    sheet.getCell('B2').value = customerInfo.name; // Nombre del cliente
    sheet.getCell('J2').value = customerInfo.notes; // Observaciones

    // Limpiar datos previos y rellenar nuevos datos del pedido
    const startRow = 7; // La fila donde comienzan los datos del pedido
    items.forEach((item, index) => {
      const row = sheet.getRow(startRow + index);
      row.getCell(2).value = item.code; // Código
      row.getCell(3).value = item.color; // Color
      row.getCell(5).value = item.type; // Tipo de envase
      row.getCell(6).value = item.quantity; // Cantidad de envases
      row.getCell(7).value = item.quantity; // Metros por envase (ajusta si es diferente)
      row.commit();
    });

    // Guardar el archivo Excel modificado en un buffer
    const buffer = await workbook.xlsx.writeBuffer();

    // Configurar transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Enviar el correo con el archivo adjunto
    await transporter.sendMail({
      from: process.env.SMTP_USER, // Correo configurado para enviar
      to: process.env.ORDER_EMAIL || 'orders@example.com', // Destinatario
      subject: `Nuevo Pedido de ${customerInfo.name}`,
      text: `Estimado equipo,

Se ha recibido un nuevo pedido de ${customerInfo.name}. 
Por favor, revisen los detalles en el archivo adjunto.

Saludos,
Sistema de pedidos.`,
      attachments: [
        {
          filename: `pedido_${customerInfo.name}_${new Date().toISOString().split('T')[0]}.xlsx`,
          content: buffer as Buffer,
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    });

    // Responder con éxito
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error enviando el pedido:', error);
    return NextResponse.json({
      success: false,
      error: 'Error al procesar el pedido',
    });
  }
}
