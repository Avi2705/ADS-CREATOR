import { Request, Response } from 'express';
import SocialAccount, { SocialPost } from './social.model';
import { renderAndUploadAdBanner } from '../creatives/adBannerRenderer.service';

const fetchFn = global.fetch;

if (!fetchFn) {
  throw new Error(
    'Global fetch is not available. Use Node.js 18+.'
  );
}

// ============================================================
// PHONE NUMBER NORMALIZATION UTILITY
// ============================================================

export function normalizeWhatsAppNumber(rawPhone: string): { isValid: boolean; normalizedNumber?: string; error?: string } {
  if (!rawPhone || typeof rawPhone !== 'string') {
    return { isValid: false, error: 'Recipient phone number is required' };
  }

  // Remove all non-digit characters
  const digits = rawPhone.replace(/\D/g, '');

  if (!digits) {
    return { isValid: false, error: 'Recipient phone number contains no valid digits' };
  }

  // Standard 10-digit Indian mobile number (e.g., 9361692011) -> Prepend 91
  if (digits.length === 10 && /^[6-9]/.test(digits)) {
    return { isValid: true, normalizedNumber: `91${digits}` };
  }

  // 12-digit Indian number starting with 91 (e.g., 919361692011)
  if (digits.length === 12 && digits.startsWith('91')) {
    return { isValid: true, normalizedNumber: digits };
  }

  // International numbers with country code (E.164 without +, length 10-15)
  if (digits.length >= 10 && digits.length <= 15) {
    return { isValid: true, normalizedNumber: digits };
  }

  return { isValid: false, error: `Invalid WhatsApp recipient number length (${digits.length} digits). Expected 10-15 digits with country code.` };
}

// ============================================================
// CONFIG
// ============================================================

const META_GRAPH_VERSION =
  process.env.META_GRAPH_VERSION || 'v23.0';

const INSTAGRAM_GRAPH_URL =
  `https://graph.instagram.com/${META_GRAPH_VERSION}`;

const FACEBOOK_GRAPH_URL =
  `https://graph.facebook.com/${META_GRAPH_VERSION}`;

// ============================================================
// TYPES
// ============================================================

interface MetaResponse {
  id?: string;
  user_id?: string;
  username?: string;
  name?: string;
  post_id?: string;

  error?: {
    message?: string;
    type?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
  };

  [key: string]: any;
}

interface ChannelResult {
  success: boolean;
  postId: string | null;
  containerId?: string;
  username?: string;
  shareUrl?: string;
  recipient?: string;
  status?: string;
  deliveryStatus?: string;
  note?: string;
  error?: string;

  meta?: {
    code?: number;
    subcode?: number;
    type?: string;
    fbtraceId?: string;
  };
}

// ============================================================
// HELPERS
// ============================================================

function createMetaError(
  data: MetaResponse,
  fallback: string
): Error & {
  meta?: {
    code?: number;
    subcode?: number;
    type?: string;
    fbtraceId?: string;
  };
} {
  const error = new Error(
    data?.error?.message || fallback
  ) as Error & {
    meta?: {
      code?: number;
      subcode?: number;
      type?: string;
      fbtraceId?: string;
    };
  };

  error.meta = {
    code: data?.error?.code,
    subcode: data?.error?.error_subcode,
    type: data?.error?.type,
    fbtraceId: data?.error?.fbtrace_id,
  };

  return error;
}

function validateToken(
  token: string | undefined,
  platform: string
): void {
  if (!token) {
    throw new Error(
      `${platform} access token is missing`
    );
  }

  if (
    typeof token !== 'string' ||
    token.trim().length < 20
  ) {
    throw new Error(
      `${platform} access token is invalid or incomplete`
    );
  }
}

function validateMediaUrl(
  mediaUrl: string
): string {
  if (!mediaUrl) {
    throw new Error(
      'mediaUrl is required'
    );
  }

  if (mediaUrl.startsWith('data:')) {
    throw new Error(
      'Base64 media is not supported directly. Upload the image to Cloudinary, S3, or another public storage service first.'
    );
  }

  let url: URL;

  try {
    url = new URL(mediaUrl);
  } catch {
    throw new Error(
      'mediaUrl must be a valid URL'
    );
  }

  if (
    url.protocol !== 'http:' &&
    url.protocol !== 'https:'
  ) {
    throw new Error(
      'mediaUrl must use HTTP or HTTPS'
    );
  }

  const hostname =
    url.hostname.toLowerCase();

  if (
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '0.0.0.0' ||
    hostname === '::1' ||
    hostname.endsWith('.local')
  ) {
    throw new Error(
      'Meta cannot access localhost. Use a public Cloudinary/S3/CDN URL.'
    );
  }

  return mediaUrl;
}

// ============================================================
// META - FACEBOOK PAGE VERIFICATION
// ============================================================

