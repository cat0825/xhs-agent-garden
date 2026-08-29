import { cleanup, render } from '@testing-library/react';
import React from 'react';
import { it, describe, expect } from 'vitest';

import { LocaleProvider } from '@core/i18n/LocaleProvider';

import Footer from '..';

describe('Footer', () => {
  beforeEach(cleanup);

  it('renders the Footer without the table of contents', () => {
    const { getByTestId } = render(
      <LocaleProvider>
        <Footer />
      </LocaleProvider>
    );
    expect(getByTestId('footer')).toBeDefined();
  });
});
