# 1. Launch as a static site on GitHub Pages, with Kit for sign-ups

Date: 2026-10-08. Status: accepted.

## Context

I own tenko.club at GoDaddy. It showed the default GoDaddy Website Builder page. I have a finished design concept
("Fog", Home v2 Light Glass) but no product photography yet, and Drop 01 is not ready to sell. The garment and
lookbook images in the concept are third-party Pinterest pins and cannot be published.

What the site needs today: present the brand, explain the name, collect email addresses for the club, and be cheap
and safe to run without a developer on call.

## Options considered

1. **Static HTML/CSS on GitHub Pages, Kit for sign-ups (chosen).** Free hosting and HTTPS, deploys from Git with
   tests in front of every publish, nothing to patch or log in to. Needs a public repository on GitHub Free.
2. **Shopify now.** Real checkout, but about £25–30 a month before there is anything to sell, and the theme work
   would be redone once real product data exists.
3. **GoDaddy Website Builder.** Already paid for and connected, but cannot reproduce the frosted-glass design and
   puts the site outside version control and testing.
4. **Unconventional: a single Kit landing page on the domain.** Fastest possible launch, but the design would be
   limited to Kit's templates and the brand would live on someone else's page builder.

## Decision

Option 1. The site is plain HTML and CSS in `site/`, with no JavaScript and no build step. The concept's
carousel, bag, shop and archive are left out because there are no products yet. The hero capsule shows "Drop 01 —
in the works" in place of a garment.

- Fonts (Archivo, Inter Tight, IBM Plex Mono, all SIL Open Font License) are self-hosted. Loading them from Google
  Fonts would send every visitor's IP address to Google.
- The sign-up form posts directly to Kit's form endpoint, so no server or script is needed.
- The repository is public because GitHub Free only publishes Pages from public repositories. It contains only
  the site and its tests. The concept folder stays local.
- Commits use my GitHub noreply address so my personal email is not published in the repository history.

## Consequences

- Moving to Shopify later means pointing the domain at Shopify instead. This site can be retired or kept on a
  subdomain. Nothing here locks that in.
- The page text is edited in HTML. That is fine for one person and three pages, and a CMS would be overkill.
- Anyone can read the site's source. That is true of every website's HTML anyway.
