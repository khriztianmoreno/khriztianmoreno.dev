import React from 'react';
import { ArrowRight, Check } from 'lucide-react';

import Container from '../../common/UI/Container';
import Button from '../../common/Button';
import Input from '../../common/Input';

const Subscription = () => {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('subscribed.');
  };

  return (
    <section
      style={{ position: 'relative', zIndex: 0 }}
      className="subscription-section"
    >
      <Container>
        <div
          style={{
            backgroundColor: '#4B15C1',
            borderRadius: 10,
            paddingTop: 70,
            paddingBottom: 90,
          }}
          className="subscription-content"
        >
          <div
            style={{
              margin: '0 auto',
              maxWidth: 584,
              textAlign: 'center',
            }}
          >
            <h2
              style={{
                color: '#ffffff',
                fontWeight: 700,
                fontSize: 48,
                lineHeight: 1.21,
                letterSpacing: '-0.02em',
                marginBottom: 50,
              }}
              className="subscription-heading"
            >
              Get booped on the brain.
            </h2>
            <p
              style={{
                color: '#ffffff',
                fontSize: 18,
                lineHeight: 1.21,
                letterSpacing: '-0.02em',
                marginBottom: 50,
              }}
            >
              Khriztianmoreno believes in lifelong learning and continuous improvement.
              In his newsletter, he shares his experience — both technical and otherwise —
              in hopes of connecting with more lifelong learners and building a community of practice.
            </p>

            <form
              onSubmit={handleSubmit}
              style={{ display: 'flex' }}
              className="subscription-form"
            >
              <Input
                inputType="email"
                className="input-field"
                placeholder="Type your e-mail"
                style={{ borderRadius: '10px 0 0 10px', minHeight: 70, minWidth: 335, paddingLeft: 30 }}
              />
              <Button
                type="submit"
                title="Join"
                icon={<ArrowRight size={18} />}
                style={{
                  background: '#DD4A28',
                  borderRadius: '0px 10px 10px 0px',
                  fontWeight: 700,
                  padding: '0 30px',
                  width: '100%',
                }}
              />
            </form>

            <ul
              style={{
                display: 'flex',
                justifyContent: 'center',
                margin: '40px 0 0',
                listStyle: 'none',
                padding: 0,
              }}
              className="subscription-features"
            >
              {['30 days money back', 'Cancel anytime', 'Support & help'].map((text) => (
                <li
                  key={text}
                  style={{
                    fontWeight: 500,
                    fontSize: 15,
                    lineHeight: 1.29,
                    color: '#ffffff',
                    marginRight: 18,
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Check size={20} style={{ marginRight: 8 }} />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <style>{`
        .subscription-section::before {
          background-color: #f1f5f8;
          content: '';
          position: absolute;
          left: 0; bottom: 0;
          height: 600px; width: 100%;
          z-index: -1;
        }
        @media (max-width: 768px) {
          .subscription-section::before { height: 250px; }
          .subscription-content { padding-top: 50px !important; padding-bottom: 55px !important; }
          .subscription-heading { font-size: 32px !important; }
        }
        @media (max-width: 480px) {
          .subscription-content { padding: 30px !important; }
          .subscription-heading { font-size: 24px !important; margin-bottom: 30px !important; }
          .subscription-form { display: block !important; }
          .subscription-features { display: block !important; margin-top: 30px !important; }
          .subscription-features li { line-height: 1.8; margin-right: 0 !important; }
        }
      `}</style>
    </section>
  );
};

export default Subscription;
