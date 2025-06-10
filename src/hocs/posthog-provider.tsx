import { useEffect } from "react";
import { usePlatformDetection } from "../utils/platform";
import { analyticsLog } from "../analytics/events";

export const AnalyticsListener = () => {
  const { isTelegram, telegramUser } = usePlatformDetection();

  useEffect(() => {
    if (isTelegram && telegramUser) {
      analyticsLog("APP_LAUNCH", {
        telegram_id: telegramUser.id?.toString() ?? "NO_USER_IDENTIFIED",
      });
    } else {
      // For browser mode, log without telegram_id
      analyticsLog("APP_LAUNCH", {
        telegram_id: "BROWSER_MODE",
      });
    }
  }, [isTelegram, telegramUser]);

  return <></>;
};
