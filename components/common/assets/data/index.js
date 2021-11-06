import { socialTwitter } from 'react-icons-kit/ionicons/socialTwitter';
import { socialFacebook } from 'react-icons-kit/ionicons/socialFacebook';
import { socialYoutube } from 'react-icons-kit/ionicons/socialYoutube';
import { socialGithub } from 'react-icons-kit/ionicons/socialGithub';
import { socialInstagramOutline } from 'react-icons-kit/ionicons/socialInstagramOutline';

import AwardMVP from '../image/portfolio/mvp.jpeg';
import AwardMDE from '../image/portfolio/mde.png';
import AwardGDE from '../image/portfolio/gde.png';
import AwardAWS from '../image/portfolio/awsc.png';

import PortfolioImage1 from '../image/portfolio/portfolio-1.jpg';
import PortfolioImage2 from '../image/portfolio/portfolio-2.jpg';

import Step1 from '../image/portfolio/step-1.png';
import Step2 from '../image/portfolio/step-2.png';
import Step3 from '../image/portfolio/step-3.png';

import SkillIcon1 from '../image/portfolio/skill-1.svg';
import SkillIcon2 from '../image/portfolio/skill-2.svg';
import SkillIcon3 from '../image/portfolio/skill-3.svg';
import SkillIcon4 from '../image/portfolio/skill-4.svg';

import MicrosoftLogo from '../image/portfolio/client-1.png';
import Client2 from '../image/portfolio/client-2.png';
import Client3 from '../image/portfolio/client-3.png';
import Cloudinary from '../image/portfolio/cloudinary.png';
import Amazon from '../image/portfolio/client-5.png';
import GoogleLogo from '../image/portfolio/client-6.png';

import Reviewer1 from '../image/portfolio/client-avatar-1.jpg';
import Reviewer2 from '../image/portfolio/client-avatar-2.jpg';
import Reviewer3 from '../image/portfolio/client-avatar-3.jpg';

export const SOCIAL_PROFILES = [
  {
    icon: socialTwitter,
    url: 'https://twitter.com/khriztianmoreno',
  },
  {
    icon: socialFacebook,
    url: 'https://www.facebook.com/khriztianmoreno',
  },
  {
    icon: socialYoutube,
    url: 'https://www.youtube.com/khriztianmoreno',
  },
  {
    icon: socialGithub,
    url: 'https://github.com/khriztianmoreno',
  },
  {
    icon: socialInstagramOutline,
    url: 'https://www.instagram.com/khriztianmoreno',
  },
];

export const MENU_ITEMS = [
  {
    label: 'START',
    path: '#banner_section',
    offset: '0',
  },
  {
    label: 'ME',
    path: '#me_bio',
    offset: '70',
  },
  // {
  //   label: 'PROJECT',
  //   path: '#portfolio_section',
  //   offset: '0',
  // },
  {
    label: 'AWARDS',
    path: '#awards_section',
    offset: '0',
  },
];

export const AWARDS = [
  {
    awardLogo: AwardMVP,
    awardName: '#MVP',
    awardDetails: 'Developer Technologies',
    awardeeLogo: MicrosoftLogo,
    awardeeName: 'Awardee',
    date: '2020 - currently',
  },
  {
    awardLogo: AwardGDE,
    awardName: '#GDE',
    awardDetails: 'Web Technologies',
    awardeeLogo: GoogleLogo,
    awardeeName: 'Awardee',
    date: '2021 - currently',
  },
  {
    awardLogo: AwardAWS,
    awardName: '#AWSCommunity',
    awardDetails: 'Amazon Community Builder',
    awardeeLogo: Amazon,
    awardeeName: 'Awardee',
    date: '2021 - currently',
  },
  {
    awardLogo: AwardMDE,
    awardName: '#MDE',
    awardDetails: 'Cloudinary Media Expert',
    awardeeLogo: Cloudinary,
    awardeeName: 'Awardee',
    date: '2019- currently',
  },
];

