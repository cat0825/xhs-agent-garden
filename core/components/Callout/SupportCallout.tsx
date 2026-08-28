import { EM, Text, styled } from '@maximeheckel/design-system';

/**
 * Static-only note: Maxime's buy-me-a-coffee / supporters API is not
 * available on Craft Garden. Keep a quiet end-of-post marker instead of
 * a dead external CTA that 404s on Cloudflare Pages.
 */
const StyledCallout = styled('aside', {
  position: 'relative',
  padding: '16px 16px',
  borderRadius: 'var(--border-radius-1)',
  color: 'var(--text-primary)',
  border: '1px solid var(--emphasis)',
  background: 'var(--callout-background, var(--foreground))',
  overflow: 'hidden',
  width: '100%',
  display: 'inline-grid',
  gap: 'var(--space-5)',
});

const SupportCallout = () => {
  return (
    <StyledCallout>
      <Text as="span" weight="4">
        Thanks for reading.
      </Text>
      <Text>
        This garden is a personal notes site. If a passage was useful, take it
        into your own stack — that&apos;s the whole point.
      </Text>
      <Text>
        <EM>Craft Garden · 千羽鹤</EM>
      </Text>
    </StyledCallout>
  );
};

export default SupportCallout;
