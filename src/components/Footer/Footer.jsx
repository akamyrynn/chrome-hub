import "./Footer.css";
import Link from "next/link";

import ContactForm from "../ContactForm/ContactForm";

const Footer = () => {
  return (
    <>
      <ContactForm />

      <footer>
        <div className="container">
          <div className="footer-row">
            <div className="footer-col">
              <div className="footer-col-header">
                <p className="bodyCopy">Root</p>
              </div>
              <div className="footer-col-links">
                <Link href="/">Index</Link>
                <Link href="/wardrobe">Wardrobe</Link>
                <Link href="/genesis">Genesis</Link>
                <Link href="/contact">Touchpoint</Link>
                <Link href="/lookbook">Lookbook</Link>
              </div>
            </div>
            <div className="footer-col">
              <div className="footer-col-header">
                <p className="bodyCopy">Connect Feed</p>
              </div>
              <div className="footer-col-links">
                <a
                  href="https://www.instagram.com/codegridweb/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Instagram
                </a>
                <a
                  href="https://www.youtube.com/@codegrid"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  YouTube
                </a>
              </div>
            </div>
            <div className="footer-col">
              <div className="footer-col-header">
                <p className="bodyCopy">Open Line</p>
              </div>
              <div className="footer-col-links">
                <p>Unit 07, Sector N</p>
                <p>Layer 2, South Terminal</p>
                <p>System 021, Earth</p>
              </div>
            </div>
          </div>
          <div className="footer-row">
            <div className="footer-copyright">
              <h5>Nrmlss</h5>
              <p className="bodyCopy">&copy;2025 All modules reserved.</p>
              <p className="bodyCopy" id="copyright-text">
                Built by Codegrid
              </p>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
