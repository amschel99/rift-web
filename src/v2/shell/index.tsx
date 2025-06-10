import ShellContextProvider from "./shell-context";
import PageContainer from "./page-container";

export default function AppShell() {
  return (
    <ShellContextProvider>
      <div className="w-full max-w-md mx-auto h-screen flex flex-col items-center bg-app-background relative">
        <PageContainer />
      </div>
    </ShellContextProvider>
  );
}
