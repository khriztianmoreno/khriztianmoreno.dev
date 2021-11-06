import React from 'react';

import Container from '../../common/UI/Container';
import Heading from '../../common/Heading';
import Image from '../../common/Image';
import Text from '../../common/Text';
import SocialProfile from '../SocialProfile';

import { SOCIAL_PROFILES } from '../../common/assets/data';

import {
  Section,
  SectionHeading,
  ContentWrapper,
  Illustration,
  TextContent,
} from './styles';

const about = `
Community leader and altruistic speaker. Currently co-organizes Medellin.js (Biggest JavaScript user group in Colombia), Avanet and JAMstack Medellin communities.

On a daily basis he uses: JavaScript (ES6), React, Gatsby, CSS (inJS), GraphQL, just to name the most important bits.

Helps others learn by doing through articles, videos, and courses about JavaScript, React, and the static web.
`;

const Bio = () => {
  return (
    <Section id="me_bio">
      <Container noGutter>
        <SectionHeading>
          <Heading content="Meet Khriztianmoreno!" />
        </SectionHeading>
        <ContentWrapper>
          <TextContent>
            <Heading className="title" content="He’s Javascript Developer" />
            <Text className="desc" content={about} />
            <SocialProfile
              className="bio_social"
              items={SOCIAL_PROFILES}
              iconSize={20}
            />
          </TextContent>
          <Illustration>
            <Image
              src="https://res.cloudinary.com/khriztianmoreno/image/upload/v1623012362/km_site/profileme.jpg"
              alt="illustration"
            />
          </Illustration>
        </ContentWrapper>
      </Container>
    </Section>
  );
};

export default Bio;
