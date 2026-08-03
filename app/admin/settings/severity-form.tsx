"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { ActionResult } from "@/app/actions/auth";
import { updateSeverityConfig } from "@/app/actions/admin";
import { useActionToast } from "@/hooks/use-action-toast";
import { SeverityBadge } from "@/components/severity-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert } from "@/components/ui/alert";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const initial: ActionResult = { success: false, message: "" };

function Submit() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (
        <>
          <Spinner className="h-4 w-4" />
          Saving…
        </>
      ) : (
        "Save thresholds"
      )}
    </Button>
  );
}

export function SeveritySettingsForm({
  greenMaxGap,
  yellowMaxGap,
}: {
  greenMaxGap: number;
  yellowMaxGap: number;
}) {
  const [state, action] = useFormState(updateSeverityConfig, initial);
  useActionToast(state);

  return (
    <Card className="max-w-lg">
      <CardHeader>
        <CardTitle className="text-lg">Severity thresholds</CardTitle>
        <CardDescription>
          Gap score = benchmark − student score. Classification uses these live
          values — never hardcoded constants.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6 flex flex-wrap gap-2">
          <SeverityBadge severity="GREEN" />
          <span className="font-mono text-xs text-muted self-center">
            gap ≤ green max
          </span>
          <SeverityBadge severity="YELLOW" />
          <span className="font-mono text-xs text-muted self-center">
            ≤ yellow max
          </span>
          <SeverityBadge severity="RED" />
          <span className="font-mono text-xs text-muted self-center">
            above yellow max
          </span>
        </div>

        <form action={action} className="space-y-4">
          {state.message && !state.success && (
            <Alert variant="destructive">{state.message}</Alert>
          )}
          <div className="space-y-1.5">
            <Label htmlFor="greenMaxGap">Green max gap</Label>
            <Input
              id="greenMaxGap"
              name="greenMaxGap"
              type="number"
              min={0}
              max={100}
              step={0.1}
              defaultValue={greenMaxGap}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="yellowMaxGap">Yellow max gap</Label>
            <Input
              id="yellowMaxGap"
              name="yellowMaxGap"
              type="number"
              min={0}
              max={100}
              step={0.1}
              defaultValue={yellowMaxGap}
              required
            />
            {state.errors?.yellowMaxGap?.[0] && (
              <p className="text-xs text-severity-red">
                {state.errors.yellowMaxGap[0]}
              </p>
            )}
          </div>
          <Submit />
        </form>
      </CardContent>
    </Card>
  );
}
