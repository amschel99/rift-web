import { ReactNode } from "react";

interface ActionButtonProps {
  icon: ReactNode;
  onclick?: () => void;
}

export function ActionButton({ icon, onclick }: ActionButtonProps) {
  return (
    <button
      onClick={onclick}
      className="flex flex-col items-center justify-center bg-[rgba(44,44,46,0.5)] border-1 border-[rgba(255,255,255,0.1)] p-4 rounded-xl"
    >
      <div className="text-purple-400">{icon}</div>
    </button>
  );
}
