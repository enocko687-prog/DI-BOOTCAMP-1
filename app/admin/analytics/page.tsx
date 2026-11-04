import { StaffAnalytics } from "../../../components/staff-analytics";

export const metadata = {
  title: "Church Analytics | WOFEM Staff",
  robots: { index: false, follow: false },
};

export default function StaffAnalyticsPage() {
  return (
    <main className="min-h-[70vh] bg-cream">
      <StaffAnalytics />
    </main>
  );
}
