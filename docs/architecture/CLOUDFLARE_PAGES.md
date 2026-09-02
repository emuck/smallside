# Cloudflare Pages portability

Updated: 2026-08-29

Cloudflare Pages is a supported deployment target for SmallSide, useful when you want a custom domain or the security headers described below. A coach forking the repository for their own team most easily deploys to [GitHub Pages](GITHUB_PAGES.md) instead, since it needs no external account beyond GitHub — use Cloudflare Pages when a custom domain or those headers matter to you. Core planning, learning and field-delivery features must remain deployable as static HTML, CSS, JavaScript, JSON and SVG on either target.

Cloudflare supports static HTML sites with a custom output directory and no framework build. If dynamic behavior is later required, Pages Functions run on the Workers runtime rather than as a persistent server or writable local filesystem.

## Architecture constraint

Every core feature must:

- work from static assets using relative URLs;
- avoid dependence on nginx-only routing or headers;
- avoid dependence on Python, systemd or a writable server filesystem;
- render diagrams and optional movement with browser-native SVG/CSS/JavaScript;
- keep useful read-only behavior when a network request or optional backend fails;
- isolate deployment-specific writes behind an explicit adapter/API.

Local nginx and the optional Python reflection service may remain development/private deployment adapters. They must not become requirements for browsing activities, building a session, viewing a season or delivering a practice.

## Safe publication boundary

Do not deploy the repository root directly.

```text
Private repository
  |-- application source
  |-- internal docs and reviews
  |-- server/deployment files
  |-- data not approved for public publication
  |
  `-- allowlisted build
          |
          v
       dist/
         |-- index.html
         |-- assets/
         `-- approved public data
                  |
                  v
          Cloudflare Pages
```

`scripts/build-static.mjs` creates `dist/` from an allowlist. It excludes:

- `server/` and `deploy/`;
- internal docs and review reports;
- `data/reflections/`;
- unapproved team/calendar records;
- credentials and local configuration.

The public build may include an active team season only when its content is deliberately approved for public publication. Never include attendee details, contacts, private event descriptions, medical information, or reflections.

## Routing and headers

The current application uses hash routes, so deep-link routing does not require server rewrites. If clean paths are introduced, use Pages' static `_redirects` file. Security/cache headers should be represented in a Pages `_headers` file rather than relying only on nginx.

## Optional writes

Reflection saving is not part of the portable static core.

If public/multi-device writes become necessary:

```text
Browser -> Pages Function -> reviewed Cloudflare storage binding
```

That work requires authentication/authorization, CSRF/Origin protection, retention rules, threat modeling and separation between demo and private team data. Do not port the Python filesystem-write behavior directly.

## Deployment acceptance criteria

Before the first Pages deployment:

1. Build an allowlisted `dist/`.
2. Validate that every referenced asset exists inside it.
3. Scan the output for private paths, reflection data and unapproved team information.
4. Serve `dist/` locally and exercise every route.
5. Add Pages-compatible headers.
6. Review the published season data and schedule before every deployment.
7. Verify preview and production URLs without changing the LAN deployment.

## Target deployment

```text
GitHub: <your-account>/<your-fork>
          |
          | push to main
          v
Cloudflare Pages build
          |
          | node scripts/build-static.mjs
          v
Sanitized dist/ allowlist
          |
          +-- <your-project>.pages.dev
          |
          `-- your-custom-domain (optional)
```

### Project and hostname separation

If you already run other sites on Cloudflare Pages under the same account, create SmallSide as a new, independent Pages project rather than reconnecting or renaming an existing one — each project should map to exactly one GitHub repository and one set of custom domains, so a push to your SmallSide fork can't accidentally redeploy an unrelated site.

If your custom domain's DNS zone is already on Cloudflare, adding a subdomain CNAME for this project does not require or authorize any change to that zone's other (apex or unrelated) records. During setup, verify the custom-domain entry reads exactly the hostname you intend before activation.

The repository may remain private while the deployed site is public. Repository privacy does not protect the Pages URL or custom domain. Use Cloudflare Access or a deliberately designed authentication layer before deploying any private team information.

## First deployment runbook

### 1. Add the publication build

Implement `scripts/build-static.mjs` to create `dist/` from an explicit allowlist. Do not commit generated `dist/` files. The initial output should contain only:

```text
dist/
  index.html
  assets/
  _headers
  data/
    current-season.json
    library/
    profiles/
    seasons/<approved-season>/
