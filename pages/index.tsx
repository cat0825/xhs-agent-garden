import { Grid } from '@maximeheckel/design-system';
import { getAllFilesFrontMatter } from 'lib/mdx';
import { Post } from 'types/post';

import { BottomBlurGradientMask } from '@core/components/BottomBlurGradientMask';
import Footer from '@core/components/Footer';
import { Header } from '@core/components/Header';
import { Main } from '@core/components/Main';
import { ArticlesSection } from '@core/features/ArticlesSection';
import { IndexSection } from '@core/features/IndexSection';

interface Props {
  posts: Post[];
}

const NewHome = (props: Props) => {
  const { posts } = props;

  return (
    <Main>
      <Header />
      <Grid
        css={{
          position: 'relative',
          height: 'auto',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: 'var(--background)',
          borderBottomRightRadius: 4,
          borderBottomLeftRadius: 4,
        }}
        gapX={2}
        templateColumns="1fr minmax(auto, 663px) 1fr"
      >
        <IndexSection />
        <ArticlesSection posts={posts} />
      </Grid>
      <BottomBlurGradientMask />
      <Footer />
    </Main>
  );
};

export default NewHome;

export async function getStaticProps() {
  const allPosts = await getAllFilesFrontMatter();

  // Category order drives the on-page grouping; unknown ones sort last.
  const categoryOrder = ['面经', '学习路线', '岗位要求'];
  const rank = (post: Post) => {
    const index = categoryOrder.indexOf(post.categories?.[0] ?? '');
    return index === -1 ? categoryOrder.length : index;
  };

  const posts = [...allPosts].sort(
    (a, b) => rank(a) - rank(b) || a.title.localeCompare(b.title, 'zh-Hans-CN')
  );

  return { props: { posts } };
}
