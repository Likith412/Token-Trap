import React from "react";
import { Link } from "react-router";

import Navbar from "../Navbar";
import ProfileCard from "../ProfileCard";
import Footer from "../Footer";

import "./index.css";

const developers = [
  {
    name: "Likith Metikala",
    role: "Full Stack Developer",
    avatar: "https://github.com/likith412.png",
    social: {
      github: "https://github.com/likith412",
      twitter: "https://twitter.com/likithmetikala",
      linkedin: "https://linkedin.com/in/likith-metikala",
    },
  },
  {
    name: "Kullai Metikala",
    role: "Security Engineer",
    avatar: "https://github.com/kullaisec.png",
    social: {
      github: "https://github.com/kullaisec",
      twitter: "https://twitter.com/kullai12",
      linkedin: "https://linkedin.com/in/kullai-metikala-8378b122a",
    },
  },
];

const Home = () => {
  return (
    <>
      <Navbar />
      <div className="home-container">
        <div className="home-content">
          <h1 className="home-heading">Welcome to Token Trap</h1>
          <p className="home-description">
            Your comprehensive solution for detecting and managing exposed
            secrets and vulnerabilities in your codebase.
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <h2 className="feature-heading">Secret Detection</h2>
              <p className="feature-description">
                Automatically scan your repositories for exposed API keys,
                tokens, and other sensitive credentials.
              </p>
            </div>

            <div className="feature-card">
              <h2 className="feature-heading">Detailed Reports</h2>
              <p className="feature-description">
                Access comprehensive reports with detailed information about
                each detected vulnerability.
              </p>
            </div>

            <div className="feature-card">
              <h2 className="feature-heading">Organization-wide Security</h2>
              <p className="feature-description">
                Monitor and manage security across all your organization's
                repositories from a single dashboard.
              </p>
            </div>
          </div>

          <div className="cta-section">
            <Link to="/start-scan" className="cta-button">
              Start Scanning
            </Link>
            <p className="cta-text">
              Begin protecting your codebase from exposed secrets and
              vulnerabilities
            </p>
          </div>
        </div>
        <div className="developers-section">
          <h2 className="developers-heading">Developed By</h2>
          <div className="developers-grid">
            {developers.map((developer, index) => (
              <ProfileCard key={index} developer={developer} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Home;
