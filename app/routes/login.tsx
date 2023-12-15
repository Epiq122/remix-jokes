import type { LinksFunction, ActionFunctionArgs } from '@remix-run/node';
import { Link, useSearchParams, useActionData } from '@remix-run/react';
import { db } from '~/utils/db.server';
import { badRequest } from '~/utils/request.server';
import { createUserSession, login } from '~/utils/session.server';
import stylesUrl from '~/styles/login.css';

export const links: LinksFunction = () => [
  { rel: 'stylesheet', href: stylesUrl },
];

function validateUsername(username: string) {
  if (username.length < 3) {
    return 'Username must be at least 3 characters long.';
  }
}

function validatePassword(password: string) {
  if (password.length < 6) {
    return 'Password must be at least 3 characters long.';
  }
}

function validateUrl(url: string) {
  const urls = ['/jokes', '/', 'https://remix.run'];
  if (urls.includes(url)) {
    return url;
  }
  return '/jokes';
}

export const action = async ({ request }: ActionFunctionArgs) => {
  const form = await request.formData();
  const loginType = form.get('loginType');
  const username = form.get('username');
  const password = form.get('password');
  const redirectTo = validateUrl(
    (form.get('redirectTo') as string) || '/jokes',
  );
  if (
    typeof loginType !== 'string' ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    return badRequest({
      fieldErrors: null,
      field: null,
      formError: 'Form not submitted correctly',
    });
  }
  const fields = { loginType, password, username };
  const fieldErrors = {
    username: validateUsername(username),
    password: validatePassword(password),
  };
  if (Object.values(fieldErrors).some(Boolean)) {
    return badRequest({ fieldErrors, fields, formError: null });
  }

  switch (loginType) {
    case 'login': {
      // login to get the user
      const user = await login({ username, password });
      console.log({ user });

      // if there is no user, return the fieldss and a formError
      if (!user) {
        return badRequest({
          fieldErrors: null,
          fields,
          formError: 'Username or password is incorrect',
        });
      }
      return createUserSession(user.id, redirectTo);
    }
    case 'register': {
      const userExists = await db.user.findFirst({
        where: { username },
      });
      if (userExists) {
        return badRequest({
          fieldErrors: { username: 'Username already exists' },
          fields,
          formError: null,
        });
      }
      //create the user
      // create thier session and redirect to /jokes
      return badRequest({ fieldErrors, fields, formError: 'Not implemented' });
    }
    default: {
      return badRequest({
        fieldErrors: null,
        fields: null,
        formError: 'Login type invalid',
      });
    }
  }
};

export default function Login() {
  const actionData = useActionData<typeof action>();
  const [searchParams] = useSearchParams();
  return (
    <div className='container'>
      <div className='content' data-light=''>
        <h1>Login</h1>
        <form method='post'>
          <input
            type='hidden'
            name='redirectTo'
            value={searchParams.get('redirectTo') ?? undefined}
          />
          <fieldset>
            <legend className='sr-only'>Login or Register?</legend>
            <label>
              <input
                type='radio'
                name='loginType'
                value='login'
                defaultChecked={
                  !actionData?.fields?.loginType ||
                  actionData?.fields?.loginType === 'login'
                }
              />
              {''}
              Login
            </label>
            <label>
              <input
                type='radio'
                name='loginType'
                value='register'
                defaultChecked={actionData?.fields?.loginType === 'register'}
              />
              {''}
              Register
            </label>
          </fieldset>
          <div>
            <label htmlFor='username-input'>Username</label>
            <input
              type='text'
              id='username-input'
              name='username'
              defaultValue={actionData?.fields?.username}
              aria-invalid={Boolean(actionData?.fieldErrors?.username)}
              aria-errormessage={
                actionData?.fieldErrors?.username ? 'username-error' : undefined
              }
            />
            {actionData?.fieldErrors?.username ? (
              <p
                className='form-validation-error'
                id='username-error'
                role='alert'
              >
                {actionData.fieldErrors.username}
              </p>
            ) : null}
          </div>
          <div>
            <label htmlFor='password-input'>Password</label>
            <input
              type='password'
              id='password-input'
              name='password'
              defaultValue={actionData?.fields?.password}
              aria-invalid={Boolean(actionData?.fieldErrors?.password)}
              aria-errormessage={
                actionData?.fieldErrors?.password ? 'password-error' : undefined
              }
            />
            {actionData?.fieldErrors?.password ? (
              <p
                className='form-validation-error'
                role='alert'
                id='password-error'
              >
                {actionData.fieldErrors.password}
              </p>
            ) : null}
          </div>
          <div id='form-error-message'>
            {actionData?.formError ? (
              <p className='form-validation-error' role='alert'>
                {actionData.formError}
              </p>
            ) : null}
          </div>
          <button type='submit' className='button'>
            Submit
          </button>
        </form>
        <div className='links'>
          <ul>
            <li>
              <Link to='/'>Home</Link>
            </li>
            <li>
              {' '}
              <Link to='/jokes'>Jokes</Link>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
