# Adding News Posts and Announcements — A Guide for Pastor T

This guide is written for you, Pastor Andrew, to publish news posts and
front-page announcements on kothoministries.org **without needing a
developer, a special program, or any technical background.** Everything
happens in your web browser, on the github.com website, the same way you'd
edit a document on any website.

You do not need to install anything. You do not need to know what a
"terminal" or "code editor" is — those words won't come up again after this
paragraph.

Read this whole document once before you start. It's longer than it needs
to be for any one post, but it covers everything you'll ever need, so you
can come back to just the section you need next time.

---

## A few words, explained once

You'll see these words below. Here's what each one means, in plain terms:

- **The repository** ("repo" for short): this is the folder, on the
  github.com website, that holds every file that makes up the website —
  including the news posts. Think of it as a filing cabinet in the cloud.
- **A file**: same as a file on your computer — a document with a name.
  Each news post is one file.
- **Markdown**: a very simple way of writing "bold," "headings," and lists
  using plain typed symbols instead of buttons — covered in its own
  section below. You don't need to know it yet.
- **Frontmatter**: a short block at the very top of each news post file
  that holds information *about* the post (its title, its date, a short
  summary) separately from the post itself. It always sits between two
  lines that just say `---`.
- **Commit**: GitHub's word for "save this change." Every time you save,
  you write a one-line note describing what you changed — think of it as
  the subject line of an email.
- **Pull request** (PR): a proposed change, waiting to be reviewed and
  published. Saving a file on github.com creates one of these
  automatically, as explained below — you don't have to do anything extra
  to create it.
- **Checks**: automatic tests the website runs on your change before it
  goes live, to make sure nothing is broken. They take about a minute.
- **Merge**: the final step that actually publishes your change to the
  live site.
- **Preview**: a private, temporary version of the site showing exactly
  what your change will look like, before anyone else can see it.

---

## Part 1 — Writing a news post

### Step by step

1. Go to **github.com** and sign in with your account.
2. Go to the repository: **github.com/kefimoto/kothom**
3. Click into the **`content`** folder, then click into the **`news`**
   folder. You'll see the existing posts sitting there as files, for
   example `welcome.md` and `back-to-school-drive.md`.
4. Click the **"Add file"** button (top right of the file list), then
   choose **"Create new file."**
5. In the box that appears for the file name, type a short, web-friendly
   name for your post, ending in `.md` — for example:

   ```
   fall-clothing-closet.md
   ```

   **This filename becomes part of the post's web address.** A file
   named `fall-clothing-closet.md` will be published at
   `kothoministries.org/news/fall-clothing-closet`. So:
   - Use only lowercase letters, numbers, and hyphens (`-`) between words.
   - No spaces, no apostrophes, no capital letters, no punctuation.
   - Once a post has been live for a while, don't rename its file — that
     changes its web address and breaks any link someone may have shared
     to it.

6. In the big empty text box, paste the template below, then fill it in
   for your post. Keep the two `---` lines exactly as they are — see
   "Why the `---` lines matter" below.

### The template

Copy this whole block into the new file and fill in your own words:

```
---
title: Fall Clothing Closet Now Open
date: 2026-09-01
summary: We've opened a small clothing closet at the office for families in our program — coats, shoes, and school clothes, available by appointment.
author: Pastor Andrew S. Trexler
draft: false
---

Write the full post here, below the second `---` line. This is the part
visitors actually read.

## A heading if you want one

Regular paragraphs, just like this one.
```

### What each line in the template means

| Line | What it means | Rules |
|---|---|---|
| `title:` | The headline of the post, shown large at the top of the page and in the news list. | Keep it under about 120 characters (roughly one sentence). |
| `date:` | The date the post is dated. Controls where it sits in the news list — newest first. | Must be written exactly as `YYYY-MM-DD` — four-digit year, two-digit month, two-digit day, dashes in between. Example: September 1st, 2026 is `2026-09-01`. Not `9/1/2026`, not `September 1, 2026`. |
| `summary:` | One or two sentences that show up under the title in the news list, and are used when the post is shared (for example, if someone pastes the link in a text message). | Keep it under about 300 characters — a couple of sentences is right. |
| `author:` | Whose name shows under the date. | Optional — leave the whole line out if you don't want a byline. |
| `draft:` | Whether the post is visible to the public. | Optional. Leave it out, or set it to `false`, to publish normally. Set it to `true` to hide it — see "Draft posts" below. |

