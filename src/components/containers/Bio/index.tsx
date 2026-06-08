import Container from '../../common/UI/Container';
import SocialProfile from '../SocialProfile';
import { SOCIAL_PROFILES } from '../../common/assets/data';

const about = `Community leader and altruistic speaker. Currently co-organizes Medellin.js (Biggest JavaScript user group in Colombia), Avanet and JAMstack Medellin communities.

On a daily basis he uses: JavaScript (ES6), React, Gatsby, CSS (inJS), GraphQL, just to name the most important bits.

Helps others learn by doing through articles, videos, and courses about JavaScript, React, and the static web.`;

const Bio = () => (
  <section id="me_bio" className="bg-green py-20">
    <Container noGutter mobileGutter fullWidth>
      <div className="mx-auto mb-15 max-w-136 text-center">
        <h2 className="text-purple text-5xl font-bold leading-tight tracking-tight">
          Meet Khriztianmoreno!
        </h2>
      </div>

      <div className="bio-content-wrapper flex items-center rounded-sm bg-white">
        <div className="bio-text-content">
          <h2 className="text-heading mb-5 text-4xl font-bold leading-tight tracking-tight">
            He&apos;s Javascript Developer
          </h2>
          <p className="text-text mb-7 text-base leading-loose whitespace-pre-line">
            {about}
          </p>
          <SocialProfile
            className="bio_social"
            items={SOCIAL_PROFILES}
            iconSize={20}
          />
        </div>

        <figure className="bio-illustration m-0">
          <img
            src="https://res.cloudinary.com/khriztianmoreno/image/upload/v1623012362/km_site/profileme.jpg"
            alt="Khriztianmoreno illustration"
            className="block max-w-full h-auto"
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
