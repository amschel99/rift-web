import useOwnedTokens from "@/hooks/data/use-owned-tokens";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import RenderToken from "./render-token";
import { WalletToken } from "@/lib/entities";
import { useSwap } from "../swap-context";
import { SUPPORTED_CHAINS } from "@/hooks/data/use-lifi-transfer";

const searchSchema = z.object({
  search: z.string(),
});

type SEARCH_SCHEMA = z.infer<typeof searchSchema>;

interface Props {
  onSelect: (token: { token: string; chain: string }) => void;
}

export default function FromTokenSelect(props: Props) {
  const { onSelect } = props;
  const { state } = useSwap();
  const to_token = state.watch("to_token");
  const to_chain = state.watch("to_chain");
  const form = useForm<SEARCH_SCHEMA>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      search: "",
    },
  });

  const search = form.watch("search");

  const tokensQuery = useOwnedTokens(true);

  // Filter tokens to only show stablecoins on supported chains
  const filteredTokens = tokensQuery?.data?.filter((token) => {
    // Only show tokens on supported chains
    const isSupportedChain = Object.values(SUPPORTED_CHAINS).includes(token.chain_id as "8453" | "137" | "42161" | "80085");
    if (!isSupportedChain) return false;
    
    // Only show stable coins (USDC, USDT)
    const isStablecoin = token.name === "USDC" || token.name === "USDT";
    if (!isStablecoin) return false;
    
    // Don't show the same token that's selected as "to" token
    if (token.id == to_token && token.chain_id == to_chain) return false;
    
    return true;
  });

  const handleTokenSelect = (token: WalletToken) => {
    onSelect({
      token: token.id,
      chain: token.chain_id,
    });
  };

  return (
    <div className="w-full flex flex-col  h-full overflow-y-scroll px-5 py-5 relative ">
      <div className="flex flex-col w-full h-14 bg-app-background fixed top-0 left-0 p-3 mt-1 z-10 border-b-1 border-border">
        <Controller
          control={form.control}
          name="search"
          render={({ field }) => {
            return (
              <div className="flex flex-row items-center justify-between p-2 px-0">
                <input
                  {...field}
                  className="w-full h-full tex-white placeholder:text-muted-foreground outline-none border-none text-sm font-medium text-white"
                  placeholder="Search..."
                />
                <Search className="cursor-pointer text-text-subtle" />
              </div>
            );
          }}
        />
      </div>

      {filteredTokens?.length == 0 && (
        <p className="text-sm text-center text-text-subtle mt-16">
          You do not have any stablecoins on supported chains <br />
          Deposit USDC or USDT to experience cross-chain transfers
        </p>
      )}

      <div className="flex flex-col gap-2 mt-9">
        {filteredTokens
          ?.filter((token) => {
            if (search.trim().length == 0) return true;
            if (token.name.toLowerCase()?.includes(search.toLowerCase().trim()))
              return true;
            if (
              token.description
                .toLowerCase()
                ?.includes(search.toLowerCase().trim())
            )
              return true;
            return false;
          })
          ?.map((token) => {
            return (
              <RenderToken
                key={token.name}
                token={token}
                onPress={handleTokenSelect}
              />
            );
          })}
      </div>
    </div>
  );
}
