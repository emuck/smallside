# Getting started: make SmallSide yours

This guide takes you from a copy of SmallSide to a private, personalized team
site. You do not need to edit JavaScript or understand the activity library to
follow it.

> **Keep children private.** Do not add child names, contact details, medical
> information, performance notes, or photos to this repository. A team name,
> a coach name, and a team crest are enough to personalize the site.

## Before you begin

You need a free GitHub account and a computer with [Node.js](https://nodejs.org/)
installed. Choose the current **LTS** download on the Node.js website. You will
also need a simple text editor; GitHub's web editor is fine for the small JSON
edits below.

## 1. Make your own copy

1. On the SmallSide GitHub page, choose **Fork** and create the fork in your
   own account.
2. On your fork, choose **Code**, copy the HTTPS address, and clone it using
   GitHub Desktop or your preferred Git tool.
3. Open the cloned folder in your text editor.

Your fork is your team's copy. Changes you make there do not change the
original SmallSide project.

## 2. Open the season setup page

Open a terminal in the cloned folder and run these two commands:

```bash
npm ci
python3 -m http.server 4173 --bind 127.0.0.1
```

Leave that terminal running. In a browser, open
[http://127.0.0.1:4173/tools/new-season.html](http://127.0.0.1:4173/tools/new-season.html).

The setup page runs on your computer. Choosing an image there does **not**
upload it anywhere.

## 3. Fill in your team and season

On the setup page:

1. Give the season a short folder name, such as `2027-spring-river-otters`.
   Use lowercase letters, numbers, and hyphens only.
2. Enter the public team name, nickname, coach name, time zone, and season
   dates. Use only information you are happy for anyone to see.
3. Choose your league profile and opening session from the lists. If neither
   suits your league, stop here and read [Content packs](architecture/CONTENT_PACKS.md)
   before creating a new profile.
4. Add your regular practice days and times.
5. Leave the status as **Test** while you are setting things up. You will make
   it active after checking the result.
6. Select **Generate season.json + practice-pattern.json**.

Download both generated files. Create a folder named
`data/seasons/<your-season-id>/` in your copy of SmallSide, then put the two
downloads there as `season.json` and `practice-pattern.json`.

## 4. Add a crest or coach photo

A crest is optional. A coach photo is optional too; do not use photos of
players or other children.

1. In the setup page, choose a PNG, JPEG, or WebP image in the **Team crest**
   or **Coach photo** section.
2. Add useful alt text, such as “River Otters crest.”
3. After generating the files, use the offered image download. It has the
   right filename for SmallSide.
4. Put that downloaded image in `assets/images/` in your fork. Do not rename
   it after downloading it: `season.json` already points to that filename.

If you do not want an image, leave that section empty. The site works without
one.

## 5. Create the weekly plan

The setup page creates the team details and practice pattern, but not the
weekly plan. Start with the shipped demo plan:

1. Copy `data/seasons/2027-test-modularity-demo-u9/curriculum.json` into your
   new season folder.
2. Keep its name as `curriculum.json`.
3. Open it and change the session IDs, weeks, and dates to suit your season.
   You can reuse the existing session IDs while learning the system.

Do not edit an existing activity version in place. When you are ready to add
or revise coaching material, follow [Contributing](../CONTRIBUTING.md) and
[Content packs](architecture/CONTENT_PACKS.md).

## 6. Add games only if you want to

Games are optional. If you add them, create a sanitized schedule file in your
season folder and set the `games` value in `season.json` to its path. Include
only information suitable for a public website; never include player names,
contacts, private notes, or travel details.

It is fine to keep the demo's empty schedule while you get started.

## 7. Turn on your season

Make these two small edits:

1. In `data/seasons/index.json`, add
   `"data/seasons/<your-season-id>/season.json"` to the `seasons` list.
2. In `data/current-season.json`, replace the `manifest` value with
   `data/seasons/<your-season-id>/season.json`.
3. In your new `season.json`, change `status` from `test` to `active`.
4. In the previous active season's `season.json`, change `status` to
   `archived`.

There must be exactly one active season.

## 8. Check before sharing

From the repository folder, run:

```bash
node scripts/validate-content.mjs
node scripts/test-content-validation.mjs
node scripts/test-activity-filters.cjs
node scripts/build-static.mjs
```

If all commands succeed, preview the public version with:

```bash
node scripts/serve-dist.mjs
```

Open the address it prints and check the home page, calendar, sessions, rules,
and Resources pages. Review every visible word, date, image, and link as if a
stranger were reading it.

Finally, push your changes to your fork. To publish with GitHub Pages, open
your fork's **Settings → Pages**, choose **GitHub Actions** as the source, and
push to `main`. The included workflow validates and builds the public-only
site. See [GitHub Pages portability](architecture/GITHUB_PAGES.md) for the
full deployment details.

## Need more help?

- [Content packs](architecture/CONTENT_PACKS.md) explains seasons, league
  profiles, curricula, and archives in detail.
- [Content data model](architecture/DATA_MODEL.md) explains every JSON field.
- [Deployment](operations/DEPLOYMENT.md) covers publishing and self-hosting.
- [Contributing](../CONTRIBUTING.md) explains safe activity and session edits.