async function facebookGetPage(
  pageId: string,
  accessToken: string
): Promise<{
  id: string;
  name: string;
}> {
  validateToken(
    accessToken,
    'Facebook'
  );

  if (!pageId) {
    throw new Error(
      'Facebook Page ID is required'
    );
  }

  const url =
    `${FACEBOOK_GRAPH_URL}/${encodeURIComponent(pageId)}` +
    `?fields=id,name&access_token=${encodeURIComponent(accessToken)}`;

  console.log(
    `[Facebook Page Verification] Checking Page ID: ${pageId}`
  );

  const response =
    await fetchFn(url);

  const data =
    (await response.json()) as MetaResponse;

  console.log(
    `[Facebook Page Verification] HTTP ${response.status}`,
    data
  );

  if (
    !response.ok ||
    data.error
  ) {
    throw createMetaError(
      data,
      'Facebook Page verification failed'
    );
  }

  if (!data.id) {
    throw new Error(
      'Facebook Page ID was not returned'
    );
  }

  return {
    id: String(data.id),
    name: String(
      data.name || 'Facebook Page'
    ),
  };
}

// ============================================================
// INSTAGRAM - VERIFY TOKEN
// ============================================================

async function instagramGetAccount(
  accessToken: string
): Promise<{
  user_id: string;
  username: string;
}> {
  validateToken(
    accessToken,
    'Instagram'
  );

  const isMetaToken =
    accessToken.startsWith('EAA');

  const primaryUrl =
    isMetaToken
      ? FACEBOOK_GRAPH_URL
      : INSTAGRAM_GRAPH_URL;

  console.log(
    `[Instagram OAuth Debug] Using API: ${primaryUrl} (token prefix: ${accessToken.slice(0, 10)}...)`
  );

  const url =
    `${primaryUrl}/me` +
    `?fields=id,name,username,user_id` +
    `&access_token=${encodeURIComponent(accessToken)}`;

  const response =
    await fetchFn(url);

  const data =
    (await response.json()) as MetaResponse;

  if (
    !response.ok ||
    data.error
  ) {
    console.error(
      `[Instagram OAuth Failure]`,
      data.error
    );

    throw createMetaError(
      data,
      'Instagram token verification failed'
    );
  }

  const userId =
    data.user_id || data.id;

  const username =
    data.username || data.name;

  if (!userId) {
    throw new Error(
      'Instagram user_id or username was not returned'
    );
  }

  return {
    user_id: String(userId),
    username: String(
      username || 'instagram_user'
    ),
  };
}

export function ensureMetaCompatibleImageUrl(url: string): string {
  if (!url) return url;
  if (url.includes('cloudinary.com') && url.endsWith('.svg')) {
    const pngUrl = url.replace(/\/image\/upload\//, '/image/upload/f_png,q_auto/').replace(/\.svg$/, '.png');
    console.log(`[Meta Format Converter] Converted Cloudinary SVG to Meta PNG URL:\n  Original: ${url}\n  Converted: ${pngUrl}`);
    return pngUrl;
  }
  return url;
}

// ============================================================
// INSTAGRAM - CREATE CONTAINER
// ============================================================

async function instagramCreateContainer(
  igUserId: string,
  accessToken: string,
  imageUrl: string,
  caption: string,
  mediaType?: 'IMAGE' | 'VIDEO'
): Promise<string> {
  validateToken(
    accessToken,
    'Instagram'
  );

  if (!igUserId) {
    throw new Error(
      'Instagram User ID is required'
    );
  }

  const compatibleImageUrl = ensureMetaCompatibleImageUrl(imageUrl);
  validateMediaUrl(
    compatibleImageUrl
  );

  const isVideo =
    mediaType === 'VIDEO' ||
    imageUrl.endsWith('.mp4') ||
    imageUrl.endsWith('.mov') ||
    imageUrl.includes('/video/');

  const params =
    new URLSearchParams();

  if (isVideo) {
    params.append(
      'media_type',
      'REELS'
    );

    params.append(
      'video_url',
      imageUrl
    );
  } else {
    params.append(
      'image_url',
      imageUrl
    );
  }

  if (caption) {
    params.append(
      'caption',
      caption
    );
  }

  params.append(
    'access_token',
    accessToken
  );

  const isMetaToken =
    accessToken.startsWith('EAA');

  const baseUrl =
    isMetaToken
      ? FACEBOOK_GRAPH_URL
      : INSTAGRAM_GRAPH_URL;

  const response =
    await fetchFn(
      `${baseUrl}/${encodeURIComponent(igUserId)}/media`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body:
          params.toString(),
      }
    );

  const data =
    (await response.json()) as MetaResponse;

  if (
    !response.ok ||
    data.error
  ) {
    console.error(
      `[Instagram Container Creation Failure]`,
      data.error
    );

    throw createMetaError(
      data,
      'Instagram media container creation failed'
    );
  }

  if (!data.id) {
    throw new Error(
      'Instagram did not return a container ID'
    );
  }

  console.log(
    `[Meta Media Container Created] Container ID: ${data.id}`
  );

  return data.id;
}

// ============================================================
// INSTAGRAM - WAIT FOR CONTAINER STATUS
// ============================================================

