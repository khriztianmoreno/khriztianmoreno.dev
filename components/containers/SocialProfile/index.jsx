import Icon from 'react-icons-kit';
import { socialDribbbleOutline } from 'react-icons-kit/ionicons/socialDribbbleOutline';

import { SocialProfileWrapper, SocialProfileItem, IconAnchor } from './styles';

const SocialProfile = ({ items = [], className, iconSize, color }) => {
  const addAllClasses = ['social_profiles'];

  if (className) {
    addAllClasses.push(className);
  }

  return (
    <SocialProfileWrapper className={addAllClasses.join(' ')}>
      {items.map((item, index) => (
        <SocialProfileItem
          key={`social-item-${index}`}
          className="social_profile_item"
        >
          <IconAnchor
            href={item.url || '#'}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="social icon"
            color={color}
          >
            <Icon
              icon={item.icon || socialDribbbleOutline}
              size={iconSize || 22}
            />
          </IconAnchor>
        </SocialProfileItem>
      ))}
    </SocialProfileWrapper>
  );
};

export default SocialProfile;
