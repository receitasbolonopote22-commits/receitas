"use client";

import { useEffect } from "react";
import { addRecent } from "@/lib/storage";

export default function TrackRecent({ id }: { id: string }) {
  useEffect(() => {
    addRecent(id);
  }, [id]);
  return null;
}