async function instagramWaitForContainer(
  containerId: string,
  accessToken: string
): Promise<void> {
  const maxAttempts = 10;
  const delayMs = 2000;

  const isMetaToken =
    accessToken.startsWith('EAA');

  const baseUrl =
    isMetaToken
      ? FACEBOOK_GRAPH_URL
      : INSTAGRAM_GRAPH_URL;

  for (
    let attempt = 1;
    attempt <= maxAttempts;
    attempt++
  ) {
    const url =
      `${baseUrl}/${encodeURIComponent(containerId)}` +
      `?fields=status_code,status` +
      `&access_token=${encodeURIComponent(accessToken)}`;

    const response =
      await fetchFn(url);

    const data =
      (await response.json()) as MetaResponse & {
        status_code?: string;
        status?: string;
      };

    if (
      !response.ok ||
      data.error
    ) {
      console.error(
        `[Instagram Container Status Check Failure]`,
        data.error
      );

      throw createMetaError(
        data,
        'Failed to check Instagram media container status'
      );
    }

    console.log(
      `[Instagram Container Status] Attempt ${attempt}: status_code=${data.status_code || 'N/A'}, status=${data.status || 'N/A'}`
    );

    if (
      data.status_code ===
      'FINISHED'
    ) {
      return;
    }

    if (
      data.status_code === 'ERROR' ||
      data.status_code === 'EXPIRED'
    ) {
      throw new Error(
        `Instagram media container failed with status: ${data.status_code}`
      );
    }

    await new Promise(
      resolve =>
        setTimeout(
          resolve,
          delayMs
        )
    );
  }

  throw new Error(
    'Instagram media container processing timed out'
  );
}

// ============================================================
// INSTAGRAM - PUBLISH CONTAINER
// ============================================================

async function instagramPublishContainer(
  igUserId: string,
  accessToken: string,
  containerId: string
): Promise<string> {
  validateToken(
    accessToken,
    'Instagram'
  );

  const params =
    new URLSearchParams();

  params.append(
    'creation_id',
    containerId
  );

  params.append(
    'access_token',
    accessToken
  );

  const isMetaToken =
    accessToken.startsWith('EAA');

  const baseUrl =
    isMetaToken
      ? FACEBOOK_GRAPH_URL
      : INSTAGRAM_GRAPH_URL;

  const response =
    await fetchFn(
      `${baseUrl}/${encodeURIComponent(igUserId)}/media_publish`,
      {
        method: 'POST',
        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded',
        },
        body:
          params.toString(),
      }
    );

  const data =
    (await response.json()) as MetaResponse;

  if (
    !response.ok ||
    data.error
  ) {
    console.error(
      `[Instagram Publish Failure]`,
      data.error
    );

    throw createMetaError(
      data,
      'Instagram publishing failed'
    );
  }

  if (!data.id) {
    throw new Error(
      'Instagram did not return a published post ID'
    );
  }

  return data.id;
}

// ============================================================
// FACEBOOK - PUBLISH PAGE PHOTO
// ============================================================

async function facebookPublishPhoto(
  pageId: string,
  accessToken: string,
  imageUrl: string,
  caption: string
): Promise<string> {
  validateToken(
    accessToken,
    'Facebook'
  );

  if (!pageId) {
    throw new Error(
      'Facebook Page ID is required'
    );
  }

  const compatibleImageUrl = ensureMetaCompatibleImageUrl(imageUrl);
  validateMediaUrl(
    compatibleImageUrl
  );

  const params = new URLSearchParams();
  params.append('url', compatibleImageUrl);
  params.append('message', caption || ''); // Required by Meta to render text on Page Timeline Feed!
  params.append('caption', caption || '');
  params.append('published', 'true');
  params.append('access_token', accessToken);

  console.log(`[Facebook Publish] Page ID: ${pageId}`);
  console.log(`[Facebook Publish] Media URL: ${compatibleImageUrl}`);

  const response = await fetchFn(
    `${FACEBOOK_GRAPH_URL}/${encodeURIComponent(pageId)}/photos`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    }
  );

  const data = (await response.json()) as MetaResponse;

  console.log(`[Facebook Photo Response] HTTP ${response.status}:`, data);

  if (!response.ok || data.error) {
    console.error('========== FACEBOOK PUBLISH ERROR ==========');
    console.error(JSON.stringify(data, null, 2));
    console.error('============================================');
    throw createMetaError(data, 'Facebook photo publishing failed');
  }

  let finalPostId = data.post_id || data.id;

  // If Meta returned photo object ID without post_id, publish a Page Feed post attaching the photo
  if (data.id && !data.post_id) {
    try {
      const feedParams = new URLSearchParams();
      feedParams.append('message', caption || '');
      feedParams.append('attached_media[0]', JSON.stringify({ media_fbid: data.id }));
      feedParams.append('access_token', accessToken);

      const feedRes = await fetchFn(
        `${FACEBOOK_GRAPH_URL}/${encodeURIComponent(pageId)}/feed`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: feedParams.toString()
        }
      );
      const feedData = await feedRes.json();
      if (feedData.id) {
        finalPostId = feedData.id;
        console.log(`[Facebook Page Feed Post Published] Feed Post ID: ${finalPostId}`);
      }
    } catch (feedErr) {
      console.warn('[Facebook Feed Attach Notice]:', feedErr);
    }
  }

  if (!finalPostId) {
    throw new Error('Facebook did not return a post ID');
  }

  console.log(`[Facebook Publish Success] Post ID: ${finalPostId}`);
  return finalPostId;
}

