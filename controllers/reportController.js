import ExcelJS from "exceljs";
import Complaint from "../models/Complaint.js";

export const complaintExcelReport = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("createdBy", "name email")
      .populate("resolvedBy", "name email");

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Complaints Report");

    sheet.columns = [
      { header: "Title", key: "title", width: 25 },
      { header: "Category", key: "category", width: 15 },
      { header: "Priority", key: "priority", width: 12 },
      { header: "Floor", key: "floor", width: 15 },
      { header: "Location", key: "location", width: 20 },
      { header: "Created At", key: "createdAt", width: 20 },
      { header: "In-Progress At", key: "inProgressAt", width: 20 },
      { header: "Resolved At", key: "resolvedAt", width: 20 },
      { header: "Created By", key: "createdBy", width: 20 },
      { header: "Resolved By", key: "resolvedBy", width: 20 },
      { header: "Status", key: "status", width: 15 },
    ];

    complaints.forEach((c) => {
      const inProgress = c.history.find(h => h.status === "in-progress");
      const resolved = c.history.find(h => h.status === "resolved");

      sheet.addRow({
        title: c.title,
        category: c.category,
        priority: c.priority,
        floor: c.floor,
        location: c.location,
        createdAt: c.createdAt,
        inProgressAt: inProgress?.createdAt || "-",
        resolvedAt: resolved?.createdAt || "-",
        createdBy: c.createdBy?.name,
        resolvedBy: c.resolvedBy?.name || "-",
        status: c.status,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=complaints-report.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ message: "Failed to generate report", error });
  }
};
