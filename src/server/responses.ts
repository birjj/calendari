/** Returns a 400 Bad Request */
export const BadRequest = (message: string, config: ResponseInit = {}) => {
  const resp = new Response(message, {
    statusText: "Bad Request",
    ...config,
    status: 400,
  });
  resp.friendlyDescription = message;
  return resp;
};

/** Returns a 403 Forbidden */
export const Forbidden = (message: string, config: ResponseInit = {}) => {
  const resp = new Response(message, {
    statusText: "Forbidden",
    ...config,
    status: 403,
  });
  resp.friendlyDescription = message;
  return resp;
};

/** Returns a 404 Not Found */
export const NotFound = (message: string, config: ResponseInit = {}) => {
  const resp = new Response(message, {
    statusText: "Not Found",
    ...config,
    status: 404,
  });
  resp.friendlyDescription = message;
  return resp;
};

/** Redirects using HTML rather than an HTTP response code, to e.g. support setting cookies */
export const HTMLRedirect = (
  url: string,
  config: ResponseInit & { redirectText?: string } = {}
) => {
  const { redirectText = "Please wait.", ...restConfig } = config;
  return new Response(
    `<html lang="en">
        <head>
          <meta charset="utf-8">
        </head>
        <body style="background:#13151a;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;color:white;font-size:24px">
          <noscript>
            <meta http-equiv="refresh" content="0; url=${url}" />
          </noscript>
          <p style="text-align:center"><a href=${JSON.stringify(
            url
          )} style="background-image:linear-gradient(20deg, oklch(72% 0.25 3) 0%, oklch(92% 0.17 98) 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-size:300%;background-position:0%;text-decoration:none">
            Redirecting you.</a> ${redirectText}</p>
        </body>
        <script>
          setTimeout(function() {
            if (window.location.replace) {
              window.location.replace(${JSON.stringify(url)});
            } else {
              window.location.href = ${JSON.stringify(url)};
            }
          }, 0)
        </script>
      </html>
      `,
    {
      ...restConfig,
      status: 200,
      statusText: "OK",
      headers: {
        ...config.headers,
        "Cache-Control": "no-cache",
        "Content-Type": "text/html",
      },
    }
  );
};
