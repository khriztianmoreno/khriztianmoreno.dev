import React from 'react';
import { type SocialProfileItem } from '../../common/assets/data';

interface SocialProfileProps {
  items?: SocialProfileItem[];
  className?: string;
  iconSize?: number;
}

const SocialProfile = ({ items = [], className = '', iconSize = 22 }: SocialProfileProps) => {
  const classes = ['social_profiles', className].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      {items.map((item, index) => {
        const Icon = item.icon;
        return (
          <div key={`social-item-${index}`} className="social_profile_item">
            <a
              href={item.url || '#'}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="social icon"
            >
              <Icon />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default SocialProfile;
