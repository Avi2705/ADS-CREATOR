import { useState, useRef } from 'react';
import { 
  Heart, MessageCircle, Share2, Bookmark, Volume2, VolumeX, 
  Play, Pause, ThumbsUp, ThumbsDown, Repeat2, Music2, 
  ExternalLink, CheckCircle, MoreHorizontal, Disc
} from 'lucide-react';

export type PlatformFormat = 
  | 'INSTAGRAM_POST' 
  | 'INSTAGRAM_REEL' 
  | 'YOUTUBE_SHORT' 
  | 'YOUTUBE_VIDEO' 
  | 'TIKTOK_VIDEO' 
  | 'FACEBOOK_FEED' 
  | 'TWITTER_X';

export interface PlatformConfig {
  id: PlatformFormat;
  name: string;
  shortName: string;
  icon: string;
  aspectRatio: string;
  aspectClass: string;
  recommendedFor: 'Image' | 'Video' | 'Both';
  badgeColor: string;
  description: string;
}

export const PLATFORM_FORMATS: PlatformConfig[] = [
  {
    id: 'INSTAGRAM_POST',
    name: 'Instagram Post',
    shortName: 'IG Post (1:1)',
    icon: '📸',
    aspectRatio: '1:1',
    aspectClass: 'aspect-square',
    recommendedFor: 'Both',
    badgeColor: 'bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white',
    description: 'Square feed layout with brand header & engagement buttons'
  },
  {
    id: 'INSTAGRAM_REEL',
    name: 'Instagram Reel / Story',
    shortName: 'IG Reel (9:16)',
    icon: '📱',
    aspectRatio: '9:16',
    aspectClass: 'aspect-[9/16]',
    recommendedFor: 'Video',
    badgeColor: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white',
    description: 'Vertical fullscreen mobile with floating reels stack & sound disc'
  },
  {
    id: 'YOUTUBE_SHORT',
    name: 'YouTube Shorts',
    shortName: 'YT Shorts (9:16)',
    icon: '▶️',
    aspectRatio: '9:16',
    aspectClass: 'aspect-[9/16]',
    recommendedFor: 'Video',
    badgeColor: 'bg-red-600 text-white',
    description: 'Vertical Shorts layout with Subscribe button, Remix & Like stats'
  },
  {
    id: 'YOUTUBE_VIDEO',
    name: 'YouTube Video Ad (16:9)',
    shortName: 'YT Video (16:9)',
    icon: '🖥️',
    aspectRatio: '16:9',
    aspectClass: 'aspect-video',
    recommendedFor: 'Video',
    badgeColor: 'bg-zinc-900 text-white',
    description: 'Widescreen in-stream player with Skip Ad counter & video scrubber'
  },
  {
    id: 'TIKTOK_VIDEO',
    name: 'TikTok Video',
    shortName: 'TikTok (9:16)',
    icon: '🎵',
    aspectRatio: '9:16',
    aspectClass: 'aspect-[9/16]',
    recommendedFor: 'Video',
    badgeColor: 'bg-black text-cyan-400 border border-pink-500/50',
    description: 'For You Feed layout with spinning vinyl disc & follow badge'
  },
  {
    id: 'FACEBOOK_FEED',
    name: 'Facebook Feed',
    shortName: 'Facebook (4:5)',
    icon: '👥',
    aspectRatio: '4:5',
    aspectClass: 'aspect-[4/5]',
    recommendedFor: 'Both',
    badgeColor: 'bg-blue-600 text-white',
    description: 'News feed sponsored card with blue Like thumb & CTA link bar'
  },
  {
    id: 'TWITTER_X',
    name: 'X (Twitter) Feed',
    shortName: 'X / Twitter (16:9)',
    icon: '𝕏',
    aspectRatio: '16:9',
    aspectClass: 'aspect-video',
    recommendedFor: 'Both',
    badgeColor: 'bg-black text-white',
    description: 'Promoted tweet timeline card with Repost & Like metrics'
  }
];

