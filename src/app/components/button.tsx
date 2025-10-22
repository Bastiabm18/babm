import { forwardRef } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild, children, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button';
    return (
      <Comp
        className={`inline-flex items-center justify-center rounded-md bg-primary-light dark:bg-primary-dark text-white font-semibold px-4 py-2 hover:bg-primary-light/90 dark:hover:bg-primary-dark/90 transition-colors ${className || ''}`}
        ref={ref}
        {...props}
      >
        {children}
      </Comp>
    );
  }
);

Button.displayName = 'Button';

export { Button };