// ============================================================
// CONNECT ACCOUNT
// ============================================================

export async function connectAccount(
  req: Request,
  res: Response
) {
  try {
    const {
      userId,
      platform,
      handle,
      accountId,
      accessToken,
      tokenExpiry,
    } = req.body;

    if (
      !userId ||
      !platform ||
      !handle ||
      !accountId ||
      !accessToken
    ) {
      return res.status(400).json({
        success: false,
        error:
          'userId, platform, handle, accountId and accessToken are required',
      });
    }

    if (
      platform !== 'Instagram' &&
      platform !== 'Facebook' &&
      platform !== 'WhatsApp'
    ) {
      return res.status(400).json({
        success: false,
        error: 'Only Instagram, Facebook, and WhatsApp are supported',
      });
    }

    const { phoneNumberId, fromPhoneNumber, toPhoneNumber, templateName } = req.body;

    if (platform !== 'WhatsApp') {
      validateToken(accessToken, platform);
    }

    // ========================================================
    // VERIFY INSTAGRAM
    // ========================================================

    if (platform === 'Instagram') {
      const instagram = await instagramGetAccount(accessToken);
      if (String(instagram.user_id) !== String(accountId)) {
        return res.status(400).json({
          success: false,
          error: 'Instagram account ID does not match the supplied access token.',
          tokenAccount: {
            user_id: instagram.user_id,
            username: instagram.username,
          },
        });
      }
    }

    // ========================================================
    // VERIFY FACEBOOK PAGE
    // ========================================================

    else if (platform === 'Facebook') {
      const page = await facebookGetPage(accountId, accessToken);
      if (String(page.id) !== String(accountId)) {
        return res.status(400).json({
          success: false,
          error: 'Facebook Page ID does not match the supplied access token.',
        });
      }
    }

    // ========================================================
    // UPSERT ACCOUNT
    // ========================================================

    const account = await SocialAccount.findOneAndUpdate(
      { userId, platform },
      {
        handle,
        accountId,
        accessToken,
        phoneNumberId: phoneNumberId || accountId,
        fromPhoneNumber: fromPhoneNumber || handle,
        toPhoneNumber: toPhoneNumber || undefined,
        templateName: templateName || undefined,
        isConnected: true,
        connectedAt: new Date(),
      },
      { upsert: true, returnDocument: 'after' }
    );

    if (platform === 'WhatsApp') {
      console.log(`\n================== 💾 SAVED WHATSAPP ACCOUNT CREDENTIALS ==================`);
      console.log(`• User ID:                     ${userId}`);
      console.log(`• Platform:                    WhatsApp`);
      console.log(`• WhatsApp Phone Number ID:   ${account.phoneNumberId || account.accountId}`);
      console.log(`• WABA System User Access Token: ${account.accessToken}`);
      console.log(`• Target Recipient (To Number): ${account.toPhoneNumber || 'Not Set'}`);
      console.log(`• Approved Template Name:      ${account.templateName || 'Not Set'}`);
      console.log(`============================================================================\n`);
    }

    return res.status(200).json({
      success: true,
      account,
    });

  } catch (err: any) {
    console.error(
      'connectAccount:',
      err
    );

    return res.status(500).json({
      success: false,
      error:
        err.message,
      meta:
        err.meta,
    });
  }
}

// ============================================================
// DISCONNECT ACCOUNT
// ============================================================

export async function disconnectAccount(
  req: Request,
  res: Response
) {
  try {
    const {
      platform,
    } = req.params;

    const {
      userId,
    } = req.query;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error:
          'userId is required',
      });
    }

    await SocialAccount.findOneAndUpdate(
      {
        userId:
          userId as string,
        platform:
          platform as any,
      } as any,
      {
        isConnected: false,
      }
    );

    return res.status(200).json({
      success: true,
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error:
        err.message,
    });
  }
}

// ============================================================
// GET CONNECTED ACCOUNTS
// ============================================================

export async function getConnectedAccounts(
  req: Request,
  res: Response
) {
  try {
    const {
      userId,
    } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error:
          'userId is required',
      });
    }

    const accounts =
      await SocialAccount.find({
        userId,
        isConnected: true,
      } as any).select(
        '-accessToken'
      );

    return res.status(200).json({
      success: true,
      accounts,
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error:
        err.message,
    });
  }
}

// ============================================================
// PUBLISH POST
// ============================================================

