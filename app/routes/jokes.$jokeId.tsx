import type { LoaderFunctionArgs } from '@remix-run/node';
import { json } from '@remix-run/node';
import { db } from '../utils/db.server';
import { Link, useLoaderData } from '@remix-run/react';

// This is a loader function for the Remix route 'jokes.$jokeId.tsx'.
// It takes an object with route parameters as an argument.
// It uses the 'jokeId' parameter to fetch a unique joke from the database.
// If the joke is found, it returns a JSON response with the joke object.
// If the joke is not found, it returns a JSON response with a 'Joke not found' message and a 404 status code.
/**
 * Loads a joke based on the provided jokeId.
 * @param params - The parameters object containing the jokeId.
 * @returns A JSON response containing the joke if found, or a 404 error message if not found.
 */
export const loader = async ({ params }: LoaderFunctionArgs) => {
  const joke = await db.joke.findUnique({
    where: { id: params.jokeId },
  });
  if (!joke) {
    return json({ message: 'Joke not found' }, { status: 404 });
  }
  return json({ joke });
};

export default function JokeRoute() {
  const data = useLoaderData<typeof loader>();

  if ('joke' in data)
    return (
      <div>
        <p>Another hilarious joke!</p>
        <p>{data.joke.content}</p>
        <Link to='.'>{data.joke.name} Permalink</Link>
      </div>
    );
}
