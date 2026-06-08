import Container from '../../common/UI/Container';
import SocialProfile from '../SocialProfile';
import { SOCIAL_PROFILES } from '../../common/assets/data';

const about = `Community leader and altruistic speaker. Currently co-organizes Medellin.js (Biggest JavaScript user group in Colombia), Avanet and JAMstack Medellin communities.

On a daily basis he uses: JavaScript (ES6), React, Gatsby, CSS (inJS), GraphQL, just to name the most important bits.

Helps others learn by doing through articles, videos, and courses about JavaScript, React, and the static web.`;

const Bio = () => (
  <section id="me_bio" style={{ backgroundColor: '#00F6BB', padding: '80px 0' }}>
    <Container noGutter mobileGutter width="1200px">
      <div style={{ margin: '0 auto 60px', maxWidth: 545, textAlign: 'center' }}>
        <h2
          style={{
            color: '#4B15C1',
            fontWeight: 700,
            fontSize: 48,
            lineHeight: 1.3,
            letterSpacing: '-1px',
          }}
        >
          Meet Khriztianmoreno!
        </h2>
      </div>

      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: 5,
          display: 'flex',
          alignItems: 'center',
        }}
        className="bio-content-wrapper"
      >
        <div className="bio-text-content">
          <h2
            style={{
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.3,
              letterSpacing: '-0.02em',
              color: '#302b4e',
              marginBottom: 20,
            }}
          >
            He&apos;s Javascript Developer
          </h2>
          <p
            style={{
              color: '#43414e',
              fontSize: 16,
              lineHeight: 2,
              marginBottom: 27,
              whiteSpace: 'pre-line',
            }}
          >
            {about}
          </p>
          <SocialProfile
            className="bio_social"
            items={SOCIAL_PROFILES}
            iconSize={20}
          />
        </div>

        <figure className="bio-illustration" style={{ margin: 0 }}>
          <img
            src="https://res.cloudinary.com/khriztianmoreno/image/upload/v1623012362/km_site/profileme.jpg"
            alt="Khriztianmoreno illustration"
            style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
          />
        </figure>
      </div>
    </Container>

    <style>{`
      .bio-content-wrapper { flex-wrap: nowrap; }
      .bio-text-content { flex: 1 1 0; min-width: 0; padding: 70px; }
      .bio-illustration { flex: 0 0 45%; }
      .bio-text-content .bio_social a { color: #4b15c1; }
      .bio-text-content .bio_social a:hover { color: #dd4a28; }
      .bio-illustration img { display: block; width: 100%; height: 100%; object-fit: cover; border-radius: 0 5px 5px 0; }
      @media (max-width: 1200px) {
        .bio-text-content { padding: 27px; }
      }
      @media (max-width: 768px) {
        .bio-content-wrapper { flex-wrap: wrap; flex-direction: column-reverse; max-width: 550px; margin: 0 auto; }
        .bio-text-content { flex: none; width: 100%; padding: 30px; }
        .bio-illustration { flex: none; width: 100%; max-height: 340px; overflow: hidden; }
        .bio-illustration img { border-radius: 5px 5px 0 0; height: 340px; object-fit: cover; object-position: top center; }
        #me_bio { padding: 40px 0 60px; }
      }
      @media (max-width: 480px) {
        .bio-content-wrapper { max-width: 360px; }
      }
    `}</style>
  </section>
);

export default Bio;
