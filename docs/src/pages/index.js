import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';
import books from '../data/books';

export default function Home() {
  return (
    <Layout description="Training books for BBj and DWC developers.">
      <main className="container margin-vert--xl">
        <Heading as="h1">BASIS Training Books</Heading>
        <p className="margin-bottom--lg">Pick a book and start reading.</p>
        <section className="row topics-section">
          {books.map((b) => (
            <article key={b.id} className={`col col--6 margin-bottom--lg book-icon--${b.id}`}>
              <Link to={b.to} className="card padding--lg book-card">
                <span className="book-card__icon" aria-hidden="true" />
                <Heading as="h2">{b.title}</Heading>
                <p>{b.description}</p>
              </Link>
            </article>
          ))}
        </section>
      </main>
    </Layout>
  );
}
