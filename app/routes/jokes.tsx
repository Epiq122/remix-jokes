import { Outlet, Link, useLoaderData } from '@remix-run/react';
import type { LinksFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { db } from '../utils/db.server';

import stylesUrl from '../styles/jokes.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

/**
 * Loads the joke list items from the database.
 * @returns {Promise<{ jokeListItems: Joke[] }>} The joke list items.
 */
export const loader = async () => {
  return json({
    jokeListItems: await db.joke.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true },
      take: 10,
    }),
  });
};

export default function JokesRoute() {
  const data = useLoaderData<typeof loader>();

  return (
    <div className='jokes-layout'>
      <header className='jokes-header'>
        <div className='container'>
          <h1 className='home-link'>
            <Link to='/' title='Remix Jokes' aria-label='Remix Jokes'>
              <span className='logo'>🤪</span>
              <span className='logo-medium'>J🤪KES</span>
            </Link>
          </h1>
        </div>
      </header>
      <main className='jokes-main'>
        <div className='container'>
          <div className='jokes-list'>
            <Link to='.'>Get a random joke</Link>
            <p>Here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map(({ id, name }) => (
                <li key={id}>
                  <Link to={id}>{name}</Link>
                </li>
              ))}
            </ul>
            <Link to='new' className='button'>
              Add your own
            </Link>
          </div>
          <div className='jokes-outlet'>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
