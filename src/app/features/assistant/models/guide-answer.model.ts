/**
 * One answer from the assistant (GET .../guide or POST .../guide/questions). SPOILER_CONSENT_REQUIRED: a hidden
 * achievement asked without spoilers; nothing was written. grounded: written from a licensed wiki (see sources);
 * otherwise from the model alone and possibly inaccurate. saved: a shared guide that didn't count against the day.
 * curated: a guide an admin wrote or had rewritten (shown as Reviewed).
 */
export interface GuideAnswer {
  status: 'READY' | 'SPOILER_CONSENT_REQUIRED';
  text: string | null;
  grounded: boolean;
  sources: GuideSource[];
  saved: boolean;
  createdAt: string | null;
  curated?: boolean;
}

/**
 * Where a grounded answer comes from. site (the wiki's own name, "Terraria Wiki") and licenseUrl (the license's
 * page) arrive since backend 0.17.0 and can be null: older saved guides, or wikis not re-approved yet.
 */
export interface GuideSource {
  title: string;
  url: string;
  license: string;
  site?: string | null;
  licenseUrl?: string | null;
  /** Optional: the wiki's own icon, if the backend ever sends it. Otherwise the app tries {host}/favicon.ico. */
  iconUrl?: string | null;
}
