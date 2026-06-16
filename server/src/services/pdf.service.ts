import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";

export const generatePrescriptionPDF = async (data: {
  prescriptionId: string;
  doctorName: string;
  doctorSpecialty: string;
  patientName: string;
  date: string;
  diagnosis: string;
  medicines: {
    name: string;
    dosage: string;
    frequency: string;
    duration: string;
    notes?: string;
  }[];
  instructions: string;
  followUpDate?: string;
}): Promise<string> => {
  const dir = path.join(process.cwd(), "uploads", "prescriptions");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = `prescription_${data.prescriptionId}.pdf`;
  const filePath = path.join(dir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    const pageWidth = doc.page.width;
    const contentWidth = pageWidth - 100;

    // ── Header ────────────────────────────────────────────────
    doc.rect(0, 0, pageWidth, 90).fill("#2563eb");

    doc
      .fillColor("white")
      .fontSize(20)
      .font("Helvetica-Bold")
      .text("HealthCare Platform", 50, 22); // ✅ no emoji

    doc
      .fontSize(11)
      .font("Helvetica")
      .fillColor("rgba(255,255,255,0.85)")
      .text("E-Prescription", 50, 50);

    doc
      .fontSize(10)
      .text(`Date: ${data.date}`, 50, 67);

    // ✅ prescription ID on right
    doc
      .fontSize(9)
      .text(`Ref: ${data.prescriptionId.slice(-8).toUpperCase()}`, 400, 67, {
        width: 145,
        align: "right",
      });

    // ── Doctor Info ───────────────────────────────────────────
    let y = 115;

    doc
      .fillColor("#1e293b")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("DOCTOR INFORMATION", 50, y);

    y += 18;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#2563eb").lineWidth(1.5).stroke();
    y += 10;

    doc
      .fillColor("#1e293b")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Dr. ${data.doctorName}`, 50, y);

    y += 16;
    doc
      .fillColor("#475569")
      .fontSize(10)
      .font("Helvetica")
      .text(`Specialty: ${data.doctorSpecialty}`, 50, y);

    // ── Patient Info ──────────────────────────────────────────
    y += 35;

    doc
      .fillColor("#1e293b")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("PATIENT INFORMATION", 50, y);

    y += 18;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#2563eb").lineWidth(1.5).stroke();
    y += 10;

    doc
      .fillColor("#1e293b")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Name: ${data.patientName}`, 50, y);

    // ── Diagnosis ─────────────────────────────────────────────
    y += 35;

    doc
      .fillColor("#1e293b")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("DIAGNOSIS", 50, y);

    y += 18;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#2563eb").lineWidth(1.5).stroke();
    y += 10;

    // diagnosis box
    const diagHeight = 36;
    doc.rect(50, y, contentWidth, diagHeight).fill("#eff6ff");
    doc
      .fillColor("#1e40af")
      .fontSize(11)
      .font("Helvetica")
      .text(data.diagnosis, 60, y + 12, { width: contentWidth - 20 });

    // ── Medicines ─────────────────────────────────────────────
    y += diagHeight + 25;

    doc
      .fillColor("#1e293b")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text("PRESCRIBED MEDICINES", 50, y);

    y += 18;
    doc.moveTo(50, y).lineTo(545, y).strokeColor("#2563eb").lineWidth(1.5).stroke();
    y += 10;

    data.medicines.forEach((med, index) => {
      const rowHeight = med.notes ? 68 : 52;
      const bgColor = index % 2 === 0 ? "#f8fafc" : "#ffffff";

      doc.rect(50, y, contentWidth, rowHeight).fill(bgColor);

      // left accent bar
      doc.rect(50, y, 4, rowHeight).fill("#2563eb");

      doc
        .fillColor("#1e293b")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`${index + 1}.  ${med.name}`, 64, y + 10);

      doc
        .fillColor("#475569")
        .fontSize(10)
        .font("Helvetica")
        .text(
          `Dosage: ${med.dosage}     Frequency: ${med.frequency}     Duration: ${med.duration}`,
          64,
          y + 28
        );

      if (med.notes) {
        doc
          .fillColor("#64748b")
          .fontSize(9)
          .font("Helvetica")
          .text(`Note: ${med.notes}`, 64, y + 46);
      }

      y += rowHeight + 6;
    });

    // ── Instructions ──────────────────────────────────────────
    if (data.instructions) {
      y += 10;

      doc
        .fillColor("#1e293b")
        .fontSize(12)
        .font("Helvetica-Bold")
        .text("INSTRUCTIONS", 50, y);

      y += 18;
      doc.moveTo(50, y).lineTo(545, y).strokeColor("#2563eb").lineWidth(1.5).stroke();
      y += 10;

      const instructionLines = doc.heightOfString(data.instructions, { width: contentWidth });
      doc.rect(50, y, contentWidth, instructionLines + 20).fill("#f8fafc");

      doc
        .fillColor("#475569")
        .fontSize(10)
        .font("Helvetica")
        .text(data.instructions, 60, y + 10, { width: contentWidth - 20 });

      y += instructionLines + 30;
    }

    // ── Follow Up ─────────────────────────────────────────────
    if (data.followUpDate) {
      y += 5;
      doc.rect(50, y, contentWidth, 38).fill("#fef3c7");

      doc
        .fillColor("#92400e")
        .fontSize(11)
        .font("Helvetica-Bold")
        .text(`Follow-up Date: ${data.followUpDate}`, 60, y + 12);

      y += 50;
    }

    // ── Signature line ────────────────────────────────────────
    y += 20;
    doc
      .moveTo(350, y)
      .lineTo(545, y)
      .strokeColor("#94a3b8")
      .lineWidth(1)
      .stroke();

    doc
      .fillColor("#64748b")
      .fontSize(9)
      .font("Helvetica")
      .text(`Dr. ${data.doctorName}`, 350, y + 5, { width: 195, align: "center" })
      .text(data.doctorSpecialty, 350, y + 18, { width: 195, align: "center" });

    // ── Footer ────────────────────────────────────────────────
    const footerY = doc.page.height - 50;
    doc.rect(0, footerY, pageWidth, 50).fill("#f1f5f9");

    doc
      .moveTo(0, footerY)
      .lineTo(pageWidth, footerY)
      .strokeColor("#e2e8f0")
      .lineWidth(1)
      .stroke();

    doc
      .fillColor("#94a3b8")
      .fontSize(8)
      .font("Helvetica")
      .text(
        "This is a digitally generated e-prescription from HealthCare Platform. Valid only with doctor verification.",
        50,
        footerY + 10,
        { align: "center", width: pageWidth - 100 }
      );

    doc
      .text(
        `Generated on: ${data.date}`,
        50,
        footerY + 26,
        { align: "center", width: pageWidth - 100 }
      );

    doc.end();

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
  });
};