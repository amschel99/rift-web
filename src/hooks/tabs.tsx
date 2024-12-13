import { createContext, useContext, useState, ReactNode } from "react";

export type tabsType = "vault" | "market" | "labs" | "security" | "earn";

interface tabsctxtype {
  currTab: tabsType;
  switchtab: (newtab: tabsType) => void;
}

const tabsctx = createContext<tabsctxtype>({} as tabsctxtype);

interface providerProps {
  children: ReactNode;
}

export const TabsProvider = ({ children }: providerProps): JSX.Element => {
  const [currTab, setCurrTab] = useState<tabsType>("vault");

  const switchtab = (newtab: tabsType): void => {
    switch (newtab) {
      case "vault":
        setCurrTab("vault");
        break;
      case "market":
        setCurrTab("market");
        break;
      case "labs":
        setCurrTab("labs");
        break;
      case "security":
        setCurrTab("security");
        break;
      case "earn":
        setCurrTab("earn");
        break;
      default:
        setCurrTab("vault");
    }
  };

  const ctxvalue = {
    currTab,
    switchtab,
  };

  return <tabsctx.Provider value={ctxvalue}>{children}</tabsctx.Provider>;
};

export const useTabs = () => useContext<tabsctxtype>(tabsctx);