export const PORTFOLIO_SHOWCASE = [
  {
    title: 'DESIGN',
    portfolioItem: [
      {
        title: 'Canada Media Site',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage1,
        link: '#',
        featuredIn: 'AWWWARDS',
        featuredLink: '#',
        view: '4.5K',
        love: '1.5K',
        feedback: '1.2K',
        buildWith: [
          {
            content: 'React JS',
          },
          {
            content: 'Next JS',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
      {
        title: 'RedQ, Inc. mobile app',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage2,
        link: '#',
        featuredIn: 'AppStore',
        featuredLink: '#',
        view: '8.5K',
        love: '5.5K',
        feedback: '3.2K',
        buildWith: [
          {
            content: 'React Native',
          },
          {
            content: 'Firebase',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
    ],
  },
  {
    title: 'DEVELOPMENT',
    portfolioItem: [
      {
        title: 'Canada Media Site',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage1,
        link: '#',
        featuredIn: 'AWWWARDS',
        featuredLink: '#',
        view: '4.5K',
        love: '1.5K',
        feedback: '1.2K',
        buildWith: [
          {
            content: 'React JS',
          },
          {
            content: 'Next JS',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
      {
        title: 'RedQ, Inc. mobile app',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage2,
        link: '#',
        featuredIn: 'AppStore',
        featuredLink: '#',
        view: '8.5K',
        love: '5.5K',
        feedback: '3.2K',
        buildWith: [
          {
            content: 'React Native',
          },
          {
            content: 'Firebase',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
    ],
  },
  {
    title: 'ANIMATION',
    portfolioItem: [
      {
        title: 'Canada Media Site',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage1,
        link: '#',
        featuredIn: 'AWWWARDS',
        featuredLink: '#',
        view: '4.5K',
        love: '1.5K',
        feedback: '1.2K',
        buildWith: [
          {
            content: 'React JS',
          },
          {
            content: 'Next JS',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
      {
        title: 'RedQ, Inc. mobile app',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage2,
        link: '#',
        featuredIn: 'AppStore',
        featuredLink: '#',
        view: '8.5K',
        love: '5.5K',
        feedback: '3.2K',
        buildWith: [
          {
            content: 'React Native',
          },
          {
            content: 'Firebase',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
    ],
  },
  {
    title: 'TV ADVERTISEMENT',
    portfolioItem: [
      {
        title: 'Canada Media Site',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage1,
        link: '#',
        featuredIn: 'AWWWARDS',
        featuredLink: '#',
        view: '4.5K',
        love: '1.5K',
        feedback: '1.2K',
        buildWith: [
          {
            content: 'React JS',
          },
          {
            content: 'Next JS',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
      {
        title: 'RedQ, Inc. mobile app',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage2,
        link: '#',
        featuredIn: 'AppStore',
        featuredLink: '#',
        view: '8.5K',
        love: '5.5K',
        feedback: '3.2K',
        buildWith: [
          {
            content: 'React Native',
          },
          {
            content: 'Firebase',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
    ],
  },
  {
    title: 'MARKETING',
    portfolioItem: [
      {
        title: 'Canada Media Site',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage1,
        link: '#',
        featuredIn: 'AWWWARDS',
        featuredLink: '#',
        view: '4.5K',
        love: '1.5K',
        feedback: '1.2K',
        buildWith: [
          {
            content: 'React JS',
          },
          {
            content: 'Next JS',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
      {
        title: 'RedQ, Inc. mobile app',
        description:
          "An effective and immersive user experience is what catches the attention and spreads a clear message. That's why we attach great importance to the fact that ergonomics serves the design, and that this design is innovative and neat.",
        image: PortfolioImage2,
        link: '#',
        featuredIn: 'AppStore',
        featuredLink: '#',
        view: '8.5K',
        love: '5.5K',
        feedback: '3.2K',
        buildWith: [
          {
            content: 'React Native',
          },
          {
            content: 'Firebase',
          },
          {
            content: 'Styled Component',
          },
        ],
      },
    ],
  },
];

export const PROCESS_STEPS = [
  {
    image: Step1,
    title: '1. Research',
    description:
      'We work with you to understand user’s stories and validate your idea with real users using lean design sprints.',
  },
  {
    image: Step2,
    title: '2. Design',
    description:
      'Expanding on the insights gained, you’ll work closely with our design team to create an elegant design',
  },
  {
    image: Step3,
    title: '3. Build',
    description:
      'With our scrum-based agile methodology, you’ll receive iterative builds every two weeks, which gives you ',
  },
];

export const SERVICE_LIST = [
  {
    title: 'UI/UX Design',
    listItems: [
      {
        content: 'Design Sprints',
      },
      {
        content: 'User Research',
      },
      {
        content: 'Visual Design',
      },
      {
        content: 'Mobile App Design',
      },
      {
        content: 'Tracking & Learning',
      },
      {
        content: 'Building Traction',
      },
    ],
  },
  {
    title: 'Web Development',
    listItems: [
      {
        content: 'ReactJS',
      },
      {
        content: 'AngularJS',
      },
      {
        content: 'ASP.NET MVC',
      },
      {
        content: 'WordPress',
      },
      {
        content: 'NodeJS',
      },
      {
        content: 'GO',
      },
    ],
  },
  {
    title: 'Mobile App Development',
    listItems: [
      {
        content: 'iOS',
      },
      {
        content: 'Android',
      },
      {
        content: 'React Native',
      },
      {
        content: 'Ionic & Apache Cordova',
      },
      {
        content: 'NodeJS',
      },
      {
        content: '3D & VR',
      },
    ],
  },
];

export const SKILLS = [
  {
    title: 'Graphic Design',
    description:
      'Aristotle maintained the sharp distinction between science and the practical',
    icon: SkillIcon1,
    successRate: '90',
  },
  {
    title: 'UI/UX Design',
    description:
      'Aristotle maintained the sharp distinction between science and the practical',
    icon: SkillIcon2,
    successRate: '85',
  },
  {
    title: 'Web Application',
    description:
      'Aristotle maintained the sharp distinction between science and the practical',
    icon: SkillIcon3,
    successRate: '80',
  },
  {
    title: 'Mobile Application',
    description:
      'Aristotle maintained the sharp distinction between science and the practical',
    icon: SkillIcon4,
    successRate: '70',
  },
];

export const CLIENTS = [
  {
    image: MicrosoftLogo,
    title: 'Microsoft',
  },
  {
    image: Client2,
    title: 'Airbnb',
  },
  {
    image: Client3,
    title: 'Adidas',
  },
  {
    image: Cloudinary,
    title: 'IBM',
  },
  {
    image: Amazon,
    title: 'Amazon',
  },
  {
    image: GoogleLogo,
    title: 'Google',
  },
];

export const TESTIMONIAL = [
  {
    image: Reviewer1,
    review:
      'Another quality React-based product from RedQ Team. Manage to turn highly complex tech into simple components.',
    name: 'Jon Doe',
    designation: 'Founder & CEO',
    twitterProfile: 'https://twitter.com/redqinc',
    organization: '@Tonquin',
    organizationURL: 'https://redq.io/',
  },
  {
    image: Reviewer2,
    review:
      'Another quality React-based product from RedQ Team. Manage to turn highly complex tech into simple components.',
    name: 'Jeny Doe',
    designation: 'Co-Founder & CTO',
    twitterProfile: 'https://twitter.com/redqinc',
    organization: '@Tonquin',
    organizationURL: 'https://redq.io/',
  },
  {
    image: Reviewer3,
    review:
      'Another quality React-based product from RedQ Team. Manage to turn highly complex tech into simple components.',
    name: 'Jon Doe',
    designation: 'Co-Founder & COO',
    twitterProfile: 'https://twitter.com/redqinc',
    organization: '@Tonquin',
    organizationURL: 'https://redq.io/',
  },
];

export const FOOTER_MENU = [
  {
    label: 'Contact',
    path: '#',
  },
  {
    label: 'Privacy',
    path: '#',
  },
  {
    label: 'Cookie Policy',
    path: '#',
  },
];
