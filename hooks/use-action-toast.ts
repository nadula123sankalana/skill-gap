"use client";

import { useEffect, useRef } from "react";
import type { ActionResult } from "@/app/actions/auth";
import { toast } from "@/hooks/use-toast";

/** Fires a toast whenever a server-action ActionResult gets a new message. */
export function useActionToast(state: ActionResult) {
  const last = useRef<string>("");

  useEffect(() => {
    if (!state.message) return;
    const key = `${state.success}:${state.message}`;
    if (key === last.current) return;
    last.current = key;

    toast({
      title: state.success ? "Success" : "Something went wrong",
      description: state.message,
      variant: state.success ? "success" : "destructive",
    });
  }, [state.success, state.message]);
}
