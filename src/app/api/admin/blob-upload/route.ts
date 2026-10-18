import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { isAuthedRequest } from '@/lib/adminAuth'

/**
 * Client-direct photo upload for the admin panel.
 *
 * Product photos used to travel inside the "add/edit product" Server Action,
 * but Vercel caps a Server Action's request body at 4.5 MB — a hard platform
 * limit no config changes. A single phone photo is often larger, so the whole
 * submit was rejected before our code ran and the save silently did nothing.
 *
 * Now the browser uploads each file straight to Vercel Blob and the form only
 * carries the resulting URLs. This route hands out the short-lived upload token
 * and is the ONLY place a token is minted, so uploading still requires an admin
 * session — the token is granted only when the admin cookie checks out and the
 * target path is under `products/`.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // Only a signed-in admin may upload, and only into the products folder.
        if (!isAuthedRequest(request)) {
          throw new Error('Доступ лише для адміністратора')
        }
        if (!pathname.startsWith('products/')) {
          throw new Error('Невірний шлях для фото')
        }
        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/avif',
            'image/gif',
          ],
          // Phone photos can be a few MB; keep headroom but cap abuse.
          maximumSizeInBytes: 15 * 1024 * 1024,
          // A random suffix keeps re-uploads of the same name from colliding.
          addRandomSuffix: true,
        }
      },
      // Fires on Vercel once the upload finishes. We don't persist here — the
      // URL is saved when the admin submits the product form — so this is a
      // no-op. (It is not called at all in local dev, which is fine.)
      onUploadCompleted: async () => {},
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
