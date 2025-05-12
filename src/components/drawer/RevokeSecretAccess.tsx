import { JSX } from "react";
import { useQueryClient, useMutation } from "@tanstack/react-query";
import { revokeKeyAccess } from "../../utils/api/keys";
import { useAppDrawer } from "../../hooks/drawer";
import { useSnackbar } from "../../hooks/snackbar";
import { Trash } from "../../assets/icons";
import { colors } from "../../constants";
import "../../styles/components/drawer/revokesecret.scss";
import { Loading } from "../../assets/animations";

export const RevokeSecretAccess = (): JSX.Element => {
  const queryclient = useQueryClient();
  const { showsuccesssnack, showerrorsnack } = useSnackbar();
  const { closeAppDrawer, keyToshare, secretPurpose } = useAppDrawer();

  const { mutate: onRevoke, isPending } = useMutation({
    mutationFn: () =>
      revokeKeyAccess(keyToshare as string)
        .then(() => {
          showsuccesssnack("Access revoked successfully");

          queryclient
            .invalidateQueries({ queryKey: ["mylentkeys"] })
            .then(() => {
              closeAppDrawer();
            });
        })
        .catch(() => {
          showerrorsnack("Failed to revoke access, please try again");
          closeAppDrawer();
        }),
  });

  return (
    <div className="revokesecretaccess">
      <p>
        Are you sure you want to revoke access to your {secretPurpose} key ?
        <span>The receipient will not be able to use it again</span>
      </p>

      <button disabled={isPending} onClick={() => onRevoke()}>
        {isPending ? (
          <Loading width="1.25rem" height="1.25rem" />
        ) : (
          <>
            Yes, Revoke Access <Trash color={colors.textprimary} />
          </>
        )}
      </button>
    </div>
  );
};
