import { Tooltip } from '@maximeheckel/design-system';

import { useLocale } from '@core/i18n/LocaleProvider';

const LanguageSwitcher = () => {
  const { locale, toggleLocale, t } = useLocale();
  const nextLabel = locale === 'en' ? '中文' : 'EN';
  const content =
    locale === 'en'
      ? '切换到中文 / Switch to Chinese'
      : 'Switch to English / 切换到英文';

  return (
    <Tooltip id="languageSwitcherTooltip" content={content}>
      <button
        type="button"
        data-testid="language-switch"
        aria-label={t.language}
        title={t.language}
        onClick={toggleLocale}
        style={{
          WebkitAppearance: 'none',
          appearance: 'none',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minWidth: 44,
          height: 34,
          padding: '0 10px',
          border: '1px solid oklch(from var(--border-color) l c h / 60%)',
          borderRadius: 'var(--border-radius-1)',
          background: 'var(--foreground)',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          fontFamily: 'var(--font-mono)',
          fontSize: 12,
          fontWeight: 500,
          letterSpacing: '0.04em',
          outline: 'none',
          transition: 'background 0.2s, color 0.2s, box-shadow 0.3s',
        }}
      >
        {nextLabel}
      </button>
    </Tooltip>
  );
};

export default LanguageSwitcher;
