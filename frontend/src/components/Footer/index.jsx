import "./index.css";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p className="footer-text">
          © {new Date().getFullYear()} Token Trap. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
