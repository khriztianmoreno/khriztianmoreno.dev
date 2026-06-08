import Container from '../../common/UI/Container';
import SocialProfile from '../SocialProfile';
import { FOOTER_MENU, SOCIAL_PROFILES } from '../../common/assets/data';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <footer style={{ backgroundColor: '#f1f5f8' }}>
      <Container noGutter mobileGutter width="1200px">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '40px 0',
          }}
          className="footer-wrapper"
        >
          <div className="footer-copyright" style={{ display: 'flex', alignItems: 'center' }}>
            <a
              href="https://www.linkedin.com/in/khriztianmoreno/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>@khriztianmoreno</span>
            </a>
            <p style={{ margin: '0 0 0 15px' }}>Copyright © {year}</p>
          </div>

          <ul
            className="footer-nav"
            style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}
          >
            {FOOTER_MENU.map((item) => (
              <li key={item.id} style={{ margin: '0 15px' }}>
                <a href={item.path} style={{ color: '#302b4e' }}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <div
            className="footer-social"
            style={{ display: 'flex', alignItems: 'center' }}
          >
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
