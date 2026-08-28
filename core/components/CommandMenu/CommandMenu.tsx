import { Box, Icon, VisuallyHidden } from '@maximeheckel/design-system';
import { Command } from 'cmdk';
import { AnimatePresence, motion } from 'motion/react';
import { useRouter } from 'next/router';
import { useCallback, useContext, useEffect, useRef } from 'react';

import { ScreenReaderOnly } from '../ScreenReaderOnly';
import * as S from './CommandMenu.styles';
import { CommandMenuContext } from './CommandMenuContext';

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NAVIGATION_ITEMS = [
  { id: 'home', label: '首页', href: '/' },
  { id: 'articles', label: '文章', href: '/#articles' },
  { id: 'rss', label: 'RSS', href: '/rss.xml' },
] as const;

interface LinkItem {
  id: string;
  label: string;
  href: string;
  icon: 'Twitter' | 'Github';
  description: string;
  detail?: string;
  internal?: boolean;
}

const LINK_ITEMS: LinkItem[] = [
  {
    id: 'github',
    label: 'GitHub',
    href: 'https://github.com/cat0825',
    icon: 'Github',
    description: 'Link redirects to my GitHub profile',
    detail: 'github.com/cat0825',
  },
  {
    id: 'twitter',
    label: 'Twitter / X',
    href: 'https://twitter.com/qianyuhe',
    icon: 'Twitter',
    description: 'Link redirects to my Twitter profile',
    detail: '@qianyuhe',
  },
];

const IconMap: Record<
  LinkItem['icon'],
  React.ComponentType<{ size?: number | string }>
> = {
  Twitter: Icon.Twitter,
  Github: Icon.Github,
};

const CommandMenu = (props: CommandMenuProps) => {
  const { open, onOpenChange } = props;
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const context = useContext(CommandMenuContext);
  const actions = context?.actions ?? [];

  const handleActionSelect = useCallback(
    (onSelect: () => void) => {
      onSelect();
      onOpenChange(false);
    },
    [onOpenChange]
  );

  const handleNavigationSelect = useCallback(
    (href: string) => {
      router.push(href);
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  const handleLinkSelect = useCallback(
    (href: string, internal?: boolean) => {
      if (internal) {
        router.push(href);
      } else {
        window.open(href, '_blank', 'noopener,noreferrer');
      }
      onOpenChange(false);
    },
    [router, onOpenChange]
  );

  useEffect(() => {
    if (open) {
      const timeout = setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <Command.Dialog
          open={open}
          loop
          onOpenChange={onOpenChange}
          label="Command Menu"
        >
          <S.Overlay
            as={motion.div}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1.0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={() => onOpenChange(false)}
          />
          <S.Dialog
            as={motion.div}
            data-testid="command-menu"
            initial={{ opacity: 0, scale: 0.95, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.95, x: '-50%' }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <Box
              css={{
                position: 'relative',
                borderRadius: 'var(--border-radius-2)',
              }}
            >
              <S.CustomGlassMaterial />
              <ScreenReaderOnly as="h2">Command Menu</ScreenReaderOnly>
              <S.Input
                ref={inputRef}
                as={Command.Input}
                data-testid="command-input"
                placeholder="Type a command..."
              />
              <S.List as={Command.List}>
                <S.Empty as={Command.Empty}>No results found.</S.Empty>

                {actions.length > 0 ? (
                  <S.Group as={Command.Group} heading="Tools">
                    {actions.map((action) => {
                      const ActionIcon = action.icon;
                      return (
                        <S.Item
                          key={action.id}
                          as={Command.Item}
                          value={action.label}
                          keywords={action.keywords}
                          onSelect={() => handleActionSelect(action.onSelect)}
                        >
                          <ActionIcon size={4} />
                          <S.ItemLabel>{action.label}</S.ItemLabel>
                        </S.Item>
                      );
                    })}
                  </S.Group>
                ) : null}

                <S.Group
                  as={Command.Group}
                  heading="Navigation"
                  data-testid="navigation"
                >
                  {NAVIGATION_ITEMS.map((item) => (
                    <S.Item
                      key={item.id}
                      as={Command.Item}
                      value={item.label}
                      onSelect={() => handleNavigationSelect(item.href)}
                      data-testid={`nav-${item.id}`}
                    >
                      <Icon.Arrow size={4} />
                      <S.ItemLabel>{item.label}</S.ItemLabel>
                    </S.Item>
                  ))}
                </S.Group>

                <S.Group as={Command.Group} heading="Links" data-testid="links">
                  {LINK_ITEMS.map((item) => {
                    const ItemIcon = IconMap[item.icon];
                    return (
                      <S.Item
                        key={item.id}
                        as={Command.Item}
                        value={item.label}
                        onSelect={() =>
                          handleLinkSelect(item.href, item.internal)
                        }
                        data-testid={`link-${item.id}`}
                      >
                        <ItemIcon size={4} />
                        <S.ItemLabel>{item.label}</S.ItemLabel>
                        {item.detail ? (
                          <S.ItemDetail>{item.detail}</S.ItemDetail>
                        ) : null}
                        <VisuallyHidden as="p">
                          {item.description}
                        </VisuallyHidden>
                      </S.Item>
                    );
                  })}
                </S.Group>
              </S.List>
            </Box>
          </S.Dialog>
        </Command.Dialog>
      ) : null}
    </AnimatePresence>
  );
};

export { CommandMenu };
