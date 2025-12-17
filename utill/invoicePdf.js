import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = async (order) => {
  const dir = path.join("invoices");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir);

  const filePath = `${dir}/${order.orderId}.pdf`;
  const doc = new PDFDocument({ margin: 50 });

  doc.pipe(fs.createWriteStream(filePath));

  doc.fontSize(20).text("INVOICE", { align: "center" });
  doc.moveDown();

  doc.fontSize(12).text(`Order ID: ${order.orderId}`);
  doc.text(`Customer: ${order.name}`);
  doc.text(`Email: ${order.email}`);
  doc.text(`Phone: ${order.phone}`);
  doc.text(`Address: ${order.address}`);
  doc.moveDown();

  doc.text("Items:");
  order.items.forEach((item) => {
    doc.text(
      `${item.name} x${item.quantity} - LKR ${(
        item.price * item.quantity
      ).toFixed(2)}`
    );
  });

  doc.moveDown();
  doc.fontSize(14).text(`Total: LKR ${order.total.toFixed(2)}`, {
    align: "right",
  });

  doc.end();
  return filePath;
};
