import React from "react";
import "./Resources.css";

export default function Resources() {
  const resources = [
    {
      name: "World Food Programme",
      link: "https://www.wfp.org/",
      logo: "https://miro.medium.com/v2/resize:fit:2400/1*1ZF1lEpi9odcxZz2jgmI6g.png",
      description: "Learn about global efforts to fight hunger.",
    },
    {
      name: "Food and Agriculture Organization",
      link: "https://www.fao.org/",
      logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/d/db/FAO_logo.svg/1200px-FAO_logo.svg.png",
      description: "Support sustainable agriculture and food security.",
    },
    {
      name: "Polish Red Cross",
      link: "https://pck.pl/",
      logo: "https://pck.pl/wp-content/uploads/2020/08/pck-logo.svg",
      description: "Helping fight hunger and support humanitarian aid in Poland.",
    },
    {
      name: "Food Bank Poland",
      link: "https://bankizywnosci.pl/",
      logo: "https://bankizywnosci.pl/wp-content/themes/clv_bankiz/img/center_logo.png",
      description: "Supporting food donation and fighting food waste in Poland.",
    },
  ];

  return (
    <div className="resources-wrapper">
      <div id="resources-container">
        <h1 id="hungry-header">Resources</h1>
        <div className="resources-all-text">
          {resources.map((resource, index) => (
            <a
              key={index}
              className={`resource-item resource-${index + 1}`}
              target="_blank"
              rel="noopener noreferrer"
              href={resource.link}
            >
              <img src={resource.logo} alt={resource.name} height="175px" />
              <p>{resource.description}</p>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