export async function publishPost(
  req: Request,
  res: Response
) {
  try {
    const {
      userId,
      channels,
      headline = '',
      caption = '',
      mediaUrl,
      targetUrl = '',
      adId,
      mediaType = 'IMAGE',
      status = 'PUBLISHED',
      scheduledDate,
    } = req.body;

    if (
      !userId ||
      !Array.isArray(channels) ||
      channels.length === 0 ||
      !mediaUrl
    ) {
      return res.status(400).json({
        success: false,
        error:
          'userId, channels and mediaUrl are required',
      });
    }

    // ========================================================
    // MEDIA
    // ========================================================

    let resolvedMediaUrl =
      validateMediaUrl(
        mediaUrl
      );

    // ========================================================
    // RENDER COMPOSITE BANNER
    // ========================================================

    if (
      mediaType !== 'VIDEO' &&
      !mediaUrl.endsWith('.mp4') &&
      !mediaUrl.endsWith('.mov')
    ) {
      try {
        const compositeBanner =
          await renderAndUploadAdBanner({
            headline:
              headline ||
              'SPECIAL PROMOTIONAL OFFER',

            brandName:
              req.body.brandName ||
              'OFFICIAL DEAL',

            category:
              req.body.category ||
              'Featured',

            promotionalOffer:
              req.body.promotionalOffer ||
              '🔥 SPECIAL LIMITED TIME OFFER • 20% OFF',

            price:
              req.body.price
                ? parseFloat(
                    req.body.price
                  )
                : undefined,

            cta:
              req.body.cta ||
              "I'M INTERESTED",

            bgImageUrl:
              resolvedMediaUrl,
          });

        if (
          compositeBanner &&
          compositeBanner.startsWith(
            'http'
          )
        ) {
          resolvedMediaUrl =
            compositeBanner;

          console.log(
            `[Publish Post Renderer] Created Composite Banner: ${resolvedMediaUrl}`
          );
        }

      } catch (renderErr) {
        console.warn(
          '[Publish Post Renderer] Banner overlay notice:',
          renderErr
        );
      }
    }

    // ========================================================
    // REMOVE DUPLICATE CHANNELS
    // ========================================================

    const uniqueChannels =
      [
        ...new Set(
          channels
        ),
      ];

    // ========================================================
    // GET CONNECTED ACCOUNTS
    // ========================================================

    const connectedAccounts =
      await SocialAccount.find({
        userId,
        platform: {
          $in:
            uniqueChannels,
        },
        isConnected: true,
      } as any);

    const results: Record<
      string,
      ChannelResult
    > = {};

    // ========================================================
    // PUBLISH EACH CHANNEL
    // ========================================================

    for (
      const channel of uniqueChannels
    ) {
      const account =
        connectedAccounts.find(
          (item: any) =>
            item.platform ===
            channel
        ) as any;

      // ======================================================
      // ACCOUNT NOT CONNECTED
      // ======================================================

      if (!account) {
        results[channel] = {
          success: false,
          postId: null,
          error:
            `${channel} account is not connected`,
        };

        continue;
      }

      try {
        // ====================================================
        // INSTAGRAM
        // ====================================================

        if (
          channel ===
          'Instagram'
        ) {
          const instagramAccount =
            await instagramGetAccount(
              account.accessToken
            );

          const targetIgUserId =
            account.accountId ||
            instagramAccount.user_id;

          const fullCaption =
            [
              headline,
              caption,
              targetUrl
                ? `🔗 ${targetUrl}`
                : '',
            ]
              .filter(Boolean)
              .join('\n\n');

          // STEP 1
          const containerId =
            await instagramCreateContainer(
              targetIgUserId,
              account.accessToken,
              resolvedMediaUrl,
              fullCaption,
              mediaType
            );

          console.log(
            `[Instagram] Container created: ${containerId}`
          );

          // STEP 2
          await instagramWaitForContainer(
            containerId,
            account.accessToken
          );

          console.log(
            `[Instagram] Container ready: ${containerId}`
          );

          // STEP 3
          const postId =
            await instagramPublishContainer(
              targetIgUserId,
              account.accessToken,
              containerId
            );

          console.log(
            `[Instagram] Published successfully: ${postId}`
          );

          results[channel] = {
            success: true,
            postId,
            containerId,
            username:
              instagramAccount.username,
          };
        }

        // ====================================================
        // FACEBOOK
        // ====================================================

        else if (
          channel ===
          'Facebook'
        ) {
          /*
           * IMPORTANT:
           *
           * account.accountId
           *     = Facebook Page ID
           *
           * account.accessToken
           *     = Facebook Page Access Token
           */

          if (
            !account.accountId
          ) {
            throw new Error(
              'Facebook Page ID is missing from connected account'
            );
          }

          if (
            !account.accessToken
          ) {
            throw new Error(
              'Facebook Page Access Token is missing from connected account'
            );
          }

          // --------------------------------------------------
          // Verify Page before publishing
          // --------------------------------------------------

          const page =
            await facebookGetPage(
              account.accountId,
              account.accessToken
            );

          console.log(
            `[Facebook] Verified Page: ${page.name} (${page.id})`
          );

          const fullCaption =
            [
              headline,
              caption,
              targetUrl,
            ]
              .filter(Boolean)
              .join('\n\n');

          // --------------------------------------------------
          // Publish photo
          // --------------------------------------------------

          const postId =
            await facebookPublishPhoto(
              page.id,
              account.accessToken,
              resolvedMediaUrl,
              fullCaption
            );

          results[channel] = {
            success: true,
            postId,
          };
        }

        // ====================================================
        // WHATSAPP DIRECT BROADCAST / CLOUD API
        // ====================================================

        else if (channel === 'WhatsApp') {
          const waText = [headline, caption, resolvedMediaUrl, targetUrl].filter(Boolean).join('\n\n');

          // 3-Tier Credential Resolution: 1. Request Body, 2. Saved MongoDB Account (Settings), 3. Process ENV Fallbacks
          const waAccount = await SocialAccount.findOne({ userId, platform: 'WhatsApp', isConnected: true });
          const phoneId = req.body.phoneNumberId || waAccount?.phoneNumberId || waAccount?.accountId || process.env.WHATSAPP_PHONE_NUMBER_ID;
          const token = req.body.accessToken || waAccount?.accessToken || process.env.WHATSAPP_ACCESS_TOKEN || process.env.WABA_SYSTEM_USER_TOKEN;
          const rawTargetPhone = req.body.toNumber || req.body.phone || req.body.toNumbers?.[0] || waAccount?.toPhoneNumber;
          const templateName = req.body.templateName || req.body.waTemplateName || waAccount?.templateName;

          const norm = normalizeWhatsAppNumber(rawTargetPhone || '');

          console.log(`\n================== 📱 WHATSAPP DISPATCH DETAILS ==================`);
          console.log(`• User ID:                     ${userId}`);
          console.log(`• Platform:                    WhatsApp Business Cloud API`);
          console.log(`• WhatsApp Phone Number ID:   ${phoneId || '⚠️ NOT CONFIGURED'}`);
          console.log(`• WABA System User Access Token: ${token ? `${token.slice(0, 8)}...${token.slice(-4)}` : '⚠️ NOT CONFIGURED'}`);
          console.log(`• Target Recipient (Normalized): ${norm.normalizedNumber || rawTargetPhone || '⚠️ NOT CONFIGURED'}`);
          console.log(`• Approved Template Name:      ${templateName || 'None (Direct Image/Text Dispatch)'}`);
          console.log(`• Media Banner URL:            ${resolvedMediaUrl || 'None'}`);
          console.log(`• Ad Headline:                 ${headline}`);
          console.log(`=================================================================\n`);

          if (!phoneId || !token) {
            results[channel] = {
              success: false,
              postId: null,
              error: 'Configuration Required: Please set WhatsApp Phone Number ID and WABA System User Token in Social Settings.'
            };
          } else if (!norm.isValid || !norm.normalizedNumber) {
            results[channel] = {
              success: false,
              postId: null,
              error: `Recipient Required: ${norm.error || 'Please configure a valid WhatsApp recipient number in Settings.'}`
            };
          } else {
            const waRes = await sendWhatsAppCloudMessage(phoneId, token, norm.normalizedNumber, waText, resolvedMediaUrl, templateName);
            if (waRes.success) {
              const displayPhone = norm.normalizedNumber.length === 12 && norm.normalizedNumber.startsWith('91') 
                ? `+91 ${norm.normalizedNumber.slice(2, 7)} ${norm.normalizedNumber.slice(7)}` 
                : `+${norm.normalizedNumber}`;
              results[channel] = {
                success: true,
                postId: waRes.messageId,
                recipient: norm.normalizedNumber,
                status: 'API_ACCEPTED',
                deliveryStatus: 'API_ACCEPTED',
                note: `API Accepted — waiting for WhatsApp delivery confirmation for ${displayPhone}`
              };
              console.log(`[WhatsApp Cloud API Direct Dispatch Accepted] Message ID: ${waRes.messageId} to ${norm.normalizedNumber}`);
            } else {
              results[channel] = {
                success: false,
                postId: null,
                error: waRes.error || 'WhatsApp Cloud API Dispatch Failed'
              };
              console.error(`[WhatsApp Cloud API Direct Dispatch Failed]:`, waRes.error);
            }
          }
        }

        // ====================================================
        // OTHER CHANNELS
        // ====================================================

        else {
          results[channel] = {
            success: false,
            postId: null,
            error:
              `${channel} publishing is not implemented`,
          };
        }

      } catch (
        channelErr: any
      ) {
        console.error(
          `========== ${channel.toUpperCase()} API ERROR ==========`
        );

        console.error(
          'Message:',
          channelErr.message
        );

        console.error(
          'Meta:',
          channelErr.meta
        );

        console.error(
          'Full error:',
          channelErr
        );

        console.error(
          '================================================'
        );

        results[channel] = {
          success: false,
          postId: null,
          error:
            channelErr.message ||
            `${channel} publishing failed`,
          meta:
            channelErr.meta,
        };
      }
    }

    // ========================================================
    // COUNTS
    // ========================================================

    const successCount =
      Object.values(
        results
      ).filter(
        result =>
          result.success === true
      ).length;

    const failedCount =
      Object.values(
        results
      ).filter(
        result =>
          result.success === false
      ).length;

    // ========================================================
    // STATUS
    // ========================================================

    let finalStatus =
      status || 'PUBLISHED';

    if (status !== 'SCHEDULED') {
      if (results.WhatsApp?.success && uniqueChannels.length === 1) {
        finalStatus = 'API_ACCEPTED';
      } else if (successCount === uniqueChannels.length) {
        finalStatus = 'PUBLISHED';
      } else if (successCount > 0) {
        finalStatus = 'PARTIALLY_PUBLISHED';
      } else {
        finalStatus = 'FAILED';
      }
    }

    // ========================================================
    // SAVE POST
    // ========================================================

    const newPost = await SocialPost.create({
      userId,
      adId,
      headline,
      caption,
      mediaUrl: resolvedMediaUrl,
      mediaType,
      channels: uniqueChannels,
      targetUrl,
      status: finalStatus,
      whatsappDelivery: results.WhatsApp?.success ? {
        messageId: results.WhatsApp.postId,
        recipient: results.WhatsApp.recipient,
        deliveryStatus: 'API_ACCEPTED',
        sentAt: new Date()
      } : undefined,
      scheduledDate,
      publishedDate: successCount > 0 ? new Date().toISOString().split('T')[0] : undefined,
      impressions: 0,
      clicks: 0,
      leads: 0,
    });

    console.log(
      `[Social Post Saved]`,
      {
        postId:
          newPost._id,
        status:
          newPost.status,
        userId,
        successCount,
        failedCount,
      }
    );

    // ========================================================
    // RESPONSE
    // ========================================================

    return res.status(
      successCount > 0
        ? 200
        : 502
    ).json({
      success:
        successCount > 0,

      totalChannels:
        uniqueChannels.length,

      successCount,

      failedCount,

      results,

      post:
        newPost,
    });

  } catch (err: any) {
    console.error(
      'publishPost:',
      err
    );

    return res.status(500).json({
      success: false,
      error:
        err.message,
      meta:
        err.meta,
    });
  }
}

