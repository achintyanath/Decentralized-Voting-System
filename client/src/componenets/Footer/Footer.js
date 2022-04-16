import React from "react";

import "./Footer.css";

const Footer = () => (
  <React.Fragment>
    <div className="footer-block"></div>
    <div className="footer">
      <div className="footer-container">
        <p>
          View this project here{" "}
          <a
            className="profile"
            href="https://github.com/achintyanath/Decentralized-Voting-System"
            target="_blank"
            rel="noopener noreferrer"
          >
            on GitHub
          </a>
        </p>
      </div>
    </div>
  </React.Fragment>
);

export default Footer;
