import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import ExcelJS from "exceljs";

export async function POST(req: NextRequest) {
  try {
    const { pedido, cliente } = await req.json();

    if (!pedido || !cliente) {
      return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
    }

    const fecha = new Date();
    const fechaTexto = fecha.toLocaleDateString("es-AR");
    const fechaArchivo = fecha.toISOString().split("T")[0]; // yyyy-mm-dd

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Pedido");

    sheet.addRow(["PEDIDO NASELLO CABLES"]);
    sheet.addRow(["CLIENTE", cliente.nombre, "", "", "", `FECHA: ${fechaTexto}`])
    sheet.addRow([]);
    sheet.addRow([
      "Ítem", "Código", "Color", "Descripción", "Tipo de envase", "Cantidad envases",
      "Metros x envase", "Total metros", "Precio x metro", "Subtotal",
      "Obs.particular", "Obs.Facturacion"
    ]);

    pedido.forEach((item: any, index: number) => {
      sheet.addRow([
        index + 1,
        item.codigo,
        item.color,
        item.descripcion,
        item.tipoEnvase,
        item.cantidadEnvases,
        item.metrosPorEnvase,
        item.totalMetros,
        item.precioMetro,
        item.subtotal,
        item.obsParticular || "",
        item.obsFacturacion || "",
      ]);
    });

    const arrayBuffer = await workbook.xlsx.writeBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("Enviando correo a", process.env.DESTINO_PEDIDO);
    console.log({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER
    });
    await transporter.sendMail({
      from: `"Sitio Web" <${process.env.SMTP_USER}>`,
      to: process.env.DESTINO_PEDIDO,
      subject: `Pedido de ${cliente.nombre}`,
      text: `Nuevo pedido de ${cliente.nombre} - ${cliente.email}`,
      attachments: [
        {
          filename: `PEDIDO - ${cliente.nombre} - ${fechaArchivo}.xlsx`,
          content: buffer,
        },
      ],
    });

    return NextResponse.json({ mensaje: "Pedido enviado correctamente" });
  } catch (error: any) {
    console.error("Error al enviar:", error, error.response, error.stack);
    return NextResponse.json({ error: "No se pudo enviar el correo" }, { status: 500 });
  }
}