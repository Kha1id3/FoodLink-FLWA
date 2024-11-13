import React from "react";
import "./AboutUs.css";

export default function About() {
  const teamMembers = [
    {
      name: "Khalid Muzaffar",
      github: "https://github.com/your-github",
      img: "path_to_khalid_image.jpg", // Update with actual image paths
    },
    {
      name: "Ziad Oun",
      github: "https://github.com/your-github",
      img: "path_to_ziad_image.jpg",
    },
    {
      name: "Mert Kodzhaaslan",
      github: "https://github.com/your-github",
      img: "path_to_mert_image.jpg",
    },
  ];

  return (
    <div id="about-container">
      <div id="about-sub-container">
        <h1 id="meet-our-team">Meet Our Team</h1>
        <div id="about-us-container">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-member">
              <img
                src={member.img}
                width="100"
                alt={member.name}
                className="team-member-photo"
              />
              <h3 className="team-member-name">{member.name}</h3>
              <a
                href={member.github}
                className="team-github-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                <img
                  src={require("./github.png")}
                  alt="github"
                  className="github-icon"
                />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
