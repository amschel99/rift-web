import { useCallback } from "react";
import { useDisclosure } from "@/hooks/use-disclosure";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import RequestLinkHandler from "./components/RequestLinkHandler";
import CollectLinkHandler from "./components/CollectLinkHandler";

interface Props {
  redirectType: "RECEIVE-FROM-COLLECT-LINK" | "SEND-TO-REQUEST-LINK";
}

export default function RedirectLinks(
  props: Props & Partial<ReturnType<typeof useDisclosure>>
) {
  const { isOpen, onOpen, onClose, toggle } = props;

  const onDismissDrawer = () => {
    console.log("closing drawer");
    onClose?.();
    toggle?.();
    localStorage.removeItem("collectobject");
    localStorage.removeItem("requestobject");
  };

  const renderRedirectLinkHandler = useCallback(() => {
    switch (props.redirectType) {
      case "RECEIVE-FROM-COLLECT-LINK": {
        return <CollectLinkHandler onDismissDrawer={onDismissDrawer} />;
      }
      case "SEND-TO-REQUEST-LINK": {
        return <RequestLinkHandler onDismissDrawer={onDismissDrawer} />;
      }
      default: {
        return <></>;
      }
    }
  }, [isOpen]);

  return (
    <Drawer
      modal
      open={isOpen}
      onClose={() => onDismissDrawer()}
      onOpenChange={(open) => {
        if (open) {
          onOpen?.();
        } else {
          onDismissDrawer();
        }
      }}
    >
      <DrawerContent className="min-h-[45vh]">
        <DrawerHeader>
          <DrawerTitle className="hidden">Sphere Links</DrawerTitle>
          <DrawerDescription className="hidden">
            Send or Request funds with a Sphere link
          </DrawerDescription>
        </DrawerHeader>

        <div className="w-full h-full p-4">{renderRedirectLinkHandler()}</div>
      </DrawerContent>
    </Drawer>
  );
}
