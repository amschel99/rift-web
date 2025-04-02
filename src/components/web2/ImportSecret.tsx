import { JSX, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  faCirclePlus,
  faShield,
  faMoneyBillTransfer,
  faLayerGroup,
  faLock,
  faKey,
} from "@fortawesome/free-solid-svg-icons";
import { useSnackbar } from "../../hooks/snackbar";
import { importKey } from "../../utils/api/keys";
import { FaIcon } from "../../assets/faicon";
import { colors } from "../../constants";

import openai from "../../assets/images/openai-alt.png";
import airwlx from "../../assets/images/awx.png";
import polymarket from "../../assets/images/icons/polymarket-lalt.png";
import "../../styles/components/web2/impportsecret.scss";

interface ImportSecretProps {
  onClose?: () => void;
}

export const ImportSecret = ({ onClose }: ImportSecretProps): JSX.Element => {
  const queryclient = useQueryClient();
  const { showsuccesssnack, showerrorsnack } = useSnackbar();

  const [importedKey, setImportedKey] = useState<string>("");
  const [keyUtil, setkeyUtil] = useState<"OPENAI" | "AIRWALLEX" | "POLYMARKET">(
    "OPENAI"
  );
  const [processing, setProcessing] = useState<boolean>(false);

  const onImportKey = async () => {
    if (importedKey == "") {
      showerrorsnack("Enter the API key to import");
    } else {
      setProcessing(true);

      const { isOk } = await importKey(importedKey, keyUtil);

      if (isOk) {
        setImportedKey("");
        showsuccesssnack("Your API key was imported successfully");
        queryclient.invalidateQueries({ queryKey: ["secrets"] });
        onClose?.();
      } else {
        showerrorsnack("An unexpected error occurred");
      }
      setProcessing(false);
    }
  };

  return (
    <div id="importkey">
      <div className="benefits-section">
        <div className="benefit-item">
          <div className="benefit-icon">
            <FaIcon faIcon={faShield} color={colors.primary} fontsize={14} />
          </div>
          <div className="benefit-text">
            <h4>Decentralized Security</h4>
            <p>
              Your keys are encrypted and distributed across our network using
              Shamir secret sharing.
            </p>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">
            <FaIcon
              faIcon={faMoneyBillTransfer}
              color={colors.primary}
              fontsize={14}
            />
          </div>
          <div className="benefit-text">
            <h4>Monetize Idle Keys</h4>
            <p>
              Earn income by lending your API keys to others without revealing
              the actual key. They get permission-based access to the service,
              not your credentials.
            </p>
          </div>
        </div>

        <div className="benefit-item">
          <div className="benefit-icon">
            <FaIcon
              faIcon={faLayerGroup}
              color={colors.primary}
              fontsize={14}
            />
          </div>
          <div className="benefit-text">
            <h4>DeFi Collateral</h4>
            <p>Use API keys as collateral for loans and other DeFi services.</p>
          </div>
        </div>
      </div>

      <div className="key-input">
        <label>
          <span className="label-icon">
            <FaIcon faIcon={faKey} color={colors.primary} fontsize={12} />
          </span>
          API Key
        </label>
        <input
          type="text"
          placeholder="Enter your API key"
          value={importedKey}
          onChange={(e) => setImportedKey(e.target.value)}
        />
      </div>

      <div className="keyutil">
        <p className="_secret_utils">
          <span className="label-icon">
            <FaIcon faIcon={faLock} color={colors.primary} fontsize={12} />
          </span>
          Select your API key type
        </p>

        <div
          className="util"
          style={{ backgroundImage: `url(${openai})` }}
          onClick={() => setkeyUtil("OPENAI")}
        >
          <div className={`radioctr ${keyUtil === "OPENAI" ? "selected" : ""}`}>
            <div />
          </div>

          <p className="purpose">
            OpenAI Key
            <span>Access GPT-4, ChatGPT and other AI models</span>
          </p>
        </div>

        <div
          className="util"
          style={{ backgroundImage: `url(${polymarket})` }}
          onClick={() => setkeyUtil("POLYMARKET")}
        >
          <div
            className={`radioctr ${keyUtil === "POLYMARKET" ? "selected" : ""}`}
          >
            <div />
          </div>

          <p className="purpose">
            Polymarket API
            <span>Access prediction markets and trading</span>
          </p>
        </div>

        <div
          className="util"
          style={{ backgroundImage: `url(${airwlx})` }}
          onClick={() => setkeyUtil("AIRWALLEX")}
        >
          <div
            className={`radioctr ${keyUtil === "AIRWALLEX" ? "selected" : ""}`}
          >
            <div />
          </div>

          <p className="purpose">
            AirWallex Key
            <span>Access banking and payment services</span>
          </p>
        </div>
      </div>

      <div className="import-footer">
        <p className="security-note">
          <span className="label-icon">
            <FaIcon faIcon={faShield} color={colors.primary} fontsize={12} />
          </span>
          Your API key is securely distributed across our decentralized network.
        </p>
        <button
          className="submit-button"
          disabled={importedKey == "" || processing}
          onClick={onImportKey}
        >
          <span className="button-icon">
            <FaIcon
              faIcon={faCirclePlus}
              color={
                importedKey == "" || processing
                  ? colors.textsecondary
                  : colors.textprimary
              }
              fontsize={14}
            />
          </span>
          {processing ? "Importing..." : "Import API Key"}
        </button>
      </div>
    </div>
  );
};
