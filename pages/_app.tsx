import {
  globalStyles,
  ThemeProvider,
  Tooltip,
} from '@maximeheckel/design-system';
import { AppProps } from 'next/app';
import 'katex/dist/katex.min.css';
import 'styles/global.css';
import Head from 'next/head';

import { CommandMenuProvider } from '@core/components/CommandMenu';
import { Fonts } from '@core/components/Fonts';
import { DefaultSeo } from '@core/components/Seo';
import { LocaleProvider } from '@core/i18n/LocaleProvider';

const Meta = () => {
  return (
    <>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
        <meta name="format-detection" content="telephone=no" />
      </Head>
      <DefaultSeo />
    </>
  );
};

const App = ({ Component, pageProps }: AppProps) => {
  globalStyles();

  return (
    <>
      <Meta />
      <Fonts />
      <ThemeProvider>
        <LocaleProvider>
          <CommandMenuProvider>
            <Tooltip.Provider>
              <Component {...pageProps} />
            </Tooltip.Provider>
          </CommandMenuProvider>
        </LocaleProvider>
      </ThemeProvider>
    </>
  );
};
export default App;
