export async function onRequest(context) {
  const { request, env, next } = context;

  const user = env.BASIC_AUTH_USER;
  const pass = env.BASIC_AUTH_PASSWORD;

  if (!user || !pass) {
    return next();
  }

  const authHeader = request.headers.get("Authorization");

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(" ");
    if (scheme === "Basic" && encoded) {
      const decoded = atob(encoded);
      const separatorIndex = decoded.indexOf(":");
      const suppliedUser = decoded.substring(0, separatorIndex);
      const suppliedPass = decoded.substring(separatorIndex + 1);

      if (suppliedUser === user && suppliedPass === pass) {
        return next();
      }
    }
  }

  return new Response("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Restricted", charset="UTF-8"',
    },
  });
}
