import { JSX } from "react";
import { openLink } from "@telegram-apps/sdk-react";
import { ComingSoon } from "../../../assets/icons";
import { colors } from "../../../constants";

export type projectType = {
  images: string[]; // [cover, logo]
  title: string;
  description: string;
  category: string;
  comingSoon: Boolean;
  link: string;
};

export const Project = ({
  images,
  title,
  description,
  category,
  comingSoon,
  link,
}: projectType): JSX.Element => {
  return (
    <div
      className="project"
      onClick={() => {
        link == "" ? () => {} : openLink(link);
      }}
    >
      <img src={images[0]} alt={title} className="project_cover" />

      <div className="project_logo">
        <img src={images[1]} alt="friendsduel" />
      </div>

      <div className="about">
        <p>
          {title}
          {comingSoon && (
            <ComingSoon width={16} height={18} color={colors.textsecondary} />
          )}
        </p>

        <span>{description}</span>

        <p className="project_category">{category}</p>
      </div>
    </div>
  );
};
