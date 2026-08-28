// Components
import {
  Anchor,
  Blockquote,
  Button,
  Card,
  Details,
  InlineCode,
  List,
  Pill,
  Text,
  EM,
  Strong,
} from '@maximeheckel/design-system';

import BeforeAfterImage from '@core/components/BeforeAfterImage';
import Callout from '@core/components/Callout';
import Code from '@core/components/Code';
import { FootnoteRef, FootnotesList } from '@core/components/Footnotes';
import Fullbleed from '@core/components/Fullbleed';
import H2 from '@core/components/H2';
import VideoPlayer from '@core/components/VideoPlayer';

import Image from './Image';
import InlineMath from './InlineMath';

const MDXComponents = {
  // Replace the default anchor tag by the Anchor component with underline set to true: this is the default link
  a: function A(props: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
    return (
      <Anchor external={props.href?.includes('https')} underline {...props} />
    );
  },
  Anchor,
  BeforeAfterImage,
  Button,
  blockquote: Blockquote,
  Callout,
  Card,
  CardBody: Card.Body,
  Details,
  em: EM,
  Fullbleed,
  FootnoteRef,
  FootnotesList,
  h2: H2,
  h3: function H3(props: React.HTMLAttributes<HTMLHeadingElement>) {
    return <Text as="h3" variant="primary" weight="3" {...props} />;
  },
  Image,
  InlineMath,
  code: InlineCode,
  li: List.Item,
  ol: function OL(props: React.OlHTMLAttributes<HTMLOListElement>) {
    return <List variant="ordered" {...props} />;
  },
  p: function P(props: React.HTMLAttributes<HTMLParagraphElement>) {
    return <Text as="p" {...props} />;
  },
  Pill,
  pre: Code,
  strong: Strong,
  ul: function UL(props: React.HTMLAttributes<HTMLUListElement>) {
    return <List variant="unordered" {...props} />;
  },
  VideoPlayer,
};

export default MDXComponents;
