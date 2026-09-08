import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { formatMoney } from "../money";
import { BUDGET_LEVEL_LABEL } from "../budget";
import type { ReportResult } from "../reports";

const styles = StyleSheet.create({
  page: { padding: 32, fontSize: 9, color: "#0f172a" },
  title: { fontSize: 16, fontWeight: 700, marginBottom: 4 },
  meta: { fontSize: 9, color: "#64748b", marginBottom: 2 },
  section: { marginTop: 16, fontSize: 11, fontWeight: 700, marginBottom: 6 },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingVertical: 4,
  },
  headRow: {
    flexDirection: "row",
    backgroundColor: "#eef2ff",
    paddingVertical: 5,
    paddingHorizontal: 2,
  },
  cell: { paddingHorizontal: 2 },
  date: { width: "14%" },
  company: { width: "20%" },
  employee: { width: "20%" },
  desc: { width: "30%" },
  amount: { width: "16%", textAlign: "right" },
  bold: { fontWeight: 700 },
  totalRow: { flexDirection: "row", paddingVertical: 6, marginTop: 4 },
});

function ReportDocument({ report }: { report: ReportResult }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{report.title}</Text>
        <Text style={styles.meta}>Period: {report.rangeLabel}</Text>
        <Text style={styles.meta}>
          Generated: {format(report.generatedAt, "PPpp")}
        </Text>

        <Text style={styles.section}>Purchases ({report.count})</Text>
        <View style={styles.headRow}>
          <Text style={[styles.cell, styles.date, styles.bold]}>Date</Text>
          <Text style={[styles.cell, styles.company, styles.bold]}>Company</Text>
          <Text style={[styles.cell, styles.employee, styles.bold]}>Employee</Text>
          <Text style={[styles.cell, styles.desc, styles.bold]}>Description</Text>
          <Text style={[styles.cell, styles.amount, styles.bold]}>Amount</Text>
        </View>
        {report.rows.map((r, i) => (
          <View style={styles.row} key={i} wrap={false}>
            <Text style={[styles.cell, styles.date]}>
              {format(r.date, "yyyy-MM-dd")}
            </Text>
            <Text style={[styles.cell, styles.company]}>{r.company}</Text>
            <Text style={[styles.cell, styles.employee]}>{r.employee}</Text>
            <Text style={[styles.cell, styles.desc]}>{r.description}</Text>
            <Text style={[styles.cell, styles.amount]}>
              {formatMoney(r.amount)}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={[styles.cell, styles.desc, styles.bold]}>Total</Text>
          <Text style={[styles.cell, styles.amount, styles.bold]}>
            {formatMoney(report.total)}
          </Text>
        </View>

        <Text style={styles.section}>Budget summary (annual)</Text>
        <View style={styles.headRow}>
          <Text style={[styles.cell, styles.employee, styles.bold]}>Employee</Text>
          <Text style={[styles.cell, styles.company, styles.bold]}>Company</Text>
          <Text style={[styles.cell, styles.amount, styles.bold]}>Budget</Text>
          <Text style={[styles.cell, styles.amount, styles.bold]}>Spent</Text>
          <Text style={[styles.cell, styles.amount, styles.bold]}>Status</Text>
        </View>
        {report.employeeSummaries.map((s, i) => (
          <View style={styles.row} key={i} wrap={false}>
            <Text style={[styles.cell, styles.employee]}>{s.employee}</Text>
            <Text style={[styles.cell, styles.company]}>{s.company}</Text>
            <Text style={[styles.cell, styles.amount]}>
              {formatMoney(s.status.budget)}
            </Text>
            <Text style={[styles.cell, styles.amount]}>
              {formatMoney(s.status.spent)}
            </Text>
            <Text style={[styles.cell, styles.amount]}>
              {BUDGET_LEVEL_LABEL[s.status.level]} ({s.status.percent}%)
            </Text>
          </View>
        ))}
      </Page>
    </Document>
  );
}

export async function reportToPdf(report: ReportResult): Promise<Buffer> {
  return renderToBuffer(<ReportDocument report={report} />);
}
