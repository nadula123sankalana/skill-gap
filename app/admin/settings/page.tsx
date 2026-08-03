import { collections } from "@/lib/mongodb";
import { SeveritySettingsForm } from "./severity-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const { severityConfig } = await collections();
  const config = await severityConfig.findOne({});

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold tracking-tight">
        Severity settings
      </h1>
      <p className="mt-2 text-muted">
        Adjust when a skill gap is classified as green, yellow, or red.
      </p>
      <div className="mt-8">
        <SeveritySettingsForm
          greenMaxGap={config?.greenMaxGap ?? 10}
          yellowMaxGap={config?.yellowMaxGap ?? 25}
        />
      </div>
    </div>
  );
}
