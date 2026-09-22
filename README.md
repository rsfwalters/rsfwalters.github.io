# robinwalters.com

Plain static HTML. No build step, no Jekyll, no framework. Push to the
`rsfwalters.github.io` repo and GitHub Pages serves it at
`www.robinwalters.com` (see `CNAME`).

```
index.html            About — short bio, updates, selected work
publications.html     Research — summary, all 100 papers, funding, honors, talks
lab.html              People, alumni, how to join, lab photos
teaching.html         Courses, outreach, service
pages/                CS 7180 syllabus
css/main.css          The only stylesheet
data/publications.js  Every paper. This is the file you edit.
js/site.js            Builds the publication lists, filter, abstract toggles
images/               Headshots (square, ~600px), logo, favicon
publications/images/  Paper thumbnails, shown at 74px next to each entry
lab_photos/           Lab photos
tools/                One-off scripts (thumbnail downloader)
Robin_Walters_CV.pdf  CV
.nojekyll             Tells GitHub Pages to serve files as-is
```

## How publications work

`data/publications.js` holds all 100 papers as a list of objects.
`js/site.js` reads it when the page loads and builds two things: the full list
on `publications.html` and the Selected work list on `index.html`. You never
touch the HTML to add a paper.

The tradeoff is that the list only exists once the browser runs the script.
Google executes JavaScript and will index it, but a crawler that doesn't —
and anyone browsing with JavaScript off — sees a short note pointing to the CV
and Google Scholar instead. If that ever matters to you, the static version of
this site has the same 100 papers written directly into `publications.html`.

## Adding a paper

Open `data/publications.js`. The file starts with a comment explaining every
field. Add a block at the top of the right year:

```js
 {
  "year": 2027,
  "title": "Title of the paper",
  "authors": "First Author, Robin Walters, Last Author",
  "venue": "Conference on Robot Learning (CoRL)",
  "topic": "robotics",
  "kind": "conference",
  "note": "Oral",
  "selected": false,
  "blurb": "",
  "links": [{"label": "PDF", "url": "https://arxiv.org/abs/..."}],
  "abstract": "",
  "image": ""
 },
```

Year headings, sorting, the paper count, and the filter buttons all update
themselves. `"selected": true` adds it to the home page, where `blurb` is the
one-line description that appears underneath.

**If the list ever comes up blank**, it's a comma — every entry except the last
needs one after its closing brace. Open the page, press F12, and the console
will name the line. The page shows a message rather than failing silently.

Adding a new `topic` value also means adding a label for it in `TOPIC_LABELS`
near the top of `js/site.js`, otherwise no filter button appears for it.

## Thumbnails

The first line of `js/site.js` is the switch:

```js
var SHOW_THUMBNAILS = true;   // false hides every thumbnail on the site
```

Flip it to `false` and the column disappears everywhere — publications page and
home page both. To hide just one paper's thumbnail, leave its `"image"` field
empty. To add one, drop a file in `publications/images/` and point at it:

```js
"image": "publications/images/raven.jpg"
```

A thumbnail whose file is missing removes itself rather than showing a broken
image, so a bad path degrades quietly.

Twelve thumbnails found on co-authors' project pages are referenced in
`data/publications.js` but not yet in the repo. Download them once with:

```
python3 tools/fetch_thumbnails.py
```

It saves each one under the filename the data file already expects, resizing
to 400px wide if Pillow is installed. Re-running skips what is already there;
`--force` re-fetches. If a download fails the author has probably moved the
file — replace it by hand or clear that paper's `image` field.

Images are cropped to 4:3 and displayed at 74px wide, so anything wider than
about 900px is wasted bytes. 27 of the 100 papers currently have one; entries
without an image keep the column reserved, which is what holds every title on
the same left edge.

## Adding an update

In `index.html`, inside `<div class="news">`. Newest first.

```html
<div class="item"><span class="when">Nov · </span>Text of the update.</div>
```

Add `data-old` and `class="item hidden"` to put an item behind the
"show earlier updates" button. If every item in a year is marked that way, mark
the year heading the same and it hides with them:

```html
<div class="yr hidden" data-old>2023</div>
```

## Adding a lab member

In `lab.html`, copy a `.person` block. Photos are square-cropped JPEGs around
600×600 — anything larger just slows the page down. Alumni cards add a third
line, `<p class="pnow">`, for where they went.

## Colors and type

Defined as custom properties at the top of `css/main.css`. The crimson
`#b13236` is sampled from the GL(L) lab logo. Fonts are IBM Plex Sans and
Newsreader, loaded from Google Fonts in each page's `<head>`.
