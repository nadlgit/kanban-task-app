type IconProps = {
  imgSrc: string;
  imgAccessibleName?: string;
  className?: string;
};

export const Icon = ({ imgSrc, imgAccessibleName, className }: IconProps) => {
  const maskImage = `url(${imgSrc})`;
  const maskSize = 'cover';
  const accessibleName = imgAccessibleName ?? '';
  return (
    <i
      role="img"
      title={accessibleName}
      aria-label={accessibleName}
      style={{
        display: 'inline-block',
        maskImage,
        WebkitMaskImage: maskImage,
        maskSize,
        WebkitMaskSize: maskSize,
        backgroundColor: 'currentColor',
      }}
      className={className ?? ''}
    />
  );
};
