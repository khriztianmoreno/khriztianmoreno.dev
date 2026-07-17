import { createElement, type FC } from 'react';
import { type StaticImageData } from 'next/image';

import AwardMDE from '../image/portfolio/mde.png';
import AwardGDE from '../image/portfolio/gde.png';
import AwardAWS from '../image/portfolio/awsc.png';

import MicrosoftLogo from '../image/portfolio/client-1.png';
import Cloudinary from '../image/portfolio/cloudinary.png';
import Amazon from '../image/portfolio/client-5.png';
import GoogleLogo from '../image/portfolio/client-6.png';

/* JPEG — served from /public to bypass squoosh on Node 22 + Next 12 */
const AwardMVP: { src: string } = { src: '/portfolio/mvp.jpeg' };

const svgProps = {
  xmlns: 'http://www.w3.org/2000/svg',
  width: '1em',
  height: '1em',
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

/* Social icons as inline SVG — lucide-react dropped brand icons */
const SvgLinkedin: FC = () =>
  createElement(
    'svg',
    svgProps,
    createElement('path', { key: 'p1', d: 'M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z' }),
    createElement('rect', { key: 'r1', x: '2', y: '9', width: '4', height: '12' }),
    createElement('circle', { key: 'c1', cx: '4', cy: '4', r: '2' })
  );

const SvgGithub: FC = () =>
  createElement(
    'svg',
    svgProps,
    createElement('path', {
      key: 'p1',
      d: 'M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22',
    })
  );

const SvgTwitter: FC = () =>
  createElement(
    'svg',
    svgProps,
    createElement('path', {
      key: 'p1',
      d: 'M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z',
    })
  );

const SvgYoutube: FC = () =>
  createElement(
    'svg',
    svgProps,
    createElement('path', {
      key: 'p1',
      d: 'M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z',
    }),
    createElement('polygon', { key: 'pg1', points: '9.75 15.02 15.5 12 9.75 8.98 9.75 15.02' })
  );

const SvgInstagram: FC = () =>
  createElement(
    'svg',
    svgProps,
    createElement('rect', { key: 'r1', x: '2', y: '2', width: '20', height: '20', rx: '5', ry: '5' }),
    createElement('path', { key: 'p1', d: 'M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z' }),
    createElement('line', { key: 'l1', x1: '17.5', y1: '6.5', x2: '17.51', y2: '6.5' })
  );

const SvgFacebook: FC = () =>
  createElement(
    'svg',
    svgProps,
    createElement('path', { key: 'p1', d: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' })
  );

export interface SocialProfileItem {
  icon: FC;
  url: string;
}

export const SOCIAL_PROFILES: SocialProfileItem[] = [
  { icon: SvgLinkedin, url: 'https://www.linkedin.com/in/khriztianmoreno/' },
  { icon: SvgGithub, url: 'https://github.com/khriztianmoreno' },
  { icon: SvgTwitter, url: 'https://twitter.com/khriztianmoreno' },
  { icon: SvgYoutube, url: 'https://www.youtube.com/khriztianmoreno' },
  { icon: SvgInstagram, url: 'https://www.instagram.com/khriztianmoreno' },
  { icon: SvgFacebook, url: 'https://www.facebook.com/khriztianmoreno' },
];

export interface MenuItem {
  label: string;
  path: string;
  offset: string;
  staticLink?: boolean;
}

export const MENU_ITEMS: MenuItem[] = [
  { label: 'START', path: '#banner_section', offset: '0' },
  { label: 'ME', path: '#me_bio', offset: '70' },
  { label: 'AWARDS', path: '#awards_section', offset: '0' },
  { label: 'JOURNEY', path: '#milestones_section', offset: '0' },
  { label: 'BLOG', path: '/blog', offset: '0', staticLink: true },
];

export interface AwardItem {
  awardLogo: StaticImageData | { src: string };
  awardName: string;
  awardDetails: string;
  awardeeLogo: StaticImageData;
  awardeeName: string;
  date: string;
}

export const AWARDS: AwardItem[] = [
  {
    awardLogo: AwardGDE,
    awardName: '#GDE',
    awardDetails: 'Web Technologies & W3C Standards',
    awardeeLogo: GoogleLogo,
    awardeeName: 'Google',
    date: '2021 - currently',
  },
  {
    awardLogo: AwardMVP,
    awardName: '#MVP',
    awardDetails: 'Developer Technologies & Cloud Platforms',
    awardeeLogo: MicrosoftLogo,
    awardeeName: 'Microsoft',
    date: '2020 - 2025',
  },
  {
    awardLogo: AwardAWS,
    awardName: '#AWSCommunity',
    awardDetails: 'Cloud & Serverless Architectures',
    awardeeLogo: Amazon,
    awardeeName: 'Amazon Web Services',
    date: '2021 - 2025',
  },
  {
    awardLogo: AwardMDE,
    awardName: '#MDE',
    awardDetails: 'Media Performance & Web Optimization',
    awardeeLogo: Cloudinary,
    awardeeName: 'Cloudinary',
    date: '2019 - 2025',
  },
];

export interface FooterMenuItem {
  id: number;
  label: string;
  path: string;
}

export const FOOTER_MENU: FooterMenuItem[] = [
  { id: 1, label: 'Contact', path: '#' },
  { id: 2, label: 'Privacy', path: '#' },
  { id: 3, label: 'Cookie Policy', path: '#' },
];
