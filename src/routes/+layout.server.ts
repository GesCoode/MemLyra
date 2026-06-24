import type { LayoutServerLoad } from './$types';
import { getAppUrl } from '$lib/server/appUrl';

export const load: LayoutServerLoad = async ({ locals, url }) => {
  return {
    user: locals.user,
    appUrl: getAppUrl(url)
  };
};
