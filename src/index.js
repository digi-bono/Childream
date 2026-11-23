export default {
  async fetch(request, env) {
    const user = env.BASIC_AUTH_USER;
    const pass = env.BASIC_AUTH_PASSWORD;

    // 認証情報が未設定の場合は認証なしで公開(従来の挙動と同じ)
    if (!user || !pass) {
      return env.ASSETS.fetch(request);
    }

    const authHeader = request.headers.get("Authorization");

    if (authHeader) {
      const [scheme, encoded] = authHeader.split(" ");
      if (scheme === "Basic" && encoded) {
        try {
          const decoded = atob(encoded);
          const separatorIndex = decoded.indexOf(":");
          const suppliedUser = decoded.substring(0, separatorIndex);
          const suppliedPass = decoded.substring(separatorIndex + 1);

          if (suppliedUser === user && suppliedPass === pass) {
            return env.ASSETS.fetch(request);
          }
        } catch (e) {
          // 不正なBase64は認証失敗として扱う
        }
      }
    }

    return new Response("Authentication required.", {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Restricted", charset="UTF-8"',
      },
    });
  },
};
