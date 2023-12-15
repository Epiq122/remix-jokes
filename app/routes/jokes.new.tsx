import { authenticator } from "~/services/auth.server";
import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { db } from '../utils/db.server';

export const action = async ({ request }: ActionFunctionArgs) => {
  await authenticator.isAuthenticated(request, { failureRedirect: "/login" });

  const form = await request.formData();
  const content = form.get('content');
  const name = form.get('name');

  if (typeof content !== 'string' || typeof name !== 'string') {
    throw new Error('Invalid form submission');
  }

  const fields = { content, name };
  const joke = await db.joke.create({ data: fields });
  return redirect(`/jokes/${joke.id}`);
};
export default function NewJokeRoute() {
  return (
    <div>
      <p>Add your own joke!</p>
      <form action='post'>
        <div>
          <label>
            Name: <input type='text' name='name'></input>
          </label>
        </div>
        <div>
          <label>
            Content: <textarea name='content'></textarea>
          </label>
        </div>
        <div>
          <button type='submit' className='button'>
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