// ============================================================
// GET POSTS
// ============================================================

export async function getSocialPosts(
  req: Request,
  res: Response
) {
  try {
    const {
      userId,
    } = req.query;

    let query: any = {};

    if (
      userId &&
      typeof userId === 'string' &&
      userId !== 'all' &&
      userId !== 'undefined' &&
      userId !== 'null'
    ) {
      const uStr =
        String(userId).trim();

      query = {
        $or: [
          {
            userId: uStr,
          },
          {
            userId:
              'b2c-default',
          },
          {
            userId: {
              $regex: uStr,
              $options: 'i',
            },
          },
        ],
      };
    }

    let posts =
      await SocialPost.find(
        query
      ).sort({
        createdAt: -1,
      });

    // Fallback
    if (
      posts.length === 0
    ) {
      posts =
        await SocialPost.find(
          {}
        ).sort({
          createdAt: -1,
        });
    }

    console.log(
      `[Social Posts Fetch] Query:`,
      query,
      `Found ${posts.length} posts in MongoDB`
    );

    return res.status(200).json({
      success: true,
      posts,
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error:
        err.message,
    });
  }
}

// ============================================================
// DELETE POST
// ============================================================

export async function deleteSocialPost(
  req: Request,
  res: Response
) {
  try {
    const {
      postId,
    } = req.params;

    if (!postId) {
      return res.status(400).json({
        success: false,
        error:
          'postId is required',
      });
    }

    await SocialPost.findByIdAndDelete(
      postId
    );

    return res.status(200).json({
      success: true,
    });

  } catch (err: any) {
    return res.status(500).json({
      success: false,
      error:
        err.message,
    });
  }
}