export const parseFormatToId = (formatStr?: string): PlatformFormat => {
  if (!formatStr) return 'INSTAGRAM_POST';
  const lower = formatStr.toLowerCase();
  if (lower.includes('short')) return 'YOUTUBE_SHORT';
  if (lower.includes('youtube') || lower.includes('16:9') || lower.includes('video ad')) return 'YOUTUBE_VIDEO';
  if (lower.includes('tiktok')) return 'TIKTOK_VIDEO';
  if (lower.includes('reel') || lower.includes('story') || lower.includes('9:16')) return 'INSTAGRAM_REEL';
  if (lower.includes('facebook') || lower.includes('fb') || lower.includes('4:5')) return 'FACEBOOK_FEED';
  if (lower.includes('twitter') || lower.includes(' x ')) return 'TWITTER_X';
  return 'INSTAGRAM_POST';
};

interface AppPlatformAdMockupProps {
  mediaUrl: string;
  isVideo?: boolean;
  brandName?: string;
  headline?: string;
  description?: string;
  productName?: string;
  ctaText?: string;
  initialFormat?: PlatformFormat | string;
  allowFormatSwitching?: boolean;
  onInterestClick?: () => void;
  className?: string;
}

export function AppPlatformAdMockup({
  mediaUrl,
  isVideo = false,
  brandName = 'Brand Partner',
  headline = 'Exclusive Offer',
  description = 'Transform your lifestyle with our premium collection. Tap below for VIP access.',
  productName = 'Featured Product',
  ctaText = "I'm Interested",
  initialFormat = 'INSTAGRAM_POST',
  allowFormatSwitching = true,
  onInterestClick,
  className = ''
}: AppPlatformAdMockupProps) {
  const [selectedFormat, setSelectedFormat] = useState<PlatformFormat>(() => parseFormatToId(initialFormat));
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(2450);
  const [skipSeconds] = useState(5);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const isVideoAsset = isVideo || 
    mediaUrl.toLowerCase().endsWith('.mp4') || 
    mediaUrl.toLowerCase().endsWith('.webm') || 
    mediaUrl.toLowerCase().includes('gtv-videos-bucket') || 
    mediaUrl.toLowerCase().includes('video');

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
        setIsPlaying(false);
      } else {
        videoRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isLiked) {
      setIsLiked(false);
      setLikeCount(prev => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount(prev => prev + 1);
    }
  };

  const handleCta = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onInterestClick) {
      onInterestClick();
    } else {
      alert(`🎉 "${ctaText}" Clicked!\nProspect interested in ${headline} (${brandName}).`);
    }
  };

  const currentPlatform = PLATFORM_FORMATS.find(p => p.id === selectedFormat) || PLATFORM_FORMATS[0];

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      
      {/* 1. INTERACTIVE PLATFORM FORMAT SELECTOR BAR */}
      {allowFormatSwitching && (
        <div className="w-full bg-zinc-100 p-1.5 rounded-2xl border border-zinc-200 shadow-inner flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          {PLATFORM_FORMATS.map(plat => (
            <button
              key={plat.id}
              type="button"
              onClick={() => setSelectedFormat(plat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 ${
                selectedFormat === plat.id 
                  ? 'bg-black text-white shadow-md scale-105' 
                  : 'bg-white text-zinc-700 hover:bg-zinc-200 border border-zinc-200/60'
              }`}
              title={plat.description}
            >
              <span>{plat.icon}</span>
              <span>{plat.shortName}</span>
            </button>
          ))}
        </div>
      )}

      {/* Platform Badge Indicator */}
      <div className="flex items-center gap-2 text-xs">
        <span className={`px-2.5 py-0.5 rounded-full font-black text-[10px] uppercase shadow-sm ${currentPlatform.badgeColor}`}>
          {currentPlatform.name} ({currentPlatform.aspectRatio})
        </span>
        <span className="text-[11px] font-semibold text-zinc-500">
          {currentPlatform.description}
        </span>
      </div>

      {/* 2. DYNAMIC APP CONTAINER - ADAPTS TO CHOSEN PLATFORM */}
      <div className="w-full flex justify-center py-2">
        
        {/* ========================================================= */}
        {/* A. INSTAGRAM POST (1:1 SQUARE FEED LAYOUT) */}
        {/* ========================================================= */}
        {selectedFormat === 'INSTAGRAM_POST' && (
          <div className="w-full max-w-sm bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden transition-all duration-300 animate-in fade-in">
            {/* Header */}
            <div className="p-3.5 flex justify-between items-center border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 p-[2px]">
                  <div className="w-full h-full rounded-full bg-white flex items-center justify-center font-black text-[10px] text-black uppercase">
                    {brandName ? brandName.slice(0, 2) : 'IG'}
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="font-black text-black text-xs">{brandName.toLowerCase().replace(/\s+/g, '_')}</span>
                    <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-500" />
                  </div>
                  <span className="text-[9px] text-zinc-400 font-semibold block leading-none">Sponsored • Instagram Feed</span>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-zinc-400" />
            </div>

            {/* Media Area */}
            <div className="relative aspect-square bg-black overflow-hidden flex items-center justify-center group">
              {isVideoAsset ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={mediaUrl} alt={headline} className="w-full h-full object-cover" />
              )}

              {/* Video Audio Control */}
              {isVideoAsset && (
                <button
                  type="button"
                  onClick={handleToggleMute}
                  className="absolute bottom-3 right-3 p-2 rounded-full bg-black/60 backdrop-blur-md text-white hover:bg-black/80 transition-colors shadow-md"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              )}

              {/* Floating CTA Banner */}
              <div className="absolute bottom-3 inset-x-3 bg-white/95 backdrop-blur-md p-2.5 rounded-2xl border border-zinc-200/60 shadow-lg flex justify-between items-center">
                <div className="truncate mr-2">
                  <div className="font-black text-black text-[11px] truncate">{headline}</div>
                  <div className="text-[9px] text-zinc-500 font-semibold truncate">{productName}</div>
                </div>
                <button
                  type="button"
                  onClick={handleCta}
                  className="btn-shimmer px-3.5 py-1.5 bg-red-600 hover:bg-red-700 text-white font-black text-[10px] uppercase tracking-wider rounded-xl shadow-sm shrink-0"
                >
                  {ctaText}
                </button>
              </div>
            </div>

            {/* Social Engagement */}
            <div className="p-3.5 space-y-2.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3.5 text-zinc-700">
                  <button type="button" onClick={handleLike} className="hover:scale-110 transition-transform">
                    <Heart className={`w-5 h-5 ${isLiked ? 'text-red-600 fill-red-600' : 'text-zinc-800'}`} />
                  </button>
                  <MessageCircle className="w-5 h-5 text-zinc-800" />
                  <Share2 className="w-5 h-5 text-zinc-800" />
                </div>
                <Bookmark className="w-5 h-5 text-zinc-800" />
              </div>

              <div className="text-xs font-black text-black">{likeCount.toLocaleString()} likes</div>
              <div className="text-xs text-zinc-800 leading-relaxed font-normal">
                <strong className="font-black text-black mr-1.5">{brandName.toLowerCase().replace(/\s+/g, '_')}</strong>
                {description}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* B. INSTAGRAM REEL / STORY (9:16 VERTICAL FULLSCREEN) */}
        {/* ========================================================= */}
        {selectedFormat === 'INSTAGRAM_REEL' && (
          <div className="w-[310px] sm:w-[330px] aspect-[9/16] bg-black rounded-[36px] overflow-hidden border-4 border-zinc-900 shadow-2xl relative flex flex-col justify-between p-4 text-white transition-all duration-300 animate-in fade-in">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
              {isVideoAsset ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={mediaUrl} alt={headline} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />
            </div>

            {/* Top Bar */}
            <div className="relative z-10 flex justify-between items-center pt-2">
              <div className="flex items-center gap-1.5 font-black text-sm tracking-wider">
                <span>Reels</span>
                <span className="text-[10px] px-1.5 py-0.5 bg-red-600/80 rounded font-mono">AD</span>
              </div>
              <button
                type="button"
                onClick={handleToggleMute}
                className="p-1.5 rounded-full bg-black/50 backdrop-blur-md hover:bg-black/70"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* Right-Side Instagram Action Stack */}
            <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center space-y-4">
              <button type="button" onClick={handleLike} className="flex flex-col items-center gap-1 group">
                <div className={`p-2.5 rounded-full backdrop-blur-md transition-all ${isLiked ? 'bg-red-600 text-white scale-110' : 'bg-black/40 text-white group-hover:bg-black/60'}`}>
                  <Heart className={`w-5 h-5 ${isLiked ? 'fill-white' : ''}`} />
                </div>
                <span className="text-[10px] font-bold">14.8k</span>
              </button>

              <div className="flex flex-col items-center gap-1">
                <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">428</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">1.2k</span>
              </div>

              <div className="p-2.5 rounded-full bg-black/40 backdrop-blur-md">
                <MoreHorizontal className="w-5 h-5" />
              </div>

              {/* Spinning Music Disc */}
              <div className="w-8 h-8 rounded-full border-2 border-white/80 bg-zinc-900 flex items-center justify-center animate-spin">
                <Disc className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Bottom Caption & Interactive CTA */}
            <div className="relative z-10 space-y-2.5 pb-1 max-w-[230px]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-400 to-red-600 p-[1.5px]">
                  <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center font-bold text-[9px]">
                    {brandName ? brandName[0] : 'B'}
                  </div>
                </div>
                <span className="font-black text-xs truncate">@{brandName.toLowerCase().replace(/\s+/g, '_')}</span>
                <span className="px-2 py-0.5 rounded-full border border-white/40 text-[9px] font-bold uppercase backdrop-blur-md">
                  Sponsored
                </span>
              </div>

              <p className="text-[11px] text-zinc-200 line-clamp-2 leading-relaxed">
                <strong>{headline}:</strong> {description}
              </p>

              <div className="flex items-center gap-1 text-[10px] text-zinc-300">
                <Music2 className="w-3 h-3 text-white animate-pulse" />
                <span className="truncate">Original Audio • {brandName} Official</span>
              </div>

              {/* Floating "I'm Interested" CTA */}
              <button
                type="button"
                onClick={handleCta}
                className="btn-shimmer w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                <span>{ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* C. YOUTUBE SHORTS (9:16 VERTICAL MOBILE FRAME) */}
        {/* ========================================================= */}
        {selectedFormat === 'YOUTUBE_SHORT' && (
          <div className="w-[310px] sm:w-[330px] aspect-[9/16] bg-black rounded-[36px] overflow-hidden border-4 border-zinc-900 shadow-2xl relative flex flex-col justify-between p-4 text-white transition-all duration-300 animate-in fade-in">
            {/* Video / Media */}
            <div className="absolute inset-0 z-0">
              {isVideoAsset ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={mediaUrl} alt={headline} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90 pointer-events-none" />
            </div>

            {/* YouTube Shorts Top Bar */}
            <div className="relative z-10 flex justify-between items-center pt-2">
              <div className="flex items-center gap-1.5">
                <div className="px-2 py-0.5 rounded-md bg-red-600 font-black text-[10px] flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-white" />
                  <span>Shorts</span>
                </div>
                <span className="px-1.5 py-0.5 rounded bg-yellow-500 text-black font-black text-[9px]">Ad</span>
              </div>
              <button
                type="button"
                onClick={handleToggleMute}
                className="p-1.5 rounded-full bg-black/60 backdrop-blur-md hover:bg-black/80"
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            </div>

            {/* YouTube Shorts Right Action Stack */}
            <div className="absolute right-3 bottom-24 z-10 flex flex-col items-center space-y-4">
              <button type="button" onClick={handleLike} className="flex flex-col items-center gap-1 group">
                <div className={`p-2.5 rounded-full backdrop-blur-md transition-all ${isLiked ? 'bg-white text-red-600 scale-110' : 'bg-black/50 text-white'}`}>
                  <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-red-600' : ''}`} />
                </div>
                <span className="text-[10px] font-bold">28k</span>
              </button>

              <div className="flex flex-col items-center gap-1">
                <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
                  <ThumbsDown className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Dislike</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">890</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
                  <Share2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Share</span>
              </div>

              <div className="flex flex-col items-center gap-1">
                <div className="p-2.5 rounded-full bg-black/50 backdrop-blur-md">
                  <Repeat2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold">Remix</span>
              </div>
            </div>

            {/* Bottom Shorts Channel Bar & CTA */}
            <div className="relative z-10 space-y-2.5 pb-1 max-w-[220px]">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-red-600 flex items-center justify-center font-bold text-[10px]">
                  {brandName ? brandName[0] : 'Y'}
                </div>
                <span className="font-bold text-xs truncate">@{brandName.replace(/\s+/g, '')}</span>
                <button
                  type="button"
                  onClick={() => setIsSubscribed(!isSubscribed)}
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-black transition-colors ${isSubscribed ? 'bg-zinc-700 text-white' : 'bg-white text-black hover:bg-zinc-200'}`}
                >
                  {isSubscribed ? 'Subscribed' : 'Subscribe'}
                </button>
              </div>

              <div className="font-black text-xs leading-snug line-clamp-2">
                {headline} • {description}
              </div>

              {/* YouTube Shorts Clickable Action Button */}
              <button
                type="button"
                onClick={handleCta}
                className="btn-shimmer w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                <span>{ctaText}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* D. YOUTUBE VIDEO AD (16:9 WIDESCREEN IN-STREAM PLAYER) */}
        {/* ========================================================= */}
        {selectedFormat === 'YOUTUBE_VIDEO' && (
          <div className="w-full max-w-lg bg-black rounded-3xl overflow-hidden border border-zinc-800 shadow-2xl transition-all duration-300 animate-in fade-in">
            {/* Top Bar */}
            <div className="p-3 bg-zinc-950/80 border-b border-zinc-800 text-white flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="px-2 py-0.5 bg-yellow-500 text-black font-black text-[9px] rounded">Ad • 0:15</span>
                <span className="font-black truncate">{headline} - {brandName}</span>
              </div>
              <span className="text-zinc-400 text-[10px] font-mono shrink-0">1080p HD</span>
            </div>

            {/* Widescreen 16:9 Frame */}
            <div className="relative aspect-video bg-black flex items-center justify-center group">
              {isVideoAsset ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-contain"
                />
              ) : (
                <img src={mediaUrl} alt={headline} className="w-full h-full object-cover" />
              )}

              {/* YouTube Skip Ad Overlay Widget */}
              <div className="absolute bottom-12 right-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert("Simulated: Ad Skipped")}
                  className="px-3.5 py-1.5 bg-black/80 hover:bg-black text-white text-[11px] font-bold rounded-lg border border-white/20 backdrop-blur-md flex items-center gap-1 shadow-lg"
                >
                  <span>Skip Ad in {skipSeconds}s</span>
                  <span className="text-red-500 font-bold">▶|</span>
                </button>
              </div>

              {/* Floating CTA Banner */}
              <div className="absolute top-4 left-4 p-2.5 bg-black/75 backdrop-blur-md rounded-2xl border border-white/10 text-white max-w-[260px] shadow-lg">
                <div className="text-[11px] font-black truncate">{headline}</div>
                <div className="text-[9px] text-zinc-300 truncate">{productName}</div>
                <button
                  type="button"
                  onClick={handleCta}
                  className="btn-shimmer mt-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black rounded-lg uppercase tracking-wider block text-center w-full"
                >
                  {ctaText}
                </button>
              </div>
            </div>

            {/* YouTube Player Control Bar */}
            <div className="p-3 bg-zinc-950 text-white flex justify-between items-center text-xs">
              <div className="flex items-center gap-3">
                <button type="button" onClick={handleTogglePlay} className="hover:text-red-500">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                <button type="button" onClick={handleToggleMute} className="hover:text-red-500">
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <div className="w-36 sm:w-48 h-1 bg-zinc-700 rounded-full overflow-hidden relative">
                  <div className="w-2/5 h-full bg-red-600" />
                </div>
                <span className="text-[10px] text-zinc-400 font-mono">0:06 / 0:15</span>
              </div>
              <button
                type="button"
                onClick={handleCta}
                className="btn-shimmer px-4 py-1.5 bg-red-600 text-white font-black text-[10px] uppercase rounded-xl"
              >
                Visit Site
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* E. TIKTOK VIDEO (9:16 VERTICAL FOR YOU FEED) */}
        {/* ========================================================= */}
        {selectedFormat === 'TIKTOK_VIDEO' && (
          <div className="w-[310px] sm:w-[330px] aspect-[9/16] bg-black rounded-[36px] overflow-hidden border-4 border-zinc-900 shadow-2xl relative flex flex-col justify-between p-4 text-white transition-all duration-300 animate-in fade-in">
            {/* Background Media */}
            <div className="absolute inset-0 z-0">
              {isVideoAsset ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={mediaUrl} alt={headline} className="w-full h-full object-cover" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/90 pointer-events-none" />
            </div>

            {/* TikTok Top Nav */}
            <div className="relative z-10 flex justify-center items-center pt-2 gap-4 text-xs font-bold text-zinc-400">
              <span>Following</span>
              <span className="text-white border-b-2 border-white pb-0.5">For You</span>
            </div>

            {/* TikTok Right Action Stack */}
            <div className="absolute right-3 bottom-20 z-10 flex flex-col items-center space-y-3.5">
              {/* Creator Profile with (+) button */}
              <div className="relative mb-2">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-tr from-cyan-400 to-pink-500 flex items-center justify-center font-black text-xs text-black">
                  {brandName ? brandName[0] : 'T'}
                </div>
                <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold">
                  +
                </div>
              </div>

              <button type="button" onClick={handleLike} className="flex flex-col items-center gap-0.5">
                <Heart className={`w-7 h-7 ${isLiked ? 'text-pink-500 fill-pink-500' : 'text-white'}`} />
                <span className="text-[10px] font-bold">54.2k</span>
              </button>

              <div className="flex flex-col items-center gap-0.5">
                <MessageCircle className="w-7 h-7" />
                <span className="text-[10px] font-bold">1.8k</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <Bookmark className="w-7 h-7" />
                <span className="text-[10px] font-bold">8.4k</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <Share2 className="w-7 h-7" />
                <span className="text-[10px] font-bold">3.2k</span>
              </div>

              {/* Spinning Vinyl Record */}
              <div className="w-9 h-9 rounded-full bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center animate-spin mt-2">
                <Disc className="w-5 h-5 text-pink-500" />
              </div>
            </div>

            {/* Bottom Caption & TikTok Shop Banner */}
            <div className="relative z-10 space-y-2 pb-1 max-w-[220px]">
              <div className="font-black text-xs">@{brandName.toLowerCase().replace(/\s+/g, '')}</div>
              <p className="text-[11px] text-zinc-200 line-clamp-2 leading-relaxed">
                {headline} 🔥 #fyp #ad #viral #trending
              </p>
              
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-300">
                <Music2 className="w-3 h-3 text-cyan-400" />
                <span className="truncate">♫ Original Sound - {brandName}</span>
              </div>

              <button
                type="button"
                onClick={handleCta}
                className="btn-shimmer w-full py-2.5 bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-600 hover:to-cyan-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-1.5"
              >
                <span>Shop Now • {ctaText}</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* F. FACEBOOK FEED (4:5 NEWS FEED CARD) */}
        {/* ========================================================= */}
        {selectedFormat === 'FACEBOOK_FEED' && (
          <div className="w-full max-w-sm bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden transition-all duration-300 animate-in fade-in text-black">
            {/* FB Header */}
            <div className="p-3.5 flex justify-between items-center border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs">
                  {brandName ? brandName[0] : 'F'}
                </div>
                <div>
                  <div className="font-black text-black text-xs flex items-center gap-1">
                    <span>{brandName}</span>
                    <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-500" />
                  </div>
                  <span className="text-[10px] text-zinc-400 font-semibold block leading-none">Sponsored • 🌐</span>
                </div>
              </div>
              <MoreHorizontal className="w-4 h-4 text-zinc-400" />
            </div>

            {/* Post Copy */}
            <div className="p-3 text-xs text-zinc-800 leading-relaxed font-medium">
              {description}
            </div>

            {/* Media Area */}
            <div className="relative aspect-[4/5] bg-black overflow-hidden flex items-center justify-center group">
              {isVideoAsset ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={mediaUrl} alt={headline} className="w-full h-full object-cover" />
              )}
            </div>

            {/* FB Link Preview Card with CTA */}
            <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex justify-between items-center">
              <div className="truncate mr-2">
                <span className="text-[9px] uppercase font-bold text-zinc-400 block">{brandName.toUpperCase()}.COM</span>
                <div className="font-black text-black text-xs truncate">{headline}</div>
              </div>
              <button
                type="button"
                onClick={handleCta}
                className="btn-shimmer px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-sm shrink-0"
              >
                {ctaText}
              </button>
            </div>

            {/* FB Action Bar */}
            <div className="p-2.5 border-t border-zinc-100 flex justify-around text-zinc-600 text-xs font-bold">
              <button type="button" onClick={handleLike} className="flex items-center gap-1.5 hover:text-blue-600">
                <ThumbsUp className={`w-4 h-4 ${isLiked ? 'text-blue-600 fill-blue-600' : ''}`} />
                <span>Like</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-black">
                <MessageCircle className="w-4 h-4" />
                <span>Comment</span>
              </button>
              <button type="button" className="flex items-center gap-1.5 hover:text-black">
                <Share2 className="w-4 h-4" />
                <span>Share</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* G. X (TWITTER) PROMOTED TWEET */}
        {/* ========================================================= */}
        {selectedFormat === 'TWITTER_X' && (
          <div className="w-full max-w-md bg-white rounded-3xl border border-zinc-200 shadow-xl overflow-hidden transition-all duration-300 animate-in fade-in p-4 text-black space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-full bg-black text-white font-black flex items-center justify-center text-xs">
                {brandName ? brandName[0] : 'X'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1">
                  <span className="font-black text-xs truncate">{brandName}</span>
                  <CheckCircle className="w-3 h-3 text-blue-500 fill-blue-500" />
                  <span className="text-[11px] text-zinc-400">@{brandName.toLowerCase().replace(/\s+/g, '')}</span>
                </div>
                <span className="text-[9px] text-zinc-400 font-bold block">Promoted</span>
              </div>
            </div>

            <p className="text-xs text-zinc-800 leading-relaxed font-medium">
              {headline} — {description}
            </p>

            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-zinc-200 flex items-center justify-center">
              {isVideoAsset ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img src={mediaUrl} alt={headline} className="w-full h-full object-cover" />
              )}
            </div>

            <div className="pt-1 flex justify-between items-center border-t border-zinc-100">
              <div className="flex items-center gap-4 text-zinc-500 text-xs">
                <button type="button" onClick={handleLike} className="flex items-center gap-1 hover:text-red-600">
                  <Heart className={`w-4 h-4 ${isLiked ? 'text-red-600 fill-red-600' : ''}`} />
                  <span>2.4k</span>
                </button>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  <span>340</span>
                </div>
                <div className="flex items-center gap-1">
                  <Repeat2 className="w-4 h-4" />
                  <span>580</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleCta}
                className="btn-shimmer px-4 py-2 bg-black hover:bg-zinc-800 text-white font-black text-xs uppercase rounded-xl"
              >
                {ctaText}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
