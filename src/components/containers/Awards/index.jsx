import Container from '../../common/UI/Container';
import GlideCarousel from '../../common/GlideCarousel';
import GlideSlide from '../../common/GlideCarousel/glideSlide';
import { AWARDS } from '../../common/assets/data';

const carouselOptions = {
  type: 'carousel',
  autoplay: 4000,
  gap: 30,
};

const PrevButton = () => (
  <div className="carousel-prev-btn">
    <span />
  </div>
);

const NextButton = () => (
  <div className="carousel-next-btn">
    <span />
  </div>
);

const AwardsSection = () => (
  <section
    id="awards_section"
    style={{ padding: '150px 0', backgroundColor: '#f9f9f9', position: 'relative' }}
    className="awards-section"
  >
    <Container noGutter mobileGutter width="1200px">
      <div className="awards-header" style={{ width: '100%', marginBottom: 90 }}>
        <h2
          style={{
            fontSize: 30,
            fontWeight: 600,
            color: '#302b4e',
            lineHeight: 1.34,
            marginBottom: 20,
          }}
        >
          Honorable Recognitions &amp; Awards
        </h2>
        <p
          style={{
            fontSize: 16,
            fontWeight: 400,
            color: '#43414e',
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          Year after year, khriztianmoreno has been recognized as one of the top
          community builder in world. It&apos;s nice to feel appreciated!
        </p>
      </div>

      <GlideCarousel
        carouselSelector="awards-carousel"
        options={carouselOptions}
        prevButton={<PrevButton />}
        nextButton={<NextButton />}
      >
        {AWARDS.map((award, index) => (
          <GlideSlide key={`award-item-${index}`} perView={4}>
            <div
              style={{
                padding: '50px 30px',
                background: '#fff',
                borderRadius: 10,
              }}
              className="award-item"
            >
              <div style={{ minHeight: 97 }}>
                <img
                  src={award.awardLogo?.src}
                  alt={`award-logo-${index}`}
                  style={{
                    height: 100,
                    maxWidth: '100%',
                    marginBottom: 30,
                    display: 'block',
                    marginLeft: 'auto',
                    marginRight: 'auto',
                  }}
                />
              </div>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: '#302b4e',
                  lineHeight: 1.35,
                  textAlign: 'center',
                  marginBottom: 17,
                }}
              >
                {award.awardName}
              </h2>
              <p
                style={{
                  fontSize: 16,
                  color: '#43414e',
                  lineHeight: 1.5,
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                {award.awardDetails}
              </p>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: 25,
                }}
              >
                <div style={{ marginRight: 20, flexShrink: 0 }}>
                  <img
                    src={award.awardeeLogo?.src}
                    alt={`awardee-logo-${index}`}
                    style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
                  />
                </div>
                <div>
                  <h2
                    style={{
                      fontSize: 16,
                      color: '#9391a5',
                      lineHeight: 1.35,
                      fontWeight: 600,
                      marginBottom: 4,
                    }}
                  >
                    {award.awardeeName}
                  </h2>
                  <p style={{ fontSize: 12, color: '#9391a5', lineHeight: 1.35, margin: 0 }}>
                    {award.date}
                  </p>
                </div>
              </div>
            </div>
          </GlideSlide>
        ))}
      </GlideCarousel>
    </Container>

    <style>{`
      .awards-header { max-width: 50%; }
      @media (max-width: 1200px) { .awards-section { padding: 110px 0; } }
      @media (max-width: 990px)  { .awards-section { padding: 100px 0; } }
      @media (max-width: 767px)  {
        .awards-section { padding: 80px 0; }
        .awards-header { max-width: 100%; margin-bottom: 30px; }
        .glide__controls { display: none; }
      }
      @media (max-width: 575px)  { .awards-section { padding: 60px 0; } }
      @media (max-width: 1200px) { .award-item { padding: 40px 20px; } }
    `}</style>
  </section>
);

export default AwardsSection;