// ============================================================
// WHATSAPP CLOUD API - DIRECT MESSAGE SENDER
// ============================================================

export async function sendWhatsAppCloudMessage(
  phoneNumberId: string,
  accessToken: string,
  recipientNumber: string,
  messageText: string,
  mediaUrl?: string,
  templateName?: string
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const norm = normalizeWhatsAppNumber(recipientNumber);
    if (!norm.isValid || !norm.normalizedNumber) {
      return { success: false, error: norm.error || 'Recipient phone number is invalid' };
    }
    const cleanNumber = norm.normalizedNumber;

    console.log(`[WhatsApp Cloud API Dispatch] Phone Number ID: ${phoneNumberId}, Recipient: ${cleanNumber}, Template: ${templateName || 'None'}`);

    // Verify Meta Phone Number Verification Status
    try {
      const phoneInfoRes = await fetchFn(`${FACEBOOK_GRAPH_URL}/${encodeURIComponent(phoneNumberId)}?fields=code_verification_status,verified_name,display_phone_number`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      const phoneInfo = await phoneInfoRes.json();
      if (phoneInfo.code_verification_status === 'EXPIRED') {
        const errMsg = `WhatsApp Sender Number (${phoneInfo.verified_name || 'Techietact'} - ${phoneInfo.display_phone_number || phoneNumberId}) verification is EXPIRED on Meta. Please re-verify the sender number in Meta WhatsApp Manager.`;
        console.warn(`⚠️ [WhatsApp Sender Status EXPIRED]:`, errMsg);
        return { success: false, error: errMsg };
      }
    } catch (infoErr) {
      console.warn('[WhatsApp Phone Info Check Warning]:', infoErr);
    }

    const compatibleMediaUrl = mediaUrl ? ensureMetaCompatibleImageUrl(mediaUrl) : null;

    let payload: any;
    if (templateName && templateName.trim()) {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'template',
        template: {
          name: templateName.trim(),
          language: { code: 'en_US' }
        }
      };
    } else if (compatibleMediaUrl && (compatibleMediaUrl.endsWith('.png') || compatibleMediaUrl.endsWith('.jpg') || compatibleMediaUrl.endsWith('.jpeg') || compatibleMediaUrl.includes('cloudinary.com'))) {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'image',
        image: {
          link: compatibleMediaUrl,
          caption: messageText
        }
      };
    } else {
      payload = {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanNumber,
        type: 'text',
        text: {
          preview_url: true,
          body: messageText
        }
      };
    }

    const sendReq = async (bodyPayload: any) => {
      const res = await fetchFn(
        `${FACEBOOK_GRAPH_URL}/${encodeURIComponent(phoneNumberId)}/messages`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyPayload)
        }
      );
      return res.json();
    };

    let data = await sendReq(payload);
    console.log(`[WhatsApp Cloud API Dispatch] Response to ${cleanNumber}:`, data?.error ? data.error : { messageId: data.messages?.[0]?.id });

    // Fallback: If template failed with 132001 on en_US, retry with 'en'
    if (data.error?.code === 132001 && templateName && payload.type === 'template' && payload.template?.language?.code === 'en_US') {
      console.log(`[WhatsApp Template Fallback] Retrying template '${templateName}' with language code 'en'...`);
      payload.template.language.code = 'en';
      data = await sendReq(payload);
      console.log(`[WhatsApp Template Fallback Response] to ${cleanNumber}:`, data?.error ? data.error : { messageId: data.messages?.[0]?.id });
    }

    if (data.error) {
      let errMsg = data.error?.error_data?.details || data.error?.error_user_msg || data.error?.message || 'WhatsApp Cloud API request failed';
      if (data.error?.code === 132001) {
        errMsg = `Meta Template Error (132001): Template '${templateName}' was not found in your HR's Meta account. Please check the exact template name configured in Meta WhatsApp Manager.`;
      } else if (data.error?.code === 131030) {
        errMsg = 'Meta Policy Error (131030): Business-initiated promotional messages require an approved WhatsApp message template.';
      } else if (data.error?.code === 190 || errMsg.toLowerCase().includes('token')) {
        errMsg = 'WhatsApp System User Access Token is invalid or expired. Please update credentials in Social Settings.';
      } else if (data.error?.code === 100 || data.error?.code === 131009) {
        errMsg = `Meta API Error (${data.error.code}): ${data.error.error_user_title || 'Invalid Parameter'} - ${errMsg}`;
      }
      return {
        success: false,
        error: errMsg
      };
    }

    const messageId = data.messages?.[0]?.id || `wa-msg-${Date.now()}`;
    return { success: true, messageId };
  } catch (err: any) {
    console.error('[WhatsApp Cloud API Exception]:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Endpoint to send WhatsApp Cloud API broadcast to list of recipient phone numbers
 */
export async function sendWhatsAppBroadcast(req: Request, res: Response) {
  try {
    const { userId, phoneNumberId, accessToken, toNumbers, message, mediaUrl } = req.body;
    
    let activePhoneId = phoneNumberId;
    let activeToken = accessToken;

    if (!activePhoneId || !activeToken) {
      const account = await SocialAccount.findOne({ userId, platform: 'WhatsApp', isConnected: true });
      if (account) {
        activePhoneId = account.phoneNumberId || account.accountId;
        activeToken = account.accessToken;
      }
    }

    if (!activePhoneId || !activeToken) {
      return res.status(400).json({
        success: false,
        error: 'WhatsApp Phone Number ID and Access Token are required. Please connect WhatsApp Cloud API in Social Settings.'
      });
    }

    const numbersList: string[] = Array.isArray(toNumbers) ? toNumbers : [toNumbers];
    const results: any[] = [];

    for (const num of numbersList) {
      if (!num) continue;
      const resObj = await sendWhatsAppCloudMessage(activePhoneId, activeToken, num, message || 'AD-HUNTER Promotion', mediaUrl);
      results.push({ number: num, ...resObj });
    }

    const successCount = results.filter(r => r.success).length;

    return res.status(200).json({
      success: true,
      totalDispatched: results.length,
      successCount,
      results
    });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
}