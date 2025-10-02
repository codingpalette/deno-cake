import { define } from "../utils.ts";

export default define.page(function App({ Component }) {
  return (
    <html lang="ko" data-theme="light">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>note</title>
      </head>
      <body>
        <Component />
      </body>
    </html>
  );
});
