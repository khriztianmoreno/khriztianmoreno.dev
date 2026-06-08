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
    <section className="subscription-section relative z-0">
      <Container>
        <div className="subscription-content bg-purple rounded-lg pt-18 pb-22">
          <div className="mx-auto max-w-146 text-center">
            <h2 className="subscription-heading mb-12 text-white text-5xl font-bold leading-tight tracking-tight">
              Get booped on the brain.
            </h2>
            <p className="mb-12 text-white text-lg leading-tight tracking-tight">
              Khriztianmoreno believes in lifelong learning and continuous improvement.
              In his newsletter, he shares his experience — both technical and otherwise —
              in hopes of connecting with more lifelong learners and building a community of practice.
            </p>

            <form onSubmit={handleSubmit} className="subscription-form flex">
              <Input
                inputType="email"
                className="input-field [&_input]:rounded-l-lg [&_input]:rounded-r-none [&_input]:min-h-18 [&_input]:min-w-84 [&_input]:pl-7.5"
                placeholder="Type your e-mail"
              />
              <Button
                type="submit"
                title="Join"
                icon={<ArrowRight size={18} />}
                className="rounded-l-none! rounded-r-lg! font-bold px-7.5! w-full"
              />
            </form>

            <ul className="subscription-features flex justify-center mt-10 list-none p-0">
              {['30 days money back', 'Cancel anytime', 'Support & help'].map((text) => (
                <li
                  key={text}
                  className="flex items-center mr-4.5 text-sm font-medium leading-tight text-white"
                >
                  <Check size={20} className="mr-2" />
                  {text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>

      <style>{`
        .subscription-section::before {
          background-color: var(--color-surface-muted);
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
