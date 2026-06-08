const SocialProfile = ({ items = [], className = '', iconSize = 22 }) => {
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
              <Icon size={iconSize} />
            </a>
          </div>
        );
      })}
    </div>
  );
};

export default SocialProfile;
