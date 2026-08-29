import { styled, Anchor, Text, Box, Flex } from '@maximeheckel/design-system';

import { HR } from '@core/components/HR';

const StyledSection = styled('section', {
  background: 'var(--background)',
  color: 'var(--text-primary)',
  paddingBottom: 48,
  width: '100%',

  '@media (max-width: 700px)': {
    paddingLeft: '20px',
    paddingRight: '20px',
  },
});

const Footnote = ({ title, url }: { title: string; url: string }) => {
  const textTwitter = `${title} — Craft Garden · 千羽鹤 ${url}`;

  return (
    <StyledSection data-testid="footnote">
      <Flex
        alignItems="start"
        direction="column"
        css={{
          maxWidth: 700,
          margin: '0 auto',
        }}
        gap="5"
      >
        <HR />
        <Text as="p">
          Liked this note? Share it on{' '}
          <Anchor
            favicon
            href={`https://twitter.com/intent/tweet?text=${encodeURI(
              textTwitter
            )}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Twitter / X
          </Anchor>
          , or browse more writing from the home page. Feedback and pointers
          welcome via{' '}
          <Anchor
            href="https://twitter.com/qianyuhe"
            target="_blank"
            rel="noopener noreferrer"
          >
            @qianyuhe
          </Anchor>
          .
        </Text>

        <Box>
          <Text as="p" variant="primary">
            Thanks for reading.
          </Text>
          <Flex alignItems="start">
            <Text as="p" variant="primary">
              – 千羽鹤
            </Text>
          </Flex>
        </Box>
      </Flex>
    </StyledSection>
  );
};

export { Footnote };
