import { Box, Flex, Grid } from '@maximeheckel/design-system';

import LanguageSwitcher from '@core/components/Buttons/LanguageSwitcher';
import LightDarkSwitcher from '@core/components/Buttons/LightDarkSwitcher';
import { Dock } from '@core/components/Dock';

const Header = () => {
  return (
    <Box
      as="header"
      css={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        width: '100%',
        marginTop: 24,
        marginLeft: 'auto',
        marginRight: 'auto',
        pointerEvents: 'none',
      }}
    >
      <Grid
        templateColumns="1fr auto 1fr"
        align="center"
        css={{
          width: '100%',
          paddingLeft: 16,
          paddingRight: 16,
          columnGap: 12,
          '@sm': {
            paddingLeft: 24,
            paddingRight: 24,
          },
        }}
      >
        <Grid.Item col={2} justifySelf="center" css={{ pointerEvents: 'auto' }}>
          <Dock />
        </Grid.Item>
        <Grid.Item col={3} justifySelf="end" css={{ pointerEvents: 'auto' }}>
          <Flex
            alignItems="center"
            gap={2}
            css={{
              // Keep controls from colliding with the centered dock on narrow viewports.
              maxWidth: '100%',
            }}
          >
            <LanguageSwitcher />
            <LightDarkSwitcher />
          </Flex>
        </Grid.Item>
      </Grid>
    </Box>
  );
};

export { Header };
