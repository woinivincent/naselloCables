// src/app/api/send-order/route.ts
import nodemailer from 'nodemailer';
import ExcelJS from 'exceljs';
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
  

    // Crear libro de Excel
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Pedido');

    // Información del cliente
    worksheet.addRow(['Información del Cliente']);
    worksheet.addRow(['Nombre', customerInfo.name]);
    worksheet.addRow(['Email', customerInfo.email]);
    worksheet.addRow(['Teléfono', customerInfo.phone]);
    worksheet.addRow(['Notas', customerInfo.notes]);
    worksheet.addRow([]);

    // Detalles del pedido
    worksheet.addRow(['Detalles del Pedido']);
    worksheet.addRow(['Código', 'Tipo', 'Color', 'Cantidad (metros)']);
    items.forEach(item => {
      worksheet.addRow([item.code, item.type, item.color, item.quantity]);
    });

    // Estilo de la hoja de Excel
    worksheet.getColumn(1).width = 15;
    worksheet.getColumn(2).width = 20;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 15;

    // Generar buffer del Excel
    const buffer = await workbook.xlsx.writeBuffer(); // Aquí generamos el buffer correctamente

    // Crear transporte de correo
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,  // El correo desde el cual se enviarán los correos.
        pass: process.env.SMTP_PASS,
      },
   
    });
    
    // Crear la tabla HTML para el correo
    const tableRows = items.map(item => ` 
      <tr> 
        <td style="border: 1px solid #ddd; padding: 8px;">${item.code}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.type}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.color}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${item.quantity} m</td>
      </tr> 
    `).join('');

    const emailHtml = ` 
      <h2>Nuevo Pedido</h2>
      <h3>Información del Cliente:</h3>
      <p><strong>Nombre:</strong> ${customerInfo.name}</p>
      <p><strong>Email:</strong> ${customerInfo.email}</p>
      <p><strong>Teléfono:</strong> ${customerInfo.phone}</p>
      <p><strong>Notas:</strong> ${customerInfo.notes}</p>
      
      <h3>Detalles del Pedido:</h3>
      <table style="border-collapse: collapse; width: 100%;"> 
        <thead> 
          <tr> 
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Código</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Tipo</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Color</th>
            <th style="border: 1px solid #ddd; padding: 8px; background-color: #f2f2f2;">Cantidad</th>
          </tr>
        </thead>
        <tbody> 
          ${tableRows} 
        </tbody>
      </table>
    `;

    // Enviar el correo con el archivo adjunto
    await transporter.sendMail({
      from: customerInfo.email,  // Usamos el correo del cliente como remitente
      to: process.env.ORDER_EMAIL || 'orders@example.com',  // Correo de destino
      subject: `Nuevo Pedido de ${customerInfo.name}`,
      html: emailHtml,
      attachments: [
        {
          filename: `pedido_${customerInfo.name}_${new Date().toISOString().split('T')[0]}.xlsx`,
          content: buffer as Buffer,  // Cast explícito a Buffer
          contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      ],
    });
    

    // Responder con éxito
    return NextResponse.json({ success: true });
    
  } catch (error) {
    
    console.error('Error sending order:', error);
    return NextResponse.json({
      
      success: false,
      error: 'Error al procesar el pedido',
    });
  
  }

  
}
