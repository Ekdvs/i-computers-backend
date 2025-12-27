import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    const dir = path.join("invoices");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);

    const filePath = `${dir}/${order.orderId}.pdf`;
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);

    stream.on("finish", () => resolve(filePath));
    stream.on("error", (err) => reject(err));

    doc.pipe(stream);

    // ------------------ Header ------------------
    doc.fillColor("#333").fontSize(20).text("I Computers Shop", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(14).fillColor("#555").text("Invoice", { align: "center" });
    doc.moveDown();

    // ------------------ Order Info ------------------
    doc.fontSize(12).fillColor("#000");
    doc.text(`Order ID: ${order.orderId}`);
    doc.text(`Customer: ${order.name}`);
    doc.text(`Email: ${order.email || "N/A"}`);
    doc.text(`Phone: ${order.phone}`);
    doc.text(`Address: ${order.address}`);
    doc.moveDown(1);

    // ------------------ Table Header ------------------
    const tableTop = doc.y;
    const itemX = 50;
    const qtyX = 300;
    const priceX = 370;

    doc.fontSize(12).fillColor("#fff").rect(itemX-2, tableTop-2, 400, 20).fill("#007BFF");
    doc.fillColor("#fff").text("Item", itemX, tableTop, { bold: true });
    doc.text("Qty", qtyX, tableTop);
    doc.text("Price", priceX, tableTop, { align: "right" });

    doc.moveDown(1);

    // ------------------ Items ------------------
    let y = tableTop + 20;
    order.items.forEach((item, index) => {
      const isEven = index % 2 === 0;
      const rowHeight = 20;

      // Alternating row color
      if (isEven) {
        doc.rect(itemX-2, y, 400, rowHeight).fill("#f2f2f2");
        doc.fillColor("#000"); // reset text color
      } else {
        doc.fillColor("#000");
      }

      doc.text(item.name, itemX, y);
      doc.text(item.quantity, qtyX, y);
      doc.text(`LKR ${(item.price * item.quantity).toFixed(2)}`, priceX, y, { align: "right" });

      y += rowHeight;
    });

    doc.moveDown(2);

    // ------------------ Total ------------------
    doc.fillColor("#000").fontSize(14).text(`Subtotal: LKR ${order.subtotal.toFixed(2)}`, { align: "right" });
    if (order.discount > 0) {
      doc.fillColor("green").text(`Discount: - LKR ${order.discount.toFixed(2)}`, { align: "right" });
    }
    doc.fillColor("#000").fontSize(16).text(`Total: LKR ${order.total.toFixed(2)}`, { align: "right", bold: true });

    // ------------------ Footer ------------------
    doc.moveDown(2);
    doc.fontSize(12).fillColor("#555").text("Thank you for shopping with I Computers Shop!", { align: "center" });
    doc.text("Visit us: http://localhost:5173", { align: "center", link: "http://localhost:5173", underline: true });

    doc.end();
  });
};
