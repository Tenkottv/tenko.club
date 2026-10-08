# tenko.club

The website for Tenko Club, live at https://tenko.club.

It is a plain static site: three HTML pages, one stylesheet, self-hosted fonts and four fog background
images. There is no JavaScript, no build step, no cookies and no analytics.

## How it fits together

```
tenko.club (domain, GoDaddy) ──DNS──▶ GitHub Pages ──serves──▶ site/ in this repository
                                                        ▲
                       push to main ──▶ GitHub Actions: lint + browser tests ──▶ deploy

"Join the club" form ──POST──▶ Kit (mailing list)
```

| Piece | Where | Cost |
| --- | --- | --- |
| Domain | GoDaddy account, renews every November | domain renewal only |
| Hosting + HTTPS certificate | GitHub Pages on this repository | free |
| Mailing list | Kit, free Newsletter plan (up to 10,000 subscribers) | free |

## Folder layout

| Path | What it is |
| --- | --- |
| `site/` | Everything that is published: `index.html`, `privacy.html`, `404.html`, `styles.css`, `fonts/`, `img/` |
| `tests/site.spec.js` | Browser tests (Playwright) run on desktop and mobile sizes |
| `scripts/check-live.sh` | Checks the live site: HTTPS, content, redirects |
| `.github/workflows/site.yml` | Tests every pull request; deploys `main` to GitHub Pages |
| `.github/workflows/uptime.yml` | Runs `check-live.sh` every 6 hours and after each deploy |
| `docs/decisions/` | Why the site is built the way it is |

## Changing the site

1. `npm install` once, then `npx playwright install chromium`.
2. `npm run serve` and open http://localhost:4173.
3. Edit files in `site/`. Refresh the browser to see changes.
4. `npm run check` runs the HTML validator, the linter and every browser test.
5. Open a pull request. When it is merged into `main`, GitHub publishes it to tenko.club within a couple of minutes.

Text lives directly in the HTML files. The design tokens (colours, fonts, spacing) are at the top of `site/styles.css`.

## Domain settings (GoDaddy → DNS)

| Type | Name | Value |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| AAAA | @ | 2606:50c0:8000::153 |
| AAAA | @ | 2606:50c0:8001::153 |
| AAAA | @ | 2606:50c0:8002::153 |
| AAAA | @ | 2606:50c0:8003::153 |
| CNAME | www | tenkottv.github.io |
| TXT | _github-pages-challenge-Tenkottv | verification code from GitHub → Settings → Pages |

The TXT record proves to GitHub that I own the domain, so nobody else can attach it to their own site. Keep it.

Values come from GitHub's guide,
[Managing a custom domain for your GitHub Pages site](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site).

## Monitoring

- Deploys: the Actions tab shows every test run and deploy. A failed run emails me.
- Uptime: the Uptime workflow checks the live site every 6 hours. GitHub pauses scheduled workflows after 60 days
  without commits, and emails before it does; re-enable it from the Actions tab.
- Sign-ups: the Kit dashboard shows subscriber counts.

## Rolling back

Revert the bad commit on `main` (`git revert <sha>` and push, or the Revert button on the merged pull request).
The site redeploys the previous version automatically.

## Design source

The design concept lives in `concept/` in my local project folder only. It is not in this repository because it
contains third-party reference images.
