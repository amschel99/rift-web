import { IoMdArrowRoundBack } from "react-icons/io";

function TokenHeader({ title }: { title: string }) {
  return (
    <div className="w-full fixed bg-app-background z-10 h-16 flex flex-row items-center justify-between px-2 ">
      <IoMdArrowRoundBack className="text-2xl text-primary" />
      <h1 className={`text-xl font-bold text-primary`}>{title}</h1>
      <p className=""></p>
    </div>
  );
}

export default TokenHeader;
