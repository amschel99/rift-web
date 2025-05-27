import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useDisclosure } from "@/hooks/use-disclosure"
import { Slot } from "@radix-ui/react-slot"
import { ReactNode, useCallback, useState } from "react"
import FlowContextProvider, { useFlow } from "./flow-context"
import { SelectToken } from "./select-token"
import AddressSearch from "./address-search"

interface Props {
    renderTrigger: () => ReactNode
}

export default function SendToKnown(props: Props) {

    return (
        <FlowContextProvider>
            <_SendToKnown {...props} />
        </FlowContextProvider>
    )
}

function _SendToKnown(props: Props) {
    const { state } = useFlow()
    const { renderTrigger } = props
    const { isOpen, onOpen, onClose, toggle } = useDisclosure()

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
        switch (currentStep) {
            case "select-token": {
                return <SelectToken />
            }
            case "address-search": {
                return <AddressSearch />
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