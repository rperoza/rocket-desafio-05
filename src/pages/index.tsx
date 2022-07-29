import { GetStaticProps } from 'next';
import Prismic from '@prismicio/client';
import Head from 'next/head';
import Link from 'next/link';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { RichText } from 'prismic-dom';
import { useState } from 'react';
import { formatDateLikeRocketseat } from '../utils/date';
import ApiSearchResponse from '@prismicio/client/types/ApiSearchResponse';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({ postsPagination: { next_page, results } }: HomeProps) {
  const [postData, setPostData] = useState(results);
  const [nextPageFetchLink, setNextPageFetchLink] = useState<string>(next_page);

  async function handleFetchMoreClick() {
    if (!nextPageFetchLink) {
      console.log('There are no more posts to be loaded');
      return;
    }

    const response = await fetch(nextPageFetchLink)
      .then(response => response.json()
      .then((data: ApiSearchResponse) => data));

    const newPosts: Post[] = response.results.map(post => ({
      uid: post.uid,
      first_publication_date: formatDateLikeRocketseat(post.first_publication_date),
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }));


    setPostData(postData.concat(newPosts));
    setNextPageFetchLink(response.next_page);
  }

  return (
    <>
      <Head>
        <title>spacetraveling</title>
      </Head>
      <div className={`${styles.container} ${commonStyles.contentContainer}`}>
        {postData.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <article>
              <header>{post.data.title}</header>
              <p>{post.data.subtitle}</p>

              <footer>
                <time><FiCalendar size={20}/>{formatDateLikeRocketseat(post.first_publication_date)}</time>
                <span><FiUser size={20}/>{post.data.author}</span>
              </footer>
            </article>
          </Link>
        ))}

        {nextPageFetchLink !== undefined && nextPageFetchLink !== null
          && (
            <p
              className={styles.loadMore}
              onClick={handleFetchMoreClick}
            >
              Carregar mais posts
            </p>
          )
        }
      </div>
    </>
  )
}

export const getStaticProps: GetStaticProps<HomeProps> = async () => {
  const prismicClient = getPrismicClient();

  const response = await prismicClient.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 1,
      fetch: ['post.title', 'post.subtitle', 'post.author']
    }
  );

  const posts: Post[] = response.results.map(post => (
    {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author
      }
    }
  ));

  return {
    props: {
      postsPagination: {
        next_page: response.next_page,
        results: posts
      }
    }
  };
};
