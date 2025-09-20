import React from 'react';

// Fix: Extend props with React.HTMLAttributes<HTMLElement> to allow passing standard HTML attributes like onSubmit.
interface CardProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
}

const Card: React.FC<CardProps> = ({ children, className = '', as: Component = 'div', ...rest }) => {
  return (
    // Fix: Spread `...rest` props to the underlying component to pass them through.
    <Component className={`bg-light-bg dark:bg-dark-bg p-4 sm:p-6 rounded-2xl shadow-neumorphic-outset dark:shadow-dark-neumorphic-outset ${className}`} {...rest}>
      {children}
    </Component>
  );
};

export default Card;
