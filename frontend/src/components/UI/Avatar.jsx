const avatarColors = [
  '#0052CC',
  '#6554C0',
  '#00875A',
  '#DE350B',
  '#FF8B00',
  '#00A3BF',
  '#42526E',
  '#C93756',
  '#6A5ACD',
  '#2684FF',
];

const sizeClasses = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-xl',
};

const getInitials = (name = '') => {
  return name.trim().charAt(0).toUpperCase() || '?';
};

const getAvatarColor = (name = '') => {
  const normalizedName = name.trim().toLowerCase();

  const colorIndex =
      [...normalizedName].reduce(
          (total, character) => total + character.charCodeAt(0),
          0
      ) % avatarColors.length;

  return avatarColors[colorIndex];
};

const Avatar = ({
                  user,
                  size = 'md',
                  className = '',
                  showStatus = false,
                  showImage = false,
                }) => {
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  const name =
      user?.name?.trim() ||
      user?.email?.trim() ||
      'Unknown user';

  const initials = getInitials(name);
  const backgroundColor = getAvatarColor(name);

  return (
      <span
          className={`relative inline-flex shrink-0 ${className}`}
          title={name}
          aria-label={name}
      >
      {showImage && user?.avatar ? (
          <img
              src={user.avatar}
              alt={name}
              className={`${sizeClass} rounded-full border border-white object-cover shadow-sm`}
          />
      ) : (
          <span
              className={`${sizeClass} inline-flex items-center justify-center rounded-full border-2 border-white font-bold text-white shadow-sm`}
              style={{ backgroundColor }}
          >
          {initials}
        </span>
      )}
    </span>
  );
};

export { getInitials, getAvatarColor };
export default Avatar;