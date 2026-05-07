import { ReportsPage } from "./components/reports-page";

export default function UserReportsPage() {
  return (
    <ReportsPage
      reportType="user"
      title="User Reports"
      description="Review reports submitted against users and resolve moderation actions."
    />
  );
}
