import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { useDisclosure } from "@/hooks/use-disclosure"
import { Slot } from "@radix-ui/react-slot"
import { ReactNode, useCallback, useState } from "react"
import FlowContextProvider, { useFlow } from "./flow-context"
import { SelectToken } from "./select-token"

interface Props {
    renderTrigger: ()=> ReactNode
}

const snapPoints: (string | number)[] = [1, '800px', '300px']

export default function SendToKnown(props: Props){
    const { renderTrigger } = props
    const { isOpen, onOpen, onClose, toggle } = useDisclosure()
    const [activeSnapPoint, setActiveSnapPoint] = useState(snapPoints[0])

    return (
        <FlowContextProvider onClose={onClose} >
            <Drawer modal open={isOpen} onClose={onClose} onOpenChange={(open)=>{
                if(open){
                    onOpen()
                }else{
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
                        <SendToKnownLayout/>
                    </div>
                </DrawerContent>
            </Drawer>
        </FlowContextProvider>
    )
}


function SendToKnownLayout(){
    const { currentStep } = useFlow()

    const renderStep = useCallback(()=> {
        switch (currentStep) {
            case "select-token": {
                return <SelectToken/>
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