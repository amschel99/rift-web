import { useEffect } from "react";
import { useNavigate } from "react-router";
import {
  handleShortcutNavigation,
  updateDynamicShortcuts,
} from "@/utils/pwa-shortcuts";

interface Transaction {
  id: string;
  type: "send" | "receive" | "swap";
  amount: string;
  token: string;
  timestamp: number;
  status: "completed" | "pending" | "failed";
}

export const usePWAShortcuts = () => {
  const navigate = useNavigate();

  // Handle navigation from PWA shortcuts
  useEffect(() => {
    handleShortcutNavigation(navigate);
  }, [navigate]);

  // Function to update recent activities for shortcuts
  const updateRecentActivity = (transaction: Transaction) => {
    try {
      const existingActivities = JSON.parse(
        localStorage.getItem("recent-activities") || "[]"
      );
      const newActivities = [transaction, ...existingActivities]
        .filter(
          (activity, index, self) =>
            index === self.findIndex((a) => a.id === activity.id)
        ) // Remove duplicates
        .slice(0, 10); // Keep only last 10 activities

      updateDynamicShortcuts(newActivities);
    } catch (error) {
      console.error("Error updating recent activities:", error);
    }
  };

  // Function to get recent activities
  const getRecentActivities = (): Transaction[] => {
    try {
      return JSON.parse(localStorage.getItem("recent-activities") || "[]");
    } catch {
      return [];
    }
  };

  return {
    updateRecentActivity,
    getRecentActivities,
  };
};
