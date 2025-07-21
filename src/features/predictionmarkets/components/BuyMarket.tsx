import { ReactNode } from "react";
import { useDisclosure } from "@/hooks/use-disclosure";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

interface Props {
  position: "Yes" | "No";
  marketId: string;
  renderTrigger: () => ReactNode;
}

export default function BuyMarket(
  props: Props & ReturnType<typeof useDisclosure>
) {
  const { isOpen, onClose, onOpen, renderTrigger, position, marketId } = props;

  return (
    <Drawer
      modal
      open={isOpen}
      onClose={() => {
        onClose();
      }}
      onOpenChange={(open) => {
        if (open) {
          onOpen();
        } else {
          onClose();
        }
      }}
    >
      <DrawerTrigger asChild>{renderTrigger()}</DrawerTrigger>
      <DrawerContent className="h-[40vh]">
        <DrawerHeader className="hidden">
          <DrawerTitle>Send Crypto</DrawerTitle>
          <DrawerDescription>
            Send crypto to an address or create a Sphere link
          </DrawerDescription>
        </DrawerHeader>

        <div>
          <p>
            Buy {position} for market {marketId}
          </p>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
