"use client";

import { createContext, useContext, useMemo, useState, useEffect, useCallback } from "react";
import type { AppBridgeContextValue } from "@max-ai/app-bridge";

export type { AppBridgeContextValue };

export interface AdminContextValue extends AppBridgeContextValue {
  selectedFacilityId: string | null;
  setSelectedFacilityId: (id: string) => void;
}

export const AdminBridgeContext = createContext<AdminContextValue | null>(null);

export function useAdminBridge(): AdminContextValue {
  const ctx = useContext(AdminBridgeContext);
  if (!ctx) {
    throw new Error("useAdminBridge must be used within AdminLayout");
  }
  return ctx;
}

export function useAuthHeaders(): Record<string, string> {
  const { config, selectedFacilityId } = useAdminBridge();
  return useMemo(() => {
    const headers: Record<string, string> = {
      "x-organization-id": config?.organizationId ?? "",
      "Content-Type": "application/json",
    };
    if (selectedFacilityId) {
      headers["x-facility-id"] = selectedFacilityId;
    }
    return headers;
  }, [config?.organizationId, selectedFacilityId]);
}

export function useAdminBridgeState(bridge: AppBridgeContextValue): AdminContextValue {
  const [selectedFacilityId, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (bridge.facilities.length > 0 && !selectedFacilityId) {
      setSelected(bridge.facilities[0].id);
    }
  }, [bridge.facilities, selectedFacilityId]);

  const setSelectedFacilityId = useCallback((id: string) => setSelected(id), []);

  return useMemo(
    () => ({ ...bridge, selectedFacilityId, setSelectedFacilityId }),
    [bridge, selectedFacilityId, setSelectedFacilityId]
  );
}
