export const PASSWORD_MIN_LENGTH = 10;

export const PASSWORD_REQUIREMENTS_HINT =
  'At least 10 characters, with one number and one special character.';

export const PASSWORD_REQUIREMENTS_ERROR =
  'Password must be at least 10 characters and include at least one number and one special character.';

export function validatePassword(password: string): string | null {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return PASSWORD_REQUIREMENTS_ERROR;
  }

  if (!/\d/.test(password)) {
    return PASSWORD_REQUIREMENTS_ERROR;
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return PASSWORD_REQUIREMENTS_ERROR;
  }

  return null;
}
