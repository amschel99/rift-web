import { zodResolver } from "@hookform/resolvers/zod"
import { createContext, ReactNode, useCallback, useContext } from "react"
import { useForm, UseFormReturn } from "react-hook-form"
import { z } from "zod"

const stateSchema = z.object({
    token: z.string().optional(),
    chain: z.string().optional(),
    amount: z.string().optional(),
    hash: z.string().optional(),
    active: z.enum(['select-token', 'address-search', 'amount-input', 'confirm', 'success', 'error']),
}) 

type State = z.infer<typeof stateSchema>

interface FlowContext {
    goToNext:(target?: State['active'])=> void,
    goBack: (target?: State['active']) => void,
    state: UseFormReturn<State> | null
}


const flowContext = createContext<FlowContext>({
    goBack() {
        
    },
    goToNext() {
        
    },
    state: null
})

interface Props {
    children?: ReactNode
    onClose?: ()=> void
}


export default function FlowContextProvider(props: Props){
    const { children, onClose } = props
    const form = useForm<State>({
        resolver: zodResolver(stateSchema),
        defaultValues: {
            active: 'select-token'
        }
    })

    const active = form.watch('active')

    function back (target?: State['active']){
        if(target){
            form.setValue('active', target)
            return 
        }
        switch (active) {
            case "select-token": {
                onClose?.()
                break;
            }
            case "address-search": {
                form.setValue('active', 'select-token')
                break;
            }
            case "amount-input": {
                form.setValue('active', 'address-search')
                break;
            }
            case "confirm": {
                form.setValue("active", "amount-input")
                break;
            }
            case "success": {
                onClose?.()
                break;
            } 
            case "error": {
                form.setValue("active", "confirm")
                break;
            }
        }
    }

    function next(target?: State['active']) {
        if(target){
            form.setValue('active', target)
            return 
        }
        switch (active) {
            case "select-token": {
                form.setValue('active', 'address-search')
                break;
            }
            case "address-search": {
                form.setValue('active', 'amount-input')
                break;
            }
            case "amount-input": {
                form.setValue('active', 'confirm')
                break;
            }
            case "success": {
                onClose?.()
                break;
            } 
            case "error": {
                form.setValue("active", "confirm")
                break;
            }
        }
    }

    return (
        <flowContext.Provider
            value={{
                goBack: back,
                goToNext: next,
                state: form
            }}
        >
            {children}
        </flowContext.Provider>
    )
}


export function useFlow(){
    const context = useContext(flowContext)
    const currentStep = context.state?.watch("active" )
    return {
        ...context,
        currentStep
    }
}