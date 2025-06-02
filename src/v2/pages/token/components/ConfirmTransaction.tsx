import React from "react";
import { FaLink } from "react-icons/fa6";
import { IoMdArrowRoundBack } from "react-icons/io";
import { useNavigate } from "react-router";
import { LuScanFace } from "react-icons/lu";

interface ConfirmTransactionProps {
  tokenName: string;
  tokenSymbol: string;
  tokenImageUrl: string;
  value: string;
  toAddress: string;
  exchangeRate: number;
}

function ConfirmTransaction({
  confirmationProps,
}: {
  confirmationProps: ConfirmTransactionProps;
}) {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col w-full h-screen relative px-4">
      <div className="absolute top-0 left-0 w-full h-16 flex flex-row items-center justify-between px-4">
        <IoMdArrowRoundBack
          className="text-2xl text-primary"
          onClick={() => navigate(-1)}
        />
        <h1 className="text-2xl font-bold text-primary">Send</h1>
        <button className="text-primary text-lg"></button>
      </div>
      <div
        className="bg-surface-subtle rounded-3xl justify-center cursor-pointer py-3 px-4 w-full mt-20 flex items-center gap-2"
        onClick={() => navigate(-1)}
      >
        <h1 className="text-text-subtle font-bold text-lg flex items-center gap-2">
          To
        </h1>
        <p className="text-text-subtle text-lg">
          {confirmationProps.toAddress?.substring(0, 7)}...
          {confirmationProps.toAddress.substring(
            confirmationProps.toAddress.length - 7
          )}
        </p>
      </div>
      <h1 className="text-2xl mt-4 text-center font-bold">
        Confirm Transaction
      </h1>
      <div className="flex flex-col items-center mt-8 mb-4 h-1/2 w-full justify-center">
        <div className="text-7xl font-bold text-white mb-2">
          {confirmationProps.value.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{" "}
          {confirmationProps.tokenSymbol}
        </div>
        <div className="text-text-subtle text-xl">
          $
          {confirmationProps.exchangeRate
            .toFixed(2)
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
        </div>
        <div className="flex flex-row justify-between items-center w-full mt-4">
          <h1 className="text-lg text-text-subtle">
            Send {confirmationProps.tokenSymbol}
          </h1>
          <div className="flex gap-2 items-center">
            <img
              src={confirmationProps.tokenImageUrl}
              alt={confirmationProps.tokenSymbol}
              className="w-6 h-6 rounded-full"
            />
            <h1 className="font-bold text-lg">{confirmationProps.value}</h1>
          </div>
        </div>
        <div className="flex flex-row justify-between items-center w-full mt-4">
          <h1 className="text-lg text-text-subtle">Total Value</h1>
          <h1 className="font-bold text-lg">
            $
            {confirmationProps.exchangeRate
              .toFixed(2)
              .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
          </h1>
        </div>
        <div className="flex flex-row justify-between items-center w-full mt-4">
          <h1 className="text-lg text-text-subtle">Network</h1>
          <h1 className="font-bold text-lg">Polygon</h1>
        </div>
        <div className="flex flex-row justify-between items-center w-full mt-4">
          <h1 className="text-lg text-text-subtle">From</h1>
          <h1 className="font-bold text-lg">
            {confirmationProps.toAddress?.substring(0, 7)}...
            {confirmationProps.toAddress.substring(
              confirmationProps.toAddress.length - 7
            )}
          </h1>
        </div>
        <div className="bg-surface-subtle rounded-2xl w-full h-[1px] mt-8"></div>
      </div>
      <div className="flex flex-col items-center justify-center px-4">
        <div className="absolute bottom-1 flex justify-between w-full px-4 gap-4">
          <button className="bg-surface-subtle text-xl rounded-2xl w-1/2 h-14 flex gap-2 items-center justify-center">
            <FaLink className="" />
            Link
          </button>
          <button className="bg-primary text-surface-subtle text-xl rounded-2xl w-1/2 h-14 flex gap-2 items-center justify-center">
            <LuScanFace className="text-2xl text-surface-subtle" />
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmTransaction;
