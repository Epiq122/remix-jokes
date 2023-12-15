import { json } from '@remix-run/node';

// this is a helper function to return accurate 404 status

export const badRequest = <T>(data: T) => json(data, { status: 400 });