Everything below the second `---` line is the body of the post — write it
however long or short it needs to be.

### Why the `---` lines matter

The two `---` lines are a fence. Everything between them is information
*about* the post (the frontmatter). Everything below the second one is the
post itself. **The website's automatic checks require exactly these two
fences, each on their own line, with nothing else on that line.** If a
fence is missing, extra, or has anything else typed on the same line, the
whole file will fail its checks — see "What a red X means," below, for
exactly what that looks like and how to fix it.

### Draft posts — saving work without publishing it

If you're partway through writing a post and want to save your progress
without anyone being able to see it, set:

```
draft: true
```

A post with `draft: true` is saved in the repository, but the website
skips it completely — it doesn't appear in the news list, and its web
address doesn't exist at all (a visitor who somehow guessed the address
would just get a "page not found," not a leaked draft). When it's ready to
go live, come back, change the line to `draft: false` (or delete the line
entirely), and commit the change the same way as any other edit.

---

## Part 2 — Putting an announcement on the front page

This is a different, single file — used for something time-sensitive you
want visitors to see the moment they land on the homepage (a toy drive, a
schedule change, an office closure).

1. Go to **`content/announcement.md`** in the repository (it's at the top
   level of `content`, not inside the `news` folder).
2. Click the pencil icon to edit it.
3. Change:

   ```
   active: false
   ```

   to:

   ```
   active: true
   ```

4. While you're there, update `title:` and the text underneath the second
   `---` line to say whatever you want the banner to say.
5. Commit the change (see Part 3, below, for exactly what happens next).

### It does not turn itself off

**This is important: the banner stays on the homepage until you manually
set `active: false` again.** There is no expiration date and no automatic
"take this down after the event passes." If you turn on a banner for a
toy drive that ends December 20th, it will still be sitting on the
homepage in February unless you come back and switch it off yourself. Put
a reminder somewhere you'll actually see it.

---

## Part 3 — What happens after you click "Commit changes"

When you're done editing any file, scroll to the bottom of the page. You'll
see a box asking you to describe your change — type a short plain-English
note (for example, "Add fall clothing closet post") and click the green
**"Commit changes"** button.

A small window will pop up. It may offer you two choices:

- ○ Commit directly to the `main` branch
- ● **Create a new branch for this commit and start a pull request** ← pick this one

**Always pick the second one.** If the first one is greyed out or missing,
that's fine and expected — the site is deliberately set up so that nothing
reaches the public without a review step, and that setting is what greys it
out. Leave the branch name it suggests exactly as it is, and click
**"Propose changes."**

Then, here's what happens, in order:

1. **GitHub creates a pull request** — a page where your change waits to be
   checked and approved. Nothing is live yet.
2. **Automatic checks run**, usually finishing within a minute or two.
   These make sure your file is formatted correctly and the site still
   builds properly with your change included.
3. **A preview link appears** on the pull request page. Click it, and
   you'll see a full, working version of the site with your change on it
   — exactly as it will look once published, but only visible to people
   with the link. Read it over here first.
4. Once the checks finish and the preview looks right, someone (you, or
   whoever else has access) clicks **"Merge pull request."** That's the
   step that actually publishes it — within a minute or two, your change
   is live at kothoministries.org.

Nothing you save on github.com goes live immediately. There's always this
review step in between, which is exactly what gives you the chance to
catch a typo or a mistake before the public sees it.

### What a red X means (and that it's safe)

If a check fails, you'll see a **red X** next to it instead of a green
checkmark. This can look alarming, but here's the important part:

**A red X means your change hasn't been published yet — not that anything
on the live site is broken.** The site visitors currently see is
completely unaffected. Nothing breaks. Take your time.

