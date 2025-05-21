import { FC } from "react";
import { iconprops } from "../type";

/**
 * Gas off
 * width: number (22)
 * height: number (22)
 * color: string (black)
 */
const Gas: FC<iconprops> = ({ width, height, color }) => (
  <svg
    width={width ?? 22}
    height={height ?? 22}
    viewBox="0 0 22 22"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.3333 9.88886C14.9227 9.88886 15.4879 10.123 15.9047 10.5397C16.3214 10.9565 16.5556 11.5217 16.5556 12.1111M19.8889 15.4444V7.66664L16.5556 4.33331M2.11111 19.8889V4.33331C2.11111 3.72442 2.35556 3.17331 2.75222 2.77219M6.55556 2.11108H11C11.5894 2.11108 12.1546 2.34521 12.5713 2.76196C12.9881 3.17871 13.2222 3.74394 13.2222 4.33331V8.77775M13.2222 13.2222V19.8889M1 19.8889H14.3333"
      stroke={color ?? "black"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M17.6667 5.44444V6.55556C17.6667 6.85024 17.7837 7.13286 17.9921 7.34123C18.2005 7.5496 18.4831 7.66667 18.7778 7.66667H19.8889M2.11111 9.88889H9.88889M1 1L21 21"
      stroke={color ?? "black"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default Gas;
