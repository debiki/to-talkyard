/// <reference path="../../client/app/constants.ts" />


type SiteData = any;


interface PageToAdd {
  dbgSrc?: string;
  id: string;
  folder: string;
  showId: boolean;
  slug: string;
  role: PageRole;
  title: string;
  body: string;
  categoryId?: CategoryId;
  authorId: UserId;
  createdAtMs?: WhenMs;
  bumpedAtMs?: WhenMs;
}


interface PageJustAdded {
  id: string;
  folder: string;
  showId: boolean;
  slug: string;
  role: number;
  title: string;
  body: string;
  categoryId: number;
  authorId: number,
  createdAtMs: number;
  updatedAtMs: number;
}


interface NewTestPost {   // RENAME to PostToAdd
  id?: number;
  // Not just page id, because needs author, creation date, etc.
  page: Page | PageJustAdded;
  authorId?: UserId; // if absent, will be the page author
  nr: number;
  parentNr?: number;
  approvedSource: string;
  approvedHtmlSanitized?: string;
}
