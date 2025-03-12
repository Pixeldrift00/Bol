import { json, type LoaderFunction } from '@remix-run/node';
import { default as IndexRoute } from './_index';

export async function loader(args: Parameters<LoaderFunction>[0]) {
  return json({ id: args.params.id });
}

export default IndexRoute;