```

The build must fail if an expected asset is missing or if the output contains unapproved team information, reflection data, credentials, absolute local paths, `server/`, `deploy/`, or internal documentation.

### 2. Validate locally

Run the content validator and regression tests, build `dist/`, scan the result, and serve only `dist/` on a local test port. Exercise every application route in both Field and Dark views before publishing.

### 3. Create the Pages project

In the Cloudflare dashboard:

1. Open **Workers & Pages** and create a Pages application using Git integration.
2. Authorize Cloudflare to access your fork's GitHub repository.
3. Select `main` as the production branch.
4. Use these build settings:

| Setting | Value |
|---|---|
| Project name | `smallside` |
| Framework preset | None |
| Production branch | `main` |
| Build command | `node scripts/build-static.mjs` |
| Build output directory | `dist` |
| Root directory | Leave blank (repository root) |

5. Save and deploy. Cloudflare will assign the initial `smallside.pages.dev` hostname if it is available; the exact `pages.dev` project hostname is fixed when the project is created.

Every subsequent push to `main` should create a production deployment. Use Cloudflare preview deployments for branches and pull requests.

### 4. Verify the Pages deployment

Before attaching the custom domain, verify the generated `pages.dev` URL:

- all hash routes load and refresh correctly;
- JSON and diagram assets resolve with relative URLs;
- no repository-only files are reachable;
- no unapproved season, calendar or reflection data appears in responses;
- Field/Dark selection persists locally;
- mobile and print layouts remain usable.

The current hash-based router does not require a Pages rewrite. If clean URL paths are introduced later, generate a `dist/_redirects` file.

### 5. Attach your custom domain (optional)

In the Pages project, open **Custom domains**, choose **Set up a domain**, enter your chosen hostname, and activate it.

If that domain's DNS zone is already on Cloudflare in the same account, Cloudflare should create the DNS record and provision HTTPS. Otherwise, add this record with the authoritative DNS provider when Cloudflare prompts for it:

| Type | Name | Target |
|---|---|---|
| CNAME | your chosen subdomain | the assigned `<your-project>.pages.dev` hostname |

Do not create the CNAME independently before adding the hostname through the Pages **Custom domains** workflow; Pages must first associate and validate the hostname.

### 6. Apply static security headers

The publication build should copy a reviewed `_headers` file into `dist/`. Start with protections such as `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`, and frame restrictions. Review a Content Security Policy separately because the current typography loads CSS and font files from Google Fonts.

### 7. Preserve any other deployment you already run

If you're also running SmallSide on a different host (a LAN box, another PaaS) while testing Pages, don't let this publication step alter that other deployment's service, calendar synchronization, or local reflection workflow. Retire or change it only once the hosted version meets your privacy and reliability needs.

## Later private features

See [D1 feedback integration](D1_FEEDBACK.md) for the proposed data model, local Wrangler test environment, security gates, synchronization workflow, and current cost estimate.


Do not place the Python feedback service or filesystem writes in the Pages output. If multi-device reflection saving or a private team season is required, design it as a separate reviewed capability:

```text
Browser -> authenticated Pages Function -> Cloudflare storage
```

That phase requires authentication and authorization, Origin/CSRF controls, retention rules, secrets management, and a firm separation between public demonstration data and private coach/team data.

## Official references

- [Cloudflare Pages: Static HTML](https://developers.cloudflare.com/pages/framework-guides/deploy-anything/)
- [Git integration](https://developers.cloudflare.com/pages/get-started/git-integration/)
- [Custom domains](https://developers.cloudflare.com/pages/configuration/custom-domains/)
- [Build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/)
- [Redirects](https://developers.cloudflare.com/pages/configuration/redirects/)
- [Custom HTTP headers](https://developers.cloudflare.com/pages/how-to/add-custom-http-headers/)
- [Pages Functions](https://developers.cloudflare.com/pages/functions/)
