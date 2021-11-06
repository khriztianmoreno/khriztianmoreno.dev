import { Icon } from 'react-icons-kit';
import { check } from 'react-icons-kit/feather/check';
import { arrowRight } from 'react-icons-kit/feather/arrowRight';

import Container from '../../common/UI/Container';
import Heading from '../../common/Heading';
import Button from '../../common/Button';
import Input from '../../common/Input';
import Text from '../../common/Text';
import {
  Section,
  ContentWrapper,
  SubscriptionWrapper,
  SubscriptionForm,
  Features,
} from './styles';

const Subscription = () => {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('subscribed.');
  };
  return (
    <Section>
      <Container>
        <ContentWrapper>
          <SubscriptionWrapper>
            <Heading content="Get booped on the brain." />
            <Text
              className="desc"
              content="Khriztianmoreno believes in lifelong learning and continuous improvement. In his newsletter, he shares his experience — both technical and otherwise — in hopes of connecting with more lifelong learners and building a community of practice."
            />
            <SubscriptionForm onSubmit={handleSubmit}>
              <Input
                type="email"
                className="input-field"
                placeholder="Type your e-mail"
              />
              <Button
                type="submit"
                title="Join"
                icon={<Icon size={18} icon={arrowRight} />}
              />
            </SubscriptionForm>
            <Features>
              <li>
                <Icon size={20} icon={check} /> 30 days money back
              </li>
              <li>
                <Icon size={20} icon={check} /> Cancel anytime
              </li>
              <li>
                <Icon size={20} icon={check} /> Support &amp; help
              </li>
            </Features>
          </SubscriptionWrapper>
        </ContentWrapper>
      </Container>
    </Section>
  );
};

export default Subscription;
