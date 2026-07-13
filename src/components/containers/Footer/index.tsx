import Container from '../../common/UI/Container';
import SocialProfile from '../SocialProfile';
import { FOOTER_MENU, SOCIAL_PROFILES } from '../../common/assets/data';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-surface-muted">
      <Container noGutter mobileGutter fullWidth>
        <div className="footer-wrapper flex items-center justify-between py-10">
          <div className="footer-copyright flex items-center">
            <a
              href="https://www.linkedin.com/in/khriztianmoreno/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>@khriztianmoreno</span>
            </a>
            <p className="m-0 ml-4">Copyright © {year}</p>
          </div>

          <ul className="footer-nav flex list-none m-0 p-0">
            {FOOTER_MENU.map((item) => (
              <li key={item.id} className="mx-4">
                <a href={item.path} className="text-heading">
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="footer-social flex items-center">
            <SocialProfile
              className="bio_social"
              items={SOCIAL_PROFILES}
              iconSize={20}
            />
          </div>
        </div>
      </Container>

      <style>{`
        @media (max-width: 768px) {
          .footer-wrapper { display: block !important; }
          .footer-copyright { justify-content: center; }
          .footer-nav { justify-content: center; margin-top: 20px; }
          .footer-social { justify-content: center; margin-top: 30px; }
        }
        @media (max-width: 480px) {
          .footer-copyright { display: block !important; text-align: center; margin-bottom: 40px; }
          .footer-nav li { margin: 0 9px; }
        }
      `}</style>
    </footer>
  );
};

export default Footer;
