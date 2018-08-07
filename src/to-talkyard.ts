/// <reference path="to-talkyard.d.ts" />

//   ./to-talkyard --wordpressCoreXmlExportFile=...
// or right now:
//
//   nodejs dist/to-talkyard/src/to-talkyard.js  --wordpressCoreXmlExportFile file.xml




import minimist from 'minimist';
import _ from 'lodash';
import fs from 'fs';
import sax from 'sax';
import { buildSite } from '../../tests/e2e/utils/site-builder';
import c from '../../tests/e2e/test-constants';
const strict = true; // set to false for html-mode
const parser = sax.parser(strict, {});

const UnknownUserId = -2; // ??
const DefaultCategoryId = 2;

interface WpBlogPostAndComments {
  title?: string;
  link?: string;
  pubDate?: string;
  guid?: string;
  description?: string;
  contentEncoded?: string;
  excerptEncoded?: string;
  wp_post_id?: number;  // e.g. 3469
  wp_post_date?: string; // e.g. 2016-01-09 21:53:01
  wp_post_date_gmt?: string;    // e.g. 2016-01-10 03:53:01
  wp_comment_status?: string;   // e.g. open
  wp_ping_status?: string;      // e.g. open
  wp_post_name?: string;        // e.g. public-talks-h2-2016
  wp_status?: string;           // e.g. publish
  wp_post_parent?: number;      // e.g. 0
  wp_menu_order?: number;       // e.g. 0
  wp_post_type?: string;        // e.g. post
  wp_is_sticky?: number;        // e.g. 0
  category?: string;            // e.g. Announcement
  comments: WpComment[];
}

interface WpComment {
  wp_comment_id?: number;       // e.g. 267390
  wp_comment_author?: string;   // e.g. Jane
  wp_comment_author_email?: string;  // e.g. jane@example.com
  wp_comment_author_url?: string;
  wp_comment_author_ip?: string;  // e.g. 112.113.114.115
  wp_comment_date?: string;     // e.g. 2016-01-09 23:30:16
  wp_comment_date_gmt?: string; // e.g. 2016-01-10 05:30:16
  wp_comment_content?: string;  // Sarah, are you conducting any seminars this month? Please let me know.
  wp_comment_approved?: number; // e.g. 1
  wp_comment_type?: any;        // ?
  wp_comment_parent?: number;   // e.g. 0 = replies to blog post, or 267390 = replies to wp_comment_id.
  wp_comment_user_id?: number;  // e.g. 0  or 2
  //metas: CommentMeta[];
}

// Example meta:
// akismet_history -> a:3:{s:4:"time";d:1453589774.1832039356231689453125;s:5:"event";s:15:"status-approved";s:4:"user";s:6:"tanelp";}
// akismet_result -> false
// (many items with same key = yes can happen)
interface CommentMeta {
  wp_meta_key?: string;
  wp_meta_value?: string;
}


const wpPosts: WpBlogPostAndComments[] = [];

let curWpBlogPost: WpBlogPostAndComments | undefined = undefined;
let curWpComment: WpComment | undefined = undefined;
let curWpTagName: string | undefined = undefined;

const tySiteData: SiteData = {
  guests: [],
  pages: [],
  pagePaths: [],
  posts: [],
};


const builder = buildSite();


function addBlogPostAndComments(wpBlogPostAndComments: WpBlogPostAndComments) {
  const pageToAdd: PageToAdd = {
    dbgSrc: 'ToTy',
    id: 'extraPageId',
    folder: '/',
    showId: false,
    slug: 'extra-page',
    role: c.TestPageRole.Discussion,
    title: "Download $100 000 and a new car",
    body: "Type your email and password, and the you can download a new car",
    categoryId: DefaultCategoryId,
    authorId: UnknownUserId,
  };

  const pageJustAdded: PageJustAdded = builder.addPage(pageToAdd);

  const postToAdd: NewTestPost = {
    page: pageJustAdded,
    nr: c.FirstReplyNr,
    parentNr: c.BodyNr,
    authorId: c.SystemUserId,
    approvedSource: "I give you goldy golden gold coins, glittery glittering!",
  };

  builder.addPost(postToAdd);
}


interface SaxTag {
  name: string;
  isSelfClosing: boolean;
  attributes: { [key: string]: string };
}


parser.onopentag = function (tag: SaxTag) {
  curWpTagName = tag.name;

  if (tag.name === 'item') {
    if (curWpBlogPost) {} // log error: nested posts
    else if (curWpComment) {} // log error: post in comment
    else curWpBlogPost = { comments: [] };
    return;
  }

  if (tag.name === 'wp:comment') {
    if (!curWpBlogPost) {} // log error: comment outside post
    else if (curWpComment) {} // log error: comment inside comment
    else curWpComment = {};
    return;
  }
};


parser.onclosetag = function (tagName: string) {
  if (tagName === 'item' && curWpBlogPost) {
    wpPosts.push(curWpBlogPost);
    addBlogPostAndComments(curWpBlogPost);
    curWpBlogPost = undefined;
    return;
  }
  if (tagName === 'wp:comment' && curWpBlogPost && curWpComment) {
    curWpBlogPost.comments.push(curWpComment);
    curWpComment = undefined;
    return;
  }
};


parser.ontext = function (text: string) {
};


parser.oncdata = function (cdataString: string) {
  // Blog post fields.
  if (!curWpComment && curWpBlogPost) switch (curWpTagName) {
    case 'title': break;
    case 'link': break;
    case 'pubDate': break;
    case 'dc:creator': break;
    case 'guid': break;
    case 'description': break;
    case 'content:encoded': break;
    case 'excerpt:encoded': break;
    case 'wp:post_id': break;
    case 'wp:post_date': break;
    case 'wp:post_date_gmt': break;
    case 'wp:comment_status': break;
    case 'wp:ping_status': break;
    case 'wp:post_name': break;
    case 'wp:status': break;
    case 'wp:post_parent': break;
    case 'wp:menu_order': break;
    case 'wp:post_type': break;
    case 'wp:post_password': break;
    case 'wp:is_sticky': break;
    case 'category': break;
    default:
      // Ignore.
  }

  // Comment fields.
  if (curWpComment) switch (curWpTagName) {
    case 'wp:comment_id': break;
    case 'wp:comment_author': break;
    case 'wp:comment_author_email': break;
    case 'wp:comment_author_url': break;
    case 'wp:comment_author_IP': break;
    case 'wp:comment_date': break;
    case 'wp:comment_date_gmt': break;
    case 'wp:comment_content': break;
    case 'wp:comment_approved': break;
    case 'wp:comment_type': break;
    case 'wp:comment_parent': break;
    case 'wp:comment_user_id': break;
    default:
      // Ignore.
  }
};


parser.onattribute = function (attr: { name: string, value: string }) {
};


parser.onerror = function (error: any) {
};


parser.onend = function () {
  const site = builder.getSite();
  console.log(JSON.stringify(site, undefined, 2));
};


const args: any = minimist(process.argv.slice(2));

const maybeFilePath: string | undefined = args.wordpressCoreXmlExportFile;

if (!_.isString(maybeFilePath))
  throw Error("Missing: --wordpressCoreXmlExportFile=...");

const fileText = fs.readFileSync(args.wordpressCoreXmlExportFile, { encoding: 'utf8' });

console.log('fileText: ' + fileText.substring(0, 99));

parser.write(fileText).close();

