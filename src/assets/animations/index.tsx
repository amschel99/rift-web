import { JSX } from "react";
import Lottie from "lottie-react";
import loadinganim from "./all/loading.json";
import loadingaltanim from "./all/loading-alt.json";
import successanim from "./all/success.json";
import warninganim from "./all/error.json";
import notificationanim from "./all/notification.json";
import premiumanim from "./all/premium.json";
import confettianim from "./all/confetti.json";

export interface animationProps {
  width?: string;
  height?: string;
}

export const Loading = ({
  width = "2rem",
  height = "2rem",
}: animationProps): JSX.Element => {
  return (
    <Lottie
      animationData={loadinganim}
      autoPlay
      loop
      className="animation"
      style={{ width, height }}
    />
  );
};

export const LoadingAlt = ({
  width = "2rem",
  height = "2rem",
}: animationProps): JSX.Element => {
  return (
    <Lottie
      animationData={loadingaltanim}
      autoPlay
      loop
      className="animation"
      style={{ width, height }}
    />
  );
};

export const Success = ({
  width = "2rem",
  height = "2rem",
}: animationProps): JSX.Element => {
  return (
    <Lottie
      animationData={successanim}
      autoPlay
      loop={false}
      className="animation"
      style={{ width, height }}
    />
  );
};

export const Error = ({
  width = "2rem",
  height = "2rem",
}: animationProps): JSX.Element => {
  return (
    <Lottie
      animationData={warninganim}
      autoPlay
      loop={false}
      className="animation"
      style={{ width, height }}
    />
  );
};

export const Notification = ({
  width = "2rem",
  height = "2rem",
}: animationProps): JSX.Element => {
  return (
    <Lottie
      animationData={notificationanim}
      autoPlay
      loop
      className="animation"
      style={{ width, height }}
    />
  );
};

export const Premium = ({
  width = "2rem",
  height = "2rem",
}: animationProps): JSX.Element => {
  return (
    <Lottie
      animationData={premiumanim}
      autoPlay
      loop
      className="animation"
      style={{ width, height }}
    />
  );
};

export const Confetti = ({
  width = "2rem",
  height = "2rem",
}: animationProps): JSX.Element => {
  return (
    <Lottie
      animationData={confettianim}
      autoPlay
      loop={false}
      className="animation"
      style={{ width, height }}
    />
  );
};
