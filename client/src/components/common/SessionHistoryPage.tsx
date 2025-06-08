"use client";

import React from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/store/store";
import SessionHistory from "../SessionHistory/SessionHistory";
import { UserRole } from "@/types/UserRole";

const SessionHistoryPage: React.FC = () => {
  // Derive userRole from Redux state
  const admin = useSelector((state: RootState) => state.admin.admin);
  const client = useSelector((state: RootState) => state.client.client);
  const trainer = useSelector((state: RootState) => state.trainer.trainer);

  // Determine the role based on which slice is populated
  const userRole: UserRole = admin
    ? "admin"
    : trainer
      ? "trainer"
      : client
        ? "client"
        : "client"; // Fallback to 'client' if no user is logged in (adjust as needed)

  return <SessionHistory role={userRole} />;
};

export default SessionHistoryPage;