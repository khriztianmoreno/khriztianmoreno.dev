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
    className="awards-section relative bg-surface py-38"
  >
    <Container noGutter mobileGutter fullWidth>
      <div className="awards-header w-full mb-22">
        <h2 className="text-heading mb-5 text-3xl font-semibold leading-snug">
          Honorable Recognitions &amp; Awards
        </h2>
        <p className="text-text m-0 text-base font-normal leading-normal">
          Recognized by Google, Microsoft, Amazon Web Services, and Cloudinary for
          technical leadership and community impact across Latin America and beyond.
        </p>
      </div>

      <GlideCarousel
        carouselSelector="awards-carousel"
        options={carouselOptions}
        prevButton={<PrevButton />}
        nextButton={<NextButton />}
      >
        {AWARDS.map((award, index) => (
          <GlideSlide key={`award-item-${index}`}>
            <div className="award-item bg-white rounded-lg py-12 px-7.5">
              <div className="min-h-24">
                <img
                  src={award.awardLogo?.src}
                  alt={`award-logo-${index}`}
                  className="block mx-auto h-25 max-w-full mb-7.5"
                />
              </div>
              <h2 className="text-heading mb-4 text-xl font-semibold leading-snug text-center">
                {award.awardName}
              </h2>
              <p className="text-text m-0 text-base leading-normal text-center">
                {award.awardDetails}
              </p>
              <div className="flex justify-center items-center mt-6">
                <div className="mr-5 shrink-0">
                  <img
                    src={award.awardeeLogo?.src}
                    alt={`awardee-logo-${index}`}
                    className="block max-w-full h-auto"
                  />
                </div>
                <div>
                  <h2 className="mb-1 text-base font-semibold leading-snug text-muted">
                    {award.awardeeName}
                  </h2>
                  <p className="m-0 text-xs leading-snug text-muted">
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
