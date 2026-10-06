import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

// This file is web-only and used to configure the root HTML for every web page during static rendering.
// The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* Google Fonts: Cinzel & Plus Jakarta Sans */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />

        {/* Global Design System Typography Variables */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --font-display: "Cinzel", Georgia, serif;
                --font-ui: "Plus Jakarta Sans", Inter, sans-serif;
                --text-primary: #F5F6F8;
                --text-secondary: #8A91A0;
                --accent-gold: #F3BA45;
              }
              body {
                background-color: #0B0C0E;
                font-family: var(--font-ui);
                color: var(--text-primary);
                -webkit-font-smoothing: antialiased;
                -moz-osx-font-smoothing: grayscale;
              }
            `,
          }}
        />

        {/* Disable body scrolling on web. This makes ScrollView work more like native platforms */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
