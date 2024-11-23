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
    // Validate request body
    const data: OrderData = await req.json();
    const { items, customerInfo } = data;

    if (!items?.length || !customerInfo) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid order data provided',
        },
        { status: 400 }
      );
    }

    // Get Excel template path - adjust this based on your project structure
    const templatePath = path.join(process.cwd(), 'public', 'data', 'planilla_pedidos.xlsx');

    // Verify template exists
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(templatePath);
      const sheet = workbook.getWorksheet('Pedido');

      if (!sheet) {
        throw new Error('Worksheet "Pedido" not found in template');
      }

      // Fill customer information
      sheet.getCell('B2').value = customerInfo.name;
      sheet.getCell('J2').value = customerInfo.notes;

      // Clear existing data and fill new order data
      const startRow = 7;

      // Optional: Clear existing data first
      const lastRow = sheet.lastRow?.number || startRow;
      for (let i = startRow; i <= lastRow; i++) {
        const row = sheet.getRow(i);
        row.eachCell((cell) => {
          cell.value = null;
        });
      }

      // Fill new data
      items.forEach((item, index) => {
        const row = sheet.getRow(startRow + index);
        row.getCell(2).value = item.code;
        row.getCell(3).value = item.color;
        row.getCell(5).value = item.type;
        row.getCell(6).value = item.quantity;
        row.getCell(7).value = item.quantity;
        row.commit();
      });

      // Generate Excel buffer
      const buffer = await workbook.xlsx.writeBuffer();

      // Email configuration with better error handling
      const requiredEnvVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'ORDER_EMAIL'];
      const missingEnvVars = requiredEnvVars.filter((varName) => !process.env[varName]);

      if (missingEnvVars.length > 0) {
        throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
      }

      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // Auto-detect secure based on port
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
        tls: {
          rejectUnauthorized: false, // Only use in development
        },
      });

      // Verify SMTP connection
      await transporter.verify();

      // Send email
      const mailResult = await transporter.sendMail({
        from: process.env.SMTP_USER,
        to: process.env.ORDER_EMAIL,
        subject: `Nuevo Pedido de ${customerInfo.name}`,
        text: `
          Estimado equipo,

          Se ha recibido un nuevo pedido de ${customerInfo.name}.
          
          Información del cliente:
          - Teléfono: ${customerInfo.phone}
          - Email: ${customerInfo.email}
          - Observaciones: ${customerInfo.notes}

          Por favor, revisen los detalles en el archivo adjunto.

          Saludos,
          Sistema de pedidos.
        `,
        attachments: [
          {
            filename: `pedido_${customerInfo.name}_${new Date().toISOString().split('T')[0]}.xlsx`,
            content: buffer as Buffer,
            contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          },
        ],
      });

      return NextResponse.json({
        success: true,
        messageId: mailResult.messageId,
      });
    } catch (excelError) {
      console.error('Error processing Excel template:', excelError);

      const errorMessage = excelError instanceof Error ? excelError.message : 'Unknown error';

      return NextResponse.json(
        {
          success: false,
          error: 'Error processing Excel template',
          details: errorMessage,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error processing order:', error);

    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Error processing order',
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
