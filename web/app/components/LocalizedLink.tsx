import {Link, type LinkProps} from 'react-router';
import {useLocale} from '~/hooks/useLocale';

interface LocalizedLinkProps extends Omit<LinkProps, 'to'> {
  to: string;
  children: React.ReactNode;
}

export function LocalizedLink({to, children, ...props}: LocalizedLinkProps) {
  try {
    const {currentLocale} = useLocale();

    // Handle undefined or null 'to' prop
    if (!to) {
      console.warn('LocalizedLink: "to" prop is undefined or null');
      return <span>{children}</span>;
    }

    // Ensure currentLocale is valid
    if (!currentLocale || !currentLocale.pathPrefix) {
      console.warn('LocalizedLink: No valid locale found, using default');
      return (
        <Link to={to} {...props}>
          {children}
        </Link>
      );
    }

    // If it's an external URL or already has a locale prefix, don't modify it
    if (to.startsWith('http') || to.startsWith('//') || to.includes('://')) {
      return (
        <Link to={to} {...props}>
          {children}
        </Link>
      );
    }

    // Add locale prefix to internal routes
    const localizedTo = currentLocale.pathPrefix + to;

    return (
      <Link to={localizedTo} {...props}>
        {children}
      </Link>
    );
  } catch (error) {
    console.error('LocalizedLink error:', error);
    // Fallback to regular link if there's an error
    return (
      <Link to={to} {...props}>
        {children}
      </Link>
    );
  }
}

// Also export a localized NavLink for navigation menus
export function LocalizedNavLink({to, children, ...props}: LocalizedLinkProps) {
  try {
    const {currentLocale} = useLocale();

    // Handle undefined or null 'to' prop
    if (!to) {
      console.warn('LocalizedNavLink: "to" prop is undefined or null');
      return <span>{children}</span>;
    }

    // Ensure currentLocale is valid
    if (!currentLocale || !currentLocale.pathPrefix) {
      console.warn('LocalizedNavLink: No valid locale found, using default');
      return (
        <Link to={to} {...props}>
          {children}
        </Link>
      );
    }

    // If it's an external URL or already has a locale prefix, don't modify it
    if (to.startsWith('http') || to.startsWith('//') || to.includes('://')) {
      return (
        <Link to={to} {...props}>
          {children}
        </Link>
      );
    }

    // Add locale prefix to internal routes
    const localizedTo = currentLocale.pathPrefix + to;

    return (
      <Link to={localizedTo} {...props}>
        {children}
      </Link>
    );
  } catch (error) {
    console.error('LocalizedNavLink error:', error);
    // Fallback to regular link if there's an error
    return (
      <Link to={to} {...props}>
        {children}
      </Link>
    );
  }
}
