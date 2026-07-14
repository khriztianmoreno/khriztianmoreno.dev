export interface Milestone {
  year: string;
  title: string;
  org: string;
  description: string;
}

export const MILESTONES: Milestone[] = [
  {
    year: '2019',
    title: 'Media Developer Expert (MDE)',
    org: 'Cloudinary',
    description:
      'Recognized for media performance and web optimization expertise.',
  },
  {
    year: '2020',
    title: 'Most Valuable Professional (MVP)',
    org: 'Microsoft',
    description:
      'Awarded for Developer Technologies & Cloud Platforms leadership.',
  },
  {
    year: '2021',
    title: 'Google Developer Expert (GDE)',
    org: 'Google',
    description: 'Named GDE in Web Technologies & W3C Standards.',
  },
  {
    year: '2021',
    title: 'AWS Community Builder',
    org: 'Amazon Web Services',
    description:
      'Selected for Cloud & Serverless Architectures contributions.',
  },
];
