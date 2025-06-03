import {
  IError,
  ITokenDetails,
  tokenDetailsData,
} from "@/v2/pages/token/mock/tokenDetailsMockData";
import { useQuery } from "@tanstack/react-query";

export const useTokenDetails = (id: string | undefined) => {
  const {
    data: tokenDetails,
    isLoading: isLoadingTokenDetails,
    error: errorTokenDetails,
  } = useQuery({
    queryKey: ["tokenDetails", id],
    queryFn: () => getTokenDetails(id),
    enabled: !!id,
  });

  return { tokenDetails, isLoadingTokenDetails, errorTokenDetails };
};

async function getTokenDetails(
  id: string | undefined
): Promise<ITokenDetails | IError> {
  if (!id) {
    return {
      status: "error",
      message: "Token ID is required",
    };
  }
  // const response = await fetch(`${HISTORICAL_URL}/details/${id}`);
  // console.log(response);
  return tokenDetailsData;
}
