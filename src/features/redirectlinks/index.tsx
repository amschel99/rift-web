import { ReactNode, useCallback } from "react";
import { useDisclosure } from "@/hooks/use-disclosure";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import RequestLinkHandler from "./components/RequestLinkHandler";
import CollectLinkHandler from "./components/CollectLinkHandler";

interface Props {
  renderTrigger: () => ReactNode;
  redirectType: "RECEIVE-FROM-COLLECT-LINK" | "SEND-TO-REQUEST-LINK";
  redirectLinkNonceId: string;
}

export default function RedirectLinks(
  props: Props & Partial<ReturnType<typeof useDisclosure>>
) {
  const { renderTrigger, isOpen, onOpen, onClose } = props;

  const renderRedirectLinkHandler = useCallback(() => {
    switch (props.redirectType) {
      case "RECEIVE-FROM-COLLECT-LINK": {
        return (
          <CollectLinkHandler collectLinkNonceId={props.redirectLinkNonceId} />
        );
      }
      case "SEND-TO-REQUEST-LINK": {
        return (
          <RequestLinkHandler requestLinkNonceId={props.redirectLinkNonceId} />
        );
      }
      default: {
        return <></>;
      }
    }
  }, [props.redirectLinkNonceId, props.redirectType]);

  return (
    <Drawer
      modal
      open={isOpen}
      onClose={() => {
        onClose?.();
      }}
      onOpenChange={(open) => {
        if (open) {
          onOpen?.();
        } else {
          onClose?.();
        }
      }}
    >
      <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
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
