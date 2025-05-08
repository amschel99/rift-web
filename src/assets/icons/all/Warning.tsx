import { FC } from "react";
import { iconprops } from "../type";

/**
 * Warning/Triangle with exclamation mark
 * width: number (20)
 * height: number (18)
 * color: string (black)
 */
const Warning: FC<iconprops> = ({ width, height, color }) => (
  <svg
    width={width ?? 20}
    height={height ?? 18}
    viewBox="0 0 20 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M10.8841 0.465701C10.5381 -0.155234 9.46211 -0.155234 9.11612 0.465701L0.116269 16.6062C0.0355595 16.7509 -0.0043634 16.913 0.000378093 17.0767C0.00511959 17.2403 0.0543644 17.4001 0.14333 17.5403C0.232295 17.6806 0.357956 17.7967 0.508108 17.8772C0.658259 17.9577 0.827797 18 1.00025 18H18.9999C19.1724 18.0003 19.342 17.9582 19.4922 17.8778C19.6424 17.7974 19.7681 17.6814 19.8571 17.5411C19.946 17.4008 19.9951 17.241 19.9997 17.0774C20.0042 16.9137 19.964 16.7517 19.8829 16.6072L10.8841 0.465701ZM11.0001 15.1517H9.00012V13.2528H11.0001V15.1517ZM9.00012 11.3539V6.60669H11.0001L11.0011 11.3539H9.00012Z"
      fill={color ?? "black"}
    />
  </svg>
);

export default Warning;
