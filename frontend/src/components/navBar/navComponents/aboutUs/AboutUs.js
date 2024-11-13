import React from "react";
import "./AboutUs.css";

export default function About() {
  const teamMembers = [
    {
      name: "Khalid Muzaffar",
      github: "https://github.com/Kha1id3",
      img: "https://avatars.githubusercontent.com/u/149905898?v=4", // Update with actual image paths
    },
    {
      name: "Ziad Oun",
      github: "https://github.com/your-github",
      img: "https://media.licdn.com/dms/image/v2/D4D03AQE4mRvR-1iZYQ/profile-displayphoto-shrink_200_200/profile-displayphoto-shrink_200_200/0/1720092128049?e=1736985600&v=beta&t=yrJzCHIMcAmflijyztiboScOtuTp1Q-lGeZx0kKB3UU",
    },
    {
      name: "Mert Kodzhaaslan",
      github: "https://github.com/your-github",
      img: "./Morat logo.jpg",
    },
  ];

  return (
    <div id="about-container">
      <div id="about-sub-container">
        <h1 id="meet-our-team">Team Members</h1>
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
