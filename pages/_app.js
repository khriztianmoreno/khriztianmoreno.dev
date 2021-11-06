import { Modal } from '@redq/reuse-modal';

import { SettingsProvider } from '../components/common/contexts/Settings';

import '@redq/reuse-modal/es/index.css';
import 'swiper/css/bundle';
import '../components/common/assets/css/flaticon.css';

console.log(
  '%c HELLO FRIENDS THANK YOU FOR COMING TO THE CONSOLE',
  `
    background-color: #4B15C1;
    color: white;
    font-size: 2.8vw;
    line-height: 1;
    padding: 4rem 5vw;
  `
);

export default function CustomApp({ Component, pageProps }) {
  return (
    <SettingsProvider>
      <Modal>
        <Component {...pageProps} />
      </Modal>
    </SettingsProvider>
  );
}
