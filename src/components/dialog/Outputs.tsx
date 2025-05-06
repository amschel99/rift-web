import { JSX } from "react";
import { useAppDialog } from "../../hooks/dialog";
import { SubmitButton } from "../global/Buttons";
import { Loading, Error } from "../../assets/animations";
import "../../styles/components/dialog.scss";

export const LoadingOutput = (): JSX.Element => {
  const { dialogMessage } = useAppDialog();

  return (
    <div className="outputs">
      <Loading width="3.75rem" height="3.75rem" />
      <p>{dialogMessage}</p>
    </div>
  );
};

export const ErrorOutput = (): JSX.Element => {
  const { closeAppDialog, dialogMessage } = useAppDialog();

  return (
    <div className="outputs errroutput">
      <Error width="6rem" height="6rem" />
      <p>{dialogMessage}</p>

      <SubmitButton text="Ok, Close" onclick={closeAppDialog} />
    </div>
  );
};
