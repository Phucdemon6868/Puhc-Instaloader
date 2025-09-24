export interface MediaResource {
  src: string;
  width: number;
  height: number;
}

export interface MediaItem {
  id: string;
  type: "image" | "video";
  display_url: string;
  resources?: MediaResource[];
  video_url?: string;
  accessibility_caption?: string;
  dimensions?: {
    width: number;
    height: number;
  };
}

export interface OwnerInfo {
  id:string;
  username: string;
  avatar: string;
}

export interface PostInfo {
  id: string;
  shortcode: string;
  taken_at: string;
  caption?: string;
  like_count?: number;
  comment_count: number;
  is_private?: boolean;
  owner: OwnerInfo;
  media: MediaItem[];
}

export interface ProfileInfo {
  id: string;
  username: string;
  avatar: string;
  media_count: number;
  followers_count: number;
  following_count: number;
  biography?: string;
}

export interface HighlightInfo {
    id: string;
    title: string;
    owner: OwnerInfo;
    media_count: number;
    items: MediaItem[];
}


export interface Settings {
  proxy: string;
  docId: string;
  username: string;
  password: string;
}