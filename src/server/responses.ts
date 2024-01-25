/** Returns a 403 Forbidden */
export const Forbidden = (message: string, config: ResponseInit = {}) => {
  return new Response(message, {
    statusText: "Forbidden",
    ...config,
    status: 403,
  });
};

/** Returns a 404 Not Found */
export const NotFound = (message: string, config: ResponseInit = {}) => {
  return new Response(message, {
    statusText: "Not Found",
    ...config,
    status: 404,
  });
};

/** Redirects using HTML rather than an HTTP response code, to e.g. support setting cookies */
export const HTMLRedirect = (url: string, config: ResponseInit = {}) => {
  return new Response(
    `<html lang="en">
        <head>
          <meta charset="utf-8">
        </head>
        <body>
          <noscript>
            <meta http-equiv="refresh" content="0; url=${url}" />
          </noscript>
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
      ...config,
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
