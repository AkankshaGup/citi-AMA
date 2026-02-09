export interface CookieOptions {
  expires?: Date;
  secure?: boolean;
  sameSite?: "Strict" | "Lax" | "None";
  path?: string;
}

export const getCookie = (name: string): string | null => {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`));

  return value ? decodeURIComponent(value.split("=")[1]) : null;
};

export const setCookie = (
  name: string,
  value: string,
  options: CookieOptions = {}
): void => {
  let cookie = `${name}=${encodeURIComponent(value)}`;

  cookie += `; path=${options.path ?? "/"}`;

  if (options.expires) {
    cookie += `; expires=${options.expires.toUTCString()}`;
  }

  if (options.secure) {
    cookie += `; Secure`;
  }

  if (options.sameSite) {
    cookie += `; SameSite=${options.sameSite}`;
  }

  document.cookie = cookie;
};
