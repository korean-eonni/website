import Script from 'next/script'

/**
 * Google tag for Google Ads (account 383-223-2274).
 * GTM container as provided by Google Ads on signup, plus the Ads tag
 * (AW-…) so purchase conversions can be sent from the order success page.
 */
const GOOGLE_TAG_ID = 'GTM-54X4FBLM'
export const GOOGLE_ADS_ID = 'AW-18565937147'
/** send_to for the "Покупка" conversion action */
export const GOOGLE_ADS_PURCHASE_SEND_TO = 'AW-18565937147/hzJWCJWlpbUdEPvv9pRF'

export default function GoogleTag() {
  return (
    <>
      <Script
        id="google-tag-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtm.js?id=${GOOGLE_TAG_ID}`}
      />
      <Script
        id="google-ads-src"
        strategy="afterInteractive"
        src={`https://www.googletagmanager.com/gtag/js?id=${GOOGLE_ADS_ID}`}
      />
      <Script
        id="google-tag-init"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
gtag('js', new Date());
gtag('config', '${GOOGLE_ADS_ID}');
          `.trim(),
        }}
      />
    </>
  )
}
