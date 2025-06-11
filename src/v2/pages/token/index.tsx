import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router";
import { IoMdArrowRoundBack } from "react-icons/io";
import { FaQrcode, FaRetweet } from "react-icons/fa6";
import { BsSendFill } from "react-icons/bs";
import { CiLink } from "react-icons/ci";
import { colors } from "@/constants";
import PriceContainer from "./features/PriceContainer";
import { PriceChart } from "./features/PriceChart";
import Title from "./components/Title";
import TokenContainer from "./features/TokenContainer";
import TokenDetails from "./features/TokenDetails";
import TokenActivity from "./features/TokenActivity";
import useTokenBalance from "@/hooks/data/use-token-balance";

interface TokenActionItem {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly action?: () => void;
}

const TOKEN_ACTIONS: readonly TokenActionItem[] = [
  {
    icon: <FaQrcode color={colors.textprimary} size={24} />,
    label: "Receive",
  },
  {
    icon: <BsSendFill color={colors.textprimary} size={24} />,
    label: "Send",
  },
  {
    icon: <FaRetweet color={colors.textprimary} size={24} />,
    label: "Swap",
  },
  {
    icon: <CiLink color={colors.textprimary} size={24} />,
    label: "Link",
  },
] as const;

const ErrorFallback: React.FC<{ message: string }> = ({ message }) => (
  <div className="flex justify-center items-center h-screen">
    <p className="text-danger">{message}</p>
  </div>
);

const Token: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: balance } = useTokenBalance({
    token: id as string,
    chain: "1",
  });

  const handleBackClick = () => {
    navigate(-1);
  };

  const tokenId = useMemo(() => id?.toLowerCase(), [id]);

  if (!tokenId) {
    return <ErrorFallback message="Token ID is required" />;
  }

  return (
    <div className="">
      {/* Token Header */}
      <div className="fixed z-10 bg-app-background max-w-lg w-full h-16 flex flex-row items-center justify-between px-2">
        <button
          onClick={handleBackClick}
          className="p-1 rounded-md hover:bg-accent transition-colors"
          aria-label="Go back"
        >
          <IoMdArrowRoundBack className="text-2xl text-primary" />
        </button>
        <h1 className="text-xl font-bold text-primary mx-2">
          {tokenId.toUpperCase()}
        </h1>
      </div>

      <PriceContainer id={id as string} />

      <PriceChart tokenID={tokenId} />

      {/* Token Actions */}
      <div className="flex justify-between mx-2 mt-2 gap-2 select-none">
        {TOKEN_ACTIONS.map((action) => (
          <button
            key={action.label}
            className="w-24 h-24 rounded-lg items-center justify-center bg-accent flex flex-col gap-2 hover:bg-accent/80 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-secondary"
            onClick={action.action}
            aria-label={action.label}
          >
            {action.icon}
            <p className="text-sm font-medium">{action.label}</p>
          </button>
        ))}
      </div>

      <Title title="Your Balance" />
      <TokenContainer tokenID={tokenId} userBalance={balance} />

      <Title title="Token Details" />
      <TokenDetails tokenID={tokenId} />

      <Title title="Activity" />
      <TokenActivity tokenID={tokenId} />
    </div>
  );
};

Token.displayName = "Token";

export default Token;
