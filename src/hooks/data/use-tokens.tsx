import { WALLET_TOKENS } from "@/lib/tokens"
import { useQuery } from "@tanstack/react-query"


interface TokenArgs {
    chain?: string
}

async function getTokens(args: TokenArgs){
    // TODO: Make request to the backend for tokens

    return WALLET_TOKENS
}


export default function useTokens(args: TokenArgs){
    
    const query = useQuery({
        queryKey: ['get-tokens', args.chain],
        queryFn: async () => {
            return getTokens(args)
        }
    })


    return query
}


