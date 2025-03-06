import { JSX } from "react";
import { openLink } from "@telegram-apps/sdk-react";
import { useSnackbar } from "../../../hooks/snackbar";
import { ComingSoon } from "../../../assets/icons/actions";
import { colors } from "../../../constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExternalLinkAlt, faStar } from "@fortawesome/free-solid-svg-icons";

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
  const { showsuccesssnack } = useSnackbar();

  const handleClick = () => {
    if (link === "") {
      showsuccesssnack(`${title} coming soon!`);
    } else {
      openLink(link);
    }
  };

  return (
    <div
      className="project-card"
      onClick={handleClick}
    >
      <div className="project-image" style={{ backgroundImage: `url(${images[0]})` }}>
        <div className="project-overlay">
          {comingSoon && (
            <div className="coming-soon-badge">
              <span>Coming Soon</span>
            </div>
          )}
        </div>
      </div>
      
      <div className="project-content">
        <div className="project-logo">
          <img src={images[1]} alt={title} />
        </div>
        
        <div className="project-info">
          <h3 className="project-title">{title}</h3>
          <p className="project-description">{description}</p>
          
          <div className="project-footer">
            <span className="project-category">{category}</span>
            
            {link && (
              <button className="project-link-btn">
                <FontAwesomeIcon icon={faExternalLinkAlt} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
