import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

/**
 * Generates a PDF invoice for a given order
 * @param {Object} order - The order object
 * @returns {Promise<string>} - Resolves with the PDF file path
 */
export const generateInvoicePDF = (order) => {
  return new Promise((resolve, reject) => {
    try {
      // 1️⃣ Ensure invoices directory exists
      const dir = path.join("invoices");
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

      const filePath = path.join(dir, `${order.orderId}.pdf`);
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const stream = fs.createWriteStream(filePath);

      doc.pipe(stream);

      // 2️⃣ Colors
      const colors = {
        primary: "#2563eb",
        secondary: "#64748b",
        accent: "#10b981",
        dark: "#1e293b",
        light: "#f8fafc",
        border: "#e2e8f0",
      };

      // ------------------ Header ------------------
      doc.rect(0, 0, 612, 120).fill(colors.primary);

      doc
        .fillColor("#ffffff")
        .fontSize(28)
        .font("Helvetica-Bold")
        .text("I COMPUTERS SHOP", 50, 40);

      doc
        .fontSize(11)
        .font("Helvetica")
        .fillColor("#e0e7ff")
        .text("Your trusted technology partner", 50, 75);

      doc
        .fontSize(32)
        .font("Helvetica-Bold")
        .fillColor("#ffffff")
        .text("INVOICE", 400, 50, { width: 150, align: "right" });

      // ------------------ Order & Customer Info ------------------
      let currentY = 150;
      const leftCol = 50;
      const rightCol = 320;

      // Order info
      doc.fontSize(10).font("Helvetica-Bold").fillColor(colors.secondary).text("INVOICE DETAILS", leftCol, currentY);
      currentY += 20;

      doc.font("Helvetica").fillColor(colors.dark);
      doc.text("Invoice Number:", leftCol, currentY);
      doc.font("Helvetica-Bold").text(order.orderId || "N/A", leftCol + 100, currentY);

      currentY += 18;
      doc.font("Helvetica").text("Date:", leftCol, currentY);
      doc.font("Helvetica-Bold").text(new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }), leftCol + 100, currentY);

      // Customer info
      currentY = 150;
      doc.font("Helvetica-Bold").fillColor(colors.secondary).text("BILL TO", rightCol, currentY);
      currentY += 20;

      doc.font("Helvetica-Bold").fillColor(colors.dark).text(order.name || "Customer", rightCol, currentY);
      currentY += 18;
      doc.font("Helvetica").fillColor(colors.secondary).text(order.email || "N/A", rightCol, currentY);
      currentY += 15;
      doc.text(order.phone || "N/A", rightCol, currentY);
      currentY += 15;
      doc.text(order.address || "N/A", rightCol, currentY, { width: 200 });

      // ------------------ Divider ------------------
      doc.moveTo(50, 280).lineTo(562, 280).strokeColor(colors.border).lineWidth(1).stroke();

      // ------------------ Table Header ------------------
      const tableTop = 300;
      const itemCol = 50;
      const qtyCol = 360;
      const priceCol = 440;
      const totalCol = 500;

      doc.rect(itemCol, tableTop, 512, 25).fill(colors.light);

      doc.fontSize(10).font("Helvetica-Bold").fillColor(colors.dark)
        .text("ITEM", itemCol + 10, tableTop + 8)
        .text("QTY", qtyCol, tableTop + 8)
        .text("PRICE", priceCol, tableTop + 8)
        .text("TOTAL", totalCol, tableTop + 8);

      // ------------------ Table Items ------------------
      let itemY = tableTop + 35;
      if (!Array.isArray(order.items)) order.items = [];

      order.items.forEach((item, index) => {
        const rowHeight = 30;

        // Alternating row background
        if (index % 2 === 0) {
          doc.rect(itemCol, itemY - 5, 512, rowHeight).fill("#fafafa");
        }

        doc.fontSize(10).font("Helvetica").fillColor(colors.dark)
          .text(item.name || "N/A", itemCol + 10, itemY, { width: 290 })
          .text(item.quantity || 1, qtyCol, itemY, { width: 60, align: "center" })
          .text(`LKR ${(item.price || 0).toFixed(2)}`, priceCol, itemY)
          .font("Helvetica-Bold")
          .text(`LKR ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}`, totalCol, itemY);

        itemY += rowHeight;
      });

      doc.moveTo(itemCol, itemY + 5).lineTo(562, itemY + 5).strokeColor(colors.border).lineWidth(1).stroke();

      // ------------------ Summary ------------------
      const summaryX = 380;
      let summaryY = itemY + 25;

      doc.fontSize(10).font("Helvetica").fillColor(colors.secondary);

      doc.text("Subtotal:", summaryX, summaryY);
      doc.font("Helvetica").fillColor(colors.dark).text(`LKR ${(order.subtotal || 0).toFixed(2)}`, summaryX + 100, summaryY, { align: "right" });

      if (order.discount > 0) {
        summaryY += 20;
        doc.fillColor(colors.accent).text("Discount:", summaryX, summaryY);
        doc.text(`- LKR ${(order.discount || 0).toFixed(2)}`, summaryX + 100, summaryY, { align: "right" });
      }

      summaryY += 25;
      doc.rect(summaryX - 10, summaryY - 8, 192, 30).fill(colors.primary);
      doc.fontSize(12).font("Helvetica-Bold").fillColor("#ffffff").text("TOTAL:", summaryX, summaryY);
      doc.fontSize(14).text(`LKR ${(order.total || 0).toFixed(2)}`, summaryX + 100, summaryY, { align: "right" });

      // ------------------ Footer ------------------
      const footerY = 720;
      doc.rect(0, footerY, 612, 100).fill(colors.light);
      doc.fontSize(11).font("Helvetica-Bold").fillColor(colors.dark).text("Thank you for your business!", 50, footerY + 25, { align: "center", width: 512 });
      doc.fontSize(9).font("Helvetica").fillColor(colors.secondary).text("For support or inquiries, visit our website", 50, footerY + 45, { align: "center", width: 512 });

      if (process.env.FRONTEND_URL) {
        doc.fillColor(colors.primary).text(process.env.FRONTEND_URL, 50, footerY + 60, {
          align: "center",
          width: 512,
          link: process.env.FRONTEND_URL,
          underline: true
        });
      }

      doc.end();

      stream.on("finish", () => resolve(filePath));
      stream.on("error", (err) => reject(err));
    } catch (err) {
      reject(err);
    }
  });
};
