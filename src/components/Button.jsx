import React from 'react';
import { Link } from 'react-router-dom';

const buttonBase =
  'group inline-flex items-center justify-center rounded-full font-[gilroy] font-semibold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c5cdd] focus-visible:ring-offset-2';

export const buttonVariants = {
  primary: 'bg-[#171126] text-white hover:bg-[#5a3dbd]',
  secondary: 'border border-[#171126]/25 text-[#171126] hover:border-[#171126] hover:bg-[#171126] hover:text-white',
};

export const buttonSizes = {
  md: 'min-h-11 gap-3 px-6 py-3 text-sm',
  sm: 'min-h-10 gap-2 px-4 py-2 text-sm',
  icon: 'h-12 w-12 p-2.5',
  iconSm: 'h-10 w-10 p-2',
};

export const buttonClass = ({ variant = 'primary', size = 'md', className = '' } = {}) =>
  [buttonBase, buttonVariants[variant], buttonSizes[size], className].filter(Boolean).join(' ');

const Arrow = () => (
  <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-1">
    →
  </span>
);

const Button = ({ to, href, variant = 'primary', size = 'md', arrow = false, className = '', children, ...rest }) => {
  const classes = buttonClass({ variant, size, className });
  const content = (
    <>
      {children}
      {arrow ? <Arrow /> : null}
    </>
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {content}
      </Link>
    );
  }

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {content}
      </a>
    );
  }

  return (
    <button className={classes} {...rest}>
      {content}
    </button>
  );
};

export default Button;
