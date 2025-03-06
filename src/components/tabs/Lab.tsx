import { JSX, useState } from "react";
import { useNavigate } from "react-router";
import { useBackButton } from "../../hooks/backbutton";
import { useTabs } from "../../hooks/tabs";
import { projectType, Project } from "./lab/Project";
import startoxlogo from "../../assets/images/labs/stratox.png";
import stratocover from "../../assets/images/labs/stratoxcover.jpeg";
import mantracover from "../../assets/images/labs/mantracover.png";
import mantralogo from "../../assets/images/labs/mantralogo.jpeg";
import evidentcover from "../../assets/images/labs/evidentcover.jpg";
import evidentlogo from "../../assets/images/labs/evident.png";
import yieldfarmcover from "../../assets/images/labs/yieldfarmcover.jpg";
import yieldfarmlogo from "../../assets/images/icons/lendto.png";
import airshipLogo from "../../assets/images/airship.png";
import "../../styles/components/tabs/labstab.scss";

export const LabsTab = (): JSX.Element => {
  const navigate = useNavigate();
  const { switchtab } = useTabs();
  const [activeFilter, setActiveFilter] = useState<string>("ALL");

  const goBack = () => {
    switchtab("home");
    navigate("/app");
  };

  const filterProjects = (category: string) => {
    setActiveFilter(category);
  };

  const getFilteredProjects = () => {
    if (activeFilter === "ALL") {
      return projects;
    }
    return projects.filter((project) => project.category === activeFilter);
  };

  // Define fixed categories for better control
  const categories = ["ALL", "STAKING", "DEX", "LAUNCHPAD", "OTC"];

  useBackButton(goBack);

  return (
    <section id="labstab">
      <h1 className="labs-title">Stratosphere Labs</h1>

      <div className="filter-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-tab ${
              activeFilter === category ? "active" : ""
            }`}
            onClick={() => filterProjects(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="projects">
        {getFilteredProjects().map((_project, idx) => (
          <Project
            key={Math.random() + idx}
            images={_project?.images}
            title={_project?.title}
            description={_project?.description}
            category={_project?.category}
            comingSoon={_project?.comingSoon}
            link={_project?.link}
          />
        ))}
      </div>
    </section>
  );
};

// Update categories to be consistent
const projects: projectType[] = [
  {
    images: [mantracover, mantralogo],
    title: "Mantra DEX",
    description: "Trade RWA in the #1 RWA Compliance Blockchain",
    category: "STAKING",
    comingSoon: false,
    link: "https://mantra.zone/stake",
  },
  {
    images: [yieldfarmcover, yieldfarmlogo],
    title: "Techgrity",
    description: "Earn fixed 11% APY on your stablecoins",
    category: "STAKING", // Changed from YIELD FARMING to STAKING
    comingSoon: true,
    link: "",
  },
  {
    images: [stratocover, startoxlogo],
    title: "StratoX",
    description: "The Official Multi-chain DEX",
    category: "DEX", // Kept as DEX (all caps)
    comingSoon: false,
    link: "https://t.me/stratospherex_bot/stratospherex",
  },
  {
    images: [airshipLogo, airshipLogo],
    title: "Blimp",
    description: "Launchpad for RWA tokens",
    category: "LAUNCHPAD",
    comingSoon: false,
    link: "",
  },
  {
    images: [evidentcover, evidentlogo],
    title: "Evident OTC",
    description: "Convert Fiat to Stablecoins",
    category: "OTC",
    comingSoon: false,
    link: "",
  },
];
