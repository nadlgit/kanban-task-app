type IconProps = {
  imgSrc: string;
  imgAccessibleName?: string;
  className?: string;
};

export const Icon = ({ imgSrc, imgAccessibleName, className }: IconProps) => {
  const ariaHidden = !imgAccessibleName;
  const maskImage = `url(${imgSrc})`;
  const maskSize = 'cover';
  const commonProps = {
    style: {
      display: 'inline-block',
      maskImage,
      WebkitMaskImage: maskImage,
      maskSize,
      WebkitMaskSize: maskSize,
      backgroundColor: 'currentColor',
    },
    className: className ?? '',
  };

  return ariaHidden ? (
    <i aria-hidden {...commonProps} />
  ) : (
    <i role="img" title={imgAccessibleName} aria-label={imgAccessibleName} {...commonProps} />
  );
};
