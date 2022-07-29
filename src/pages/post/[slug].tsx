import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { RichText } from 'prismic-dom';
import { useMemo } from 'react';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { formatDateLikeRocketseat } from '../../utils/date';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps) {
  const router = useRouter();

  const readingTime = useMemo(() => {
    if (!post)
      return 0;

    const wordCount = post.data.content.reduce((previousCount, content) => {
      const headingWordCount = content.heading.split(/[\s.]+/).length;
      const bodyWordCount = RichText.asText(content.body).split(/[\s.]+/).length;

      return previousCount + headingWordCount + bodyWordCount;
    }, 0);

    return Math.floor(wordCount / 200) + 1;
  }, [post]);

  return (
    <>
      <Head>
        <title>{post?.data.title} - spacetraveling</title>
      </Head>
      {router.isFallback
        ? (
          <div className={`${commonStyles.contentContainer} ${styles.content}`}>
            Carregando...
          </div>
        )
        : (
          <article>
            <img className={styles.banner} src={post.data.banner.url} />
            <div className={`${commonStyles.contentContainer} ${styles.content}`}>
              <header>{post.data.title}</header>
              <div className={commonStyles.postInfoContainer}>
                <time><FiCalendar size={20} />{formatDateLikeRocketseat(post.first_publication_date)}</time>
                <span><FiUser size={20} />{post.data.author}</span>
                <span><FiClock />{readingTime} min</span>
              </div>
              <main className={commonStyles.writtenContent}>
                {post.data.content.map((contentPiece, index) => (
                  <div key={index}>
                    <h1>{contentPiece.heading}</h1>
                    <div dangerouslySetInnerHTML={{ __html: RichText.asHtml(contentPiece.body) }} />
                  </div>
                ))}
              </main>
            </div>
          </article>
        )
      }
    </>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismicClient = getPrismicClient();

  const response = await prismicClient.query(
    Prismic.Predicates.at('document.type', 'post'),
    {
      pageSize: 5,
      fetch: 'post.uid'
    }
  );

  return {
    paths: response.results.map(post => ({ params: { slug: post.uid } })),
    fallback: true
  };
};



export const getStaticProps: GetStaticProps = async ({ params }) => {
  const { slug } = params;

  const prismicClient = getPrismicClient();
  const response = await prismicClient.getByUID('posts', String(slug), {});

  const post = {
    uid: response.uid,
    first_publication_date: response.first_publication_date,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: {
        url: response.data.banner.url
      },
      author: response.data.author,
      content: response.data.content.map(content => ({
        heading: content.heading,
        body: content.body
      }))
    }
  };

  return {
    props: {
      post
    }
  }
};
