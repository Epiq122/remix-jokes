// eslint-disable-next-line import/namespace
import type { ActionFunctionArgs } from '@remix-run/node';
import { redirect } from '@remix-run/node';
import { useActionData } from '@remix-run/react';

// eslint-disable-next-line import/no-unresolved
import { db } from '~/utils/db.server';
import { badRequest } from '~/utils/request.server';

function validateJokeContent(content: string) {
  if (content.length < 10) {
    return 'Joke content must be at least 10 characters long.';
  }
}

function validateJokeName(name: string) {
  if (name.length < 3) {
    return 'Joke name must be at least 3 characters long.';
  }
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const content = form.get('content');
  const name = form.get('name');
  // we do this type check to be extra sure and to make TypeScript happy
  // we'll explore validation next!
  if (typeof content !== 'string' || typeof name !== 'string') {
    return badRequest({
      fieldErrors: null,
      field: null,
      formError: 'Form not submitted correclty',
    });
  }

  const fieldErrors = {
    content: validateJokeContent(content),
    name: validateJokeName(name),
  };

  const fields = { content, name };

  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields, formError: null });
  }

  const joke = await db.joke.create({ data: fields });
  return redirect(`/jokes/${joke.id}`);
};

export default function NewJokeRoute() {
  const actionData = useActionData<typeof action>();
  return (
    <div>
      <p>Add your own hilarious joke</p>
      <form method='post'>
        <div>
          <label>
            Name:
            <input
              type='text'
              name='name'
              defaultValue={actionData?.fields?.name}
              aria-invalid={Boolean(actionData?.fieldErrors?.name)}
              aria-errormessage={
                actionData?.fieldErrors?.name ? 'nameError' : undefined
              }
            />
          </label>
          {actionData?.fieldErrors?.name ? (
            <p className='form-validation-error' id='name-error' role='alert'>
              {actionData.fieldErrors.name}
            </p>
          ) : null}
        </div>
        <div>
          <label>
            Content:{''}
            <textarea
              defaultValue={actionData?.fields?.contennt}
              name='content'
              aria-invalid={Boolean(actionData?.fieldErrors?.content)}
              aria-errormessage={
                actionData?.fieldErrors?.content ? 'contentError' : undefined
              }
            ></textarea>
          </label>
          {actionData?.fieldErrors?.content ? (
            <p
              className='form-validation-error'
              id='content-error'
              role='alert'
            >
              {actionData.fieldErrors.content}
            </p>
          ) : null}
        </div>
        {actionData?.formError ? (
          <p className='form-validation-error' role='alert'>
            {actionData.formError}
          </p>
        ) : null}
        <div>
          <button type='submit' className='button'>
            Add
          </button>
        </div>
      </form>
    </div>
  );
}
