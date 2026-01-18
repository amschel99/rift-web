import { Fragment, ReactNode } from "react";
import { Controller, ControllerRenderProps } from "react-hook-form";
import { GoHomeFill, GoHome } from "react-icons/go";
import { IoSettingsOutline, IoSettings, IoSparklesOutline, IoSparkles } from "react-icons/io5";
import { useShellContext } from "../shell-context";
import { cn } from "@/lib/utils";

type TSchema = {
  tab?: "home" | "invest" | "profile";
};

interface Tab {
  name: string;
  render: (
    field: ControllerRenderProps<TSchema, "tab">,
    active: boolean
  ) => ReactNode;
}

export default function BottomTabs() {
  const { form } = useShellContext();

  const tabs: Array<Tab> = [
    {
      name: "home",
      render(field, active) {
        return (
          <button
            id="tab-home"
            onClick={() => field.onChange("home")}
            className="flex flex-col items-center justify-center cursor-pointer transition-all duration-200 px-6 py-2 gap-1 active:scale-95"
          >
            {active ? (
              <GoHomeFill className="text-xl text-accent-primary" />
            ) : (
              <GoHome className="text-xl text-text-subtle" />
            )}
            <span className={cn(
              "text-[11px] font-medium",
              active ? "text-accent-primary" : "text-text-subtle"
            )}>
              Home
            </span>
          </button>
        );
      },
    },
    {
      name: "invest",
      render(field, active) {
        return (
          <button
            id="tab-earn"
            onClick={() => field.onChange("invest")}
            className="flex flex-col items-center justify-center cursor-pointer transition-all duration-200 px-6 py-2 gap-1 active:scale-95"
          >
            {active ? (
              <IoSparkles className="text-xl text-accent-primary" />
            ) : (
              <IoSparklesOutline className="text-xl text-text-subtle" />
            )}
            <span className={cn(
              "text-[11px] font-medium",
              active ? "text-accent-primary" : "text-text-subtle"
            )}>
              Earn
            </span>
          </button>
        );
      },
    },
    {
      name: "profile",
      render(field, active) {
        return (
          <button
            id="tab-settings"
            onClick={() => field.onChange("profile")}
            className="flex flex-col items-center justify-center cursor-pointer transition-all duration-200 px-6 py-2 gap-1 active:scale-95"
          >
            {active ? (
              <IoSettings className="text-xl text-accent-primary" />
            ) : (
              <IoSettingsOutline className="text-xl text-text-subtle" />
            )}
            <span className={cn(
              "text-[11px] font-medium",
              active ? "text-accent-primary" : "text-text-subtle"
            )}>
              Settings
            </span>
          </button>
        );
      },
    },
  ];

  if (!form) {
    return <div></div>;
  }

  return (
    <div className="w-full h-18 bg-surface-alt/95 backdrop-blur-md border-t border-surface-subtle shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <Controller
        control={form.control}
        name="tab"
        render={({ field }) => {
          return (
            <div className="w-full h-full max-w-md mx-auto px-4 flex flex-row items-center justify-around">
              {tabs.map((tab, idx) => {
                return (
                  <Fragment key={tab.name + idx}>
                    {tab.render(field, field.value == tab.name)}
                  </Fragment>
                );
              })}
            </div>
          );
        }}
      />
    </div>
  );
}
