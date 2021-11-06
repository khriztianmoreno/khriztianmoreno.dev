import Container from '../../common/UI/Container';
import Link from '../../common/Link';
import SocialProfile from '../SocialProfile';
import { FOOTER_MENU, SOCIAL_PROFILES } from '../../common/assets/data';

import {
  Section,
  ContentWrapper,
  Copyright,
  Nav,
  SocialProfiles,
  Icons,
} from './styles';

const Footer = () => {
  const year = new Date().getFullYear();
  return (
    <Section>
      <Container>
        <ContentWrapper>
          <Copyright>
            <Link href="https://www.linkedin.com/in/khriztianmoreno/">
              <span>@khriztianmoreno</span>
            </Link>
            <p>Copyright © {year}</p>
          </Copyright>
          <Nav>
            {FOOTER_MENU.map((item) => (
              <li key={item.id}>
                <Link href={item.url}>{item.title}</Link>
              </li>
            ))}
          </Nav>
          <SocialProfiles>
            <Icons>
              <SocialProfile
                className="bio_social"
                items={SOCIAL_PROFILES}
                iconSize={20}
              />
            </Icons>
          </SocialProfiles>
        </ContentWrapper>
      </Container>
    </Section>
  );
};

export default Footer;
