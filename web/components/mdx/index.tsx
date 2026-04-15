import Callout from './Callout';
import ProgressCheck from './ProgressCheck';
import QuizBox from './QuizBox';
import TerminalSandbox from './TerminalSandbox';

/**
 * MDX component registry — passed to <MDXRemote components={mdxComponents} />.
 * Extend this as new components are built.
 */
export const mdxComponents = {
  Callout,
  ProgressCheck,
  QuizBox,
  TerminalSandbox,
} as const;
