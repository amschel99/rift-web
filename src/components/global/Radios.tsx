import { CSSProperties, JSX, ReactNode } from "react";
import { Check, Clock, ArrowRight } from "../../assets/icons";
import { colors } from "../../constants";
import "../../styles/components/global/radios.scss";

interface radioProps {
  image: string;
  icon?: ReactNode;
  title: string;
  description: string;
  ischecked: boolean;
  sxstyles?: CSSProperties;
  disabled?: boolean;
  isRadio?: boolean;
  onclick: () => void;
}

export const RadioButton = ({
  image,
  title,
  description,
  ischecked,
  sxstyles,
  disabled,
  isRadio,
  onclick,
}: Partial<radioProps>): JSX.Element => {
  return (
    <div
      id="radio_btn_ctr"
      className={ischecked ? "checked" : disabled ? "disabled" : ""}
      style={sxstyles}
      onClick={onclick}
    >
      <div className="img_title_desc">
        <img src={image} alt="image" />

        <p>
          {title} <span>{description}</span>
        </p>
      </div>

      {isRadio ? (
        <Check color={ischecked ? colors.success : colors.divider} />
      ) : (
        <ArrowRight
          color={disabled ? colors.textsecondary : colors.textprimary}
        />
      )}
    </div>
  );
};

export const RadioButtonWithIcons = ({
  icon,
  title,
  description,
  ischecked,
  sxstyles,
  disabled,
  isRadio,
  onclick,
}: Partial<radioProps>): JSX.Element => {
  return (
    <div
      id="radio_btn_ctr"
      className={ischecked ? "checked" : disabled ? "disabled" : ""}
      style={sxstyles}
      onClick={onclick}
    >
      <div className="img_title_desc">
        <span className="icons">{icon}</span>

        <p>
          {title} <span>{description}</span>
        </p>
      </div>

      {isRadio ? (
        <Check color={ischecked ? colors.success : colors.divider} />
      ) : (
        <ArrowRight color={colors.textprimary} />
      )}
    </div>
  );
};

export const CurrencyPicker = ({
  image,
  title,
  description,
  ischecked,
  sxstyles,
  onclick,
}: Partial<radioProps>): JSX.Element => {
  return (
    <div
      id="currencypicker"
      className={ischecked ? "checked" : ""}
      style={sxstyles}
      onClick={onclick}
    >
      <div className="img_title_desc">
        <img src={image} alt="image" />
        <p>
          {title} <span>{description}</span>
        </p>
      </div>

      <span className="icon">
        <Check color={ischecked ? colors.success : colors.divider} />
      </span>
    </div>
  );
};

export const TimePicker = ({
  title,
  description,
  ischecked,
  sxstyles,
  onclick,
}: Partial<radioProps>): JSX.Element => {
  return (
    <div
      id="currencypicker"
      className={ischecked ? "checked" : ""}
      style={sxstyles}
      onClick={onclick}
    >
      <div className="img_title_desc">
        <Clock color={colors.accent} />

        <p>
          {title} <span>{description}</span>
        </p>
      </div>

      <span className="icon">
        <Check color={ischecked ? colors.success : colors.divider} />
      </span>
    </div>
  );
};
