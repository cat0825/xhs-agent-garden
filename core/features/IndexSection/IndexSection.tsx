import { Box, Flex, Grid, Text } from '@maximeheckel/design-system';
import dynamic from 'next/dynamic';

import Headline from '@core/components/Headline';
import { useLocale } from '@core/i18n/LocaleProvider';

const Scene = dynamic(() => import('./Scene').then((mod) => mod.Scene), {
  ssr: false,
});

const IndexSection = () => {
  const { t } = useLocale();

  return (
    <>
      <Scene />
      <Grid.Item
        col={2}
        justifySelf="center"
        css={{
          display: 'flex',
          alignItems: 'end',
          justifyContent: 'center',
          minHeight: 'clamp(400px, 70dvh, 600px)',
        }}
      >
        <Box
          id="index"
          css={{
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </Grid.Item>
      <Grid.Item col={2}>
        <Flex
          alignItems="start"
          css={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 'var(--space-4)',
            padding: '0 var(--space-4)',

            '@media (min-width: 663px)': {
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 'var(--space-4)',
            },
          }}
        >
          <Flex
            css={{
              flexDirection: 'column',
              gap: 'var(--space-5)',
              alignItems: 'start',
              justifyContent: 'space-between',
            }}
          >
            <Headline>{t.introHeadline}</Headline>
            <Text
              as="p"
              css={{
                textAlign: 'left',
                letterSpacing: '-0.25px',
              }}
              variant="secondary"
              size="3"
              weight="3"
            >
              {t.introLeadBefore}{' '}
              <Text as="span" variant="primary" weight="4" size="3">
                {t.introLeadName}
              </Text>
              {t.introLeadAfter}{' '}
              <Text as="span" variant="primary" weight="4" size="3">
                {t.introLeadTopics}
              </Text>
              {t.introLeadEnd}
            </Text>
          </Flex>
          <Text
            as="p"
            css={{
              textAlign: 'left',
              letterSpacing: '-0.25px',
            }}
            variant="secondary"
            size="3"
            weight="3"
          >
            {t.introSide}{' '}
            <Text as="span" style={{ fontStyle: 'italic' }} weight="3" size="3">
              {t.introSideEmphasis}
            </Text>
            {t.introSideEnd}
          </Text>
        </Flex>
      </Grid.Item>
    </>
  );
};

export { IndexSection };
