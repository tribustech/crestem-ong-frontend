/**
 * Query param that carries the first-login signal from the login form to the
 * NGO dashboard. It is stripped as soon as the prompt is answered, so it never
 * lingers in the URL the admin keeps browsing with.
 */
export const FIRST_LOGIN_PARAM = "bunvenit";