Click the red X (or "Details" next to it) to see why it failed. The
message is written to point at the actual problem. For example, if you
forgot to include a `summary:` line, you'll see something like:

```
content/news/fall-clothing-closet.md — error Required — summary
```

Read that as: *"the file `content/news/fall-clothing-closet.md` is
missing something the `summary` line is required to have."* To fix it:

1. Go back to the file (`content/news/fall-clothing-closet.md`) on
   github.com.
2. Click the pencil icon to edit it again.
3. Add the missing line (in this example, a `summary:` line in the
   frontmatter).
4. Commit the change again — the checks will automatically re-run on your
   fix.

You can repeat this as many times as you need. There's no penalty for a
failed check; it's simply the site telling you what to fix before it will
publish.

---

## Part 4 — Basic Markdown

You don't need any of this to publish a plain post — a few paragraphs of
plain text work perfectly fine. Use these only if you want to add some
light formatting.

| To get this... | Type this... |
|---|---|
| A heading | `## A Heading Here` (see note below on `##` vs `#`) |
| A smaller heading | `### A Smaller Heading` |
| **Bold text** | `**Bold text**` |
| *Italic text* | `*Italic text*` |
| A bullet list | A line starting with `-` for each item |
| A link | `[the words that show as the link](https://example.com)` |

**Important: start headings inside a post with `##`, not a single `#`.**
The post's title (from the `title:` line) is already shown as the biggest
heading at the top of the page — a single `#` inside the post would try to
compete with it at the same size, which isn't what you want. `##` gives
you a proper section heading sized to sit underneath it.

---

## Part 5 — Adding a photo

1. In the `content/news` folder on github.com, click **"Add file" →
   "Upload files,"** and upload your photo (a `.jpg` or `.png` works
   well). Give it a simple name with no spaces, for example
   `clothing-closet-photo.jpg`.
2. Upload it into the **same folder** as the post it belongs to — right
   alongside the `.md` file.
3. To use it as the big photo at the top of the post, add a `cover:` line
   to the frontmatter, naming the file:

   ```
   ---
   title: Fall Clothing Closet Now Open
   date: 2026-09-01
   summary: We've opened a small clothing closet at the office for families in our program.
   author: Pastor Andrew S. Trexler
   cover: clothing-closet-photo.jpg
   ---
   ```

4. To place a photo in the middle of the post's text instead (or in
   addition), write this on its own line wherever you want it to appear:

   ```
   ![A short description of the photo](clothing-closet-photo.jpg)
   ```

   The words in the square brackets aren't shown on the page — they're
   read aloud by screen readers for visitors who can't see the image, so
   make them a genuine, short description of what's in the photo.

---

## Part 6 — Things that will break the page

A handful of small mistakes cause almost all the check failures you'll
ever see. Watch for these:

- **A missing `---` fence.** Both `---` lines have to be there, each
  alone on its own line, or the file can't be read at all.
- **A curly/smart quote pasted from Word or an iPhone.** If you write your
  post in Microsoft Word, Pages, or type it on an iPhone first and then
  paste it in, your quotation marks and apostrophes (`"`, `'`, `'`) get
  auto-converted to "curly" versions that look nicer but can break the
  frontmatter if they land inside a `title:` or `summary:` line. If a
  check fails on a line that looks totally normal, this is often why —
  retype the punctuation directly in the GitHub text box instead of
  pasting it from another program.
- **A date not written as `YYYY-MM-DD`.** `9/1/2026`, `Sept 1 2026`, and
  `2026/09/01` will all fail. It has to be `2026-09-01`.
- **Text typed to the right of a `---` fence line**, instead of the fence
  being alone on its own line.
- **A colon inside a title or summary without quotes around the whole
  line.** If you want a colon in your title (like "Toy Drive: Donations
  Open"), it's safest to wrap the whole thing in quotes:
  `title: "Toy Drive: Donations Open"`.

If you ever get stuck on one of these, it's always safe to just delete
what you pasted and start again from the template in Part 1 — nothing you
do here can affect the live site until a check passes and someone merges
it.
