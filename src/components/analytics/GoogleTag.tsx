import Script from 'next/script'

/**
 * Google tag for Google Ads (account 383-223-2274).
 * Snippet as provided by Google Ads on campaign signup.
 */
const GOOGLE_TAG_ID = 'GTM-54X4FBLM'

export default function GoogleTag() {
  return (
    <>
      <Script
        id="google-tag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${GOOGLE_TAG_ID}`}
      />
      <Script
        id="google-tag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
          `.trim(),
        }}
      />
    </>
  )
}
