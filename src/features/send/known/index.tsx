import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useDisclosure } from "@/hooks/use-disclosure"
import { Slot } from "@radix-ui/react-slot"
import { ReactNode, useCallback, useState } from "react"
import FlowContextProvider, { useFlow } from "./flow-context"
import { SelectToken } from "./select-token"
import AddressSearch from "./address-search"
import AmountInput from "../components/amount-input"
import ConfirmTransaction from "./confirm-transaction"
import Processing from "./processing"

interface Props {
    renderTrigger: () => ReactNode
}

export default function SendToKnown(props: Props) {
    const disclosure = useDisclosure()

    return (
        <FlowContextProvider onClose={disclosure.onClose} >
            <_SendToKnown {...props} {...disclosure} />
        </FlowContextProvider>
    )
}

function _SendToKnown(props: Props & ReturnType<typeof useDisclosure>) {
    const { state } = useFlow()
    const { renderTrigger, isOpen, onOpen, onClose, toggle } = props

    return (
        <Drawer modal open={isOpen} onClose={() => {
            onClose()
            state?.reset()
        }} onOpenChange={(open) => {
            if (open) {
                onOpen()
            } else {
                    onClose()
                }
            }}  >
            <DrawerTrigger>
                <div>
                    {renderTrigger()}
                </div>
            </DrawerTrigger>
            <DrawerContent className="h-[95vh]" >
                <DrawerHeader>
                    <div className="flex flex-row items-center justify-between" >
                        <DrawerTitle>
                            <p>
                                Send
                            </p>
                        </DrawerTitle>
                    </div>
                </DrawerHeader>
                <div className="flex flex-col w-full h-full items-center " >
                    <SendToKnownLayout />
                </div>
            </DrawerContent>
        </Drawer>
    )
}


function SendToKnownLayout() {
    const { currentStep } = useFlow()

    const renderStep = useCallback(() => {
        // TODO: add framer motion animation for screen motion fluidity
        switch (currentStep) {
            case "select-token": {
                return <SelectToken />
            }
            case "address-search": {
                return <AddressSearch />
            }
            case "amount-input": {
                return <AmountInput />
            }
            case "confirm": {
                return <ConfirmTransaction />
            }
            case "processing": {
                return <Processing />
            }
            default: {
                return (
                    <div>

                    </div>
                )
            }
        }
    }, [currentStep])

    return (
        <div className="w-full flex flex-col h-full" >
            {renderStep()}
        </div>
    )
}