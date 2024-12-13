import { useState } from "react";
import { BottomNavigation, BottomNavigationAction } from "@mui/material";
import { useTabs } from "../hooks/tabs";
import { Vault, Market, Labs, Security, Earn } from "../assets/icons";
import { colors } from "../constants";

export const BottomTabNavigation = () => {
  const { currTab, switchtab } = useTabs();

  const [value, setValue] = useState(0);

  return (
    <BottomNavigation
      value={value}
      onChange={(_event, newValue) => setValue(newValue)}
      showLabels
      sx={{
        backgroundColor: colors.primary,
        color: "#ffffff",
        position: "fixed",
        bottom: 0,
        left: 0,
        borderTop: `1px solid ${colors.divider}`,
      }}
    >
      <BottomNavigationAction
        onClick={() => {
          switchtab("vault");
        }}
        label="Vault"
        icon={
          <Vault
            color={currTab == "vault" ? colors.accent : colors.textprimary}
          />
        }
        sx={{ color: colors.textprimary, gap: "0.25rem" }}
        disableTouchRipple
      />

      <BottomNavigationAction
        onClick={() => {
          switchtab("market");
        }}
        label="Market"
        icon={
          <Market
            color={currTab == "market" ? colors.accent : colors.textprimary}
          />
        }
        sx={{ color: colors.textprimary, gap: "0.25rem" }}
        disableTouchRipple
      />

      <BottomNavigationAction
        onClick={() => {
          switchtab("labs");
        }}
        label="Labs"
        icon={
          <Labs
            color={currTab == "labs" ? colors.accent : colors.textprimary}
          />
        }
        sx={{ color: colors.textprimary, gap: "0.25rem" }}
        disableTouchRipple
      />

      <BottomNavigationAction
        onClick={() => {
          switchtab("security");
        }}
        label="Security"
        icon={
          <Security
            color={currTab == "security" ? colors.accent : colors.textprimary}
          />
        }
        sx={{ color: colors.textprimary, gap: "0.25rem" }}
        disableTouchRipple
      />

      <BottomNavigationAction
        onClick={() => {
          switchtab("earn");
        }}
        label="Earn"
        icon={
          <Earn
            color={currTab == "earn" ? colors.accent : colors.textprimary}
          />
        }
        sx={{ color: colors.textprimary, gap: "0.25rem" }}
        disableTouchRipple
      />
    </BottomNavigation>
  );
};
