import Script from 'next/script'

/**
 * Microsoft Clarity — free heatmaps + session recordings.
 * Reads project id from NEXT_PUBLIC_CLARITY_PROJECT_ID; renders nothing
 * locally (so dev pages stay clean). Set the env var in Vercel after
 * creating a project at https://clarity.microsoft.com.
 */
export default function MicrosoftClarity() {
  const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim()

  // Clarity project IDs are simple URL-safe identifiers. Reject anything else
  // so a malformed environment value can never break or inject this script.
  if (!projectId || !/^[A-Za-z0-9_-]+$/.test(projectId)) return null

  const serializedProjectId = JSON.stringify(projectId)

  return (
    <Script
      id="ms-clarity"
      strategy="lazyOnload"
      dangerouslySetInnerHTML={{
        __html: `
(function(c,l,a,r,i,t,y){
  c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
  t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
  y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", ${serializedProjectId});
        `.trim(),
      }}
    />
  )
}
