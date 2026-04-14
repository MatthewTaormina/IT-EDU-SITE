import Callout from './Callout';

/**
 * MDX component registry — passed to <MDXRemote components={mdxComponents} />.
 * Extend this as new components are built.
 */
export const mdxComponents = {
  Callout,
} as const;
