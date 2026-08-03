import { collections } from "@/lib/mongodb";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { SeveritySettingsForm } from "./severity-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { severityConfig } = await collections();
  const config = await severityConfig.findOne({});

  return (
    <div>
      <AdminPageHeader
        eyebrow="Thresholds"
        title="Severity settings"
        description="Adjust when a skill gap is classified as green, yellow, or red. Existing gaps are reclassified against the new values immediately."
      />
      <div className="mt-8">
        <SeveritySettingsForm
          greenMaxGap={config?.greenMaxGap ?? 10}
          yellowMaxGap={config?.yellowMaxGap ?? 25}
        />
      </div>
    </div>
  );
}
