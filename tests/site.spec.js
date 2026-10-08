import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const KIT_FORM_ACTION = /^https:\/\/app\.kit\.com\/forms\/\d+\/subscriptions$/;
const PAGES = ["/", "/privacy.html"];

test.describe("home page", () => {
  test("names the brand and states what it is", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle("Tenko Club");
    await expect(page.locator("html")).toHaveAttribute("lang", "en-GB");
    await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /.{50,}/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Built for the quiet hours.");
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", "https://tenko.club/");
  });

  test("hero call to action leads to the club sign-up", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: "Join the club" }).first().click();
    await expect(page).toHaveURL(/#club$/);
    await expect(page.getByRole("heading", { name: "First light, first access." })).toBeInViewport();
  });

  test("every in-page link has a target and every page link resolves", async ({ page, request }) => {
    for (const path of [...PAGES, "/404.html"]) {
      await page.goto(path);
      const hrefs = await page.locator("a[href]").evaluateAll((links) => links.map((a) => a.getAttribute("href")));
      expect(hrefs.length, `${path} has links`).toBeGreaterThan(0);
      for (const href of hrefs) {
        if (href.startsWith("#")) {
          await expect(page.locator(href), `${path} anchor ${href}`).toHaveCount(1);
        } else if (/^https:\/\//u.test(href)) {
          // External references (processors, regulator) are not fetched: their uptime is not ours to test.
          expect(new URL(href).protocol).toBe("https:");
        } else {
          expect(href, `${path} links stay on the site`).toMatch(/^\/(?!\/)/u);
          const [file, hash] = href.split("#");
          const response = await request.get(file);
          expect(response.status(), `${path} -> ${href}`).toBe(200);
          if (hash) {
            await page.goto(href);
            await expect(page.locator(`#${hash}`)).toHaveCount(1);
            await page.goto(path);
          }
        }
      }
    }
  });
});

test.describe("club sign-up form", () => {
  test("posts the email address to Kit", async ({ page }) => {
    await page.goto("/#club");
    const form = page.locator("form#club-form");
    await expect(form).toHaveAttribute("action", KIT_FORM_ACTION);
    await expect(form).toHaveAttribute("method", "post");
    const email = page.getByLabel("Email address");
    await expect(email).toHaveAttribute("type", "email");
    await expect(email).toHaveAttribute("name", "email_address");
    await expect(email).toHaveAttribute("required", "");
    await expect(email).toHaveAttribute("autocomplete", "email");
    await expect(form.getByRole("link", { name: "privacy notice" })).toHaveAttribute("href", "/privacy.html");
  });

  test("submits a valid address and nothing else", async ({ page }) => {
    await page.goto("/#club");
    let posted = null;
    await page.route(/app\.kit\.com/, async (route) => {
      posted = route.request();
      await route.fulfill({ status: 200, contentType: "text/html", body: "<title>ok</title>" });
    });
    await page.getByLabel("Email address").fill("fox@example.com");
    await page.getByRole("button", { name: "Join" }).click();
    await expect.poll(() => posted?.method()).toBe("POST");
    expect(posted.postData()).toBe("email_address=fox%40example.com");
  });

  for (const value of ["", " ", "fox", "fox@", "@example.com"]) {
    test(`blocks submission of ${JSON.stringify(value)}`, async ({ page }) => {
      await page.goto("/#club");
      let requested = false;
      await page.route(/app\.kit\.com/, async (route) => {
        requested = true;
        await route.abort();
      });
      const email = page.getByLabel("Email address");
      await email.fill(value);
      await page.getByRole("button", { name: "Join" }).click();
      expect(await email.evaluate((input) => input.validity.valid)).toBe(false);
      expect(requested).toBe(false);
    });
  }

  test("accepts the shortest valid address", async ({ page }) => {
    await page.goto("/#club");
    const email = page.getByLabel("Email address");
    await email.fill("a@b");
    expect(await email.evaluate((input) => input.validity.valid)).toBe(true);
  });
});

test.describe("privacy notice", () => {
  test("explains what is collected, who processes it and how to leave", async ({ page }) => {
    await page.goto("/privacy.html");
    await expect(page).toHaveTitle("Privacy notice — Tenko Club");
    const main = page.getByRole("main");
    await expect(main).toContainText("email address");
    await expect(main).toContainText("Kit");
    await expect(main).toContainText("GitHub");
    await expect(main).toContainText("unsubscribe");
    await expect(main).toContainText("ico.org.uk");
  });
});

test.describe("not found page", () => {
  test("is not indexed and leads home", async ({ page }) => {
    await page.goto("/404.html");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", "noindex");
    await expect(page.getByRole("link", { name: "Back to tenko.club" })).toHaveAttribute("href", "/");
  });
});

test.describe("every page", () => {
  for (const path of [...PAGES, "/404.html"]) {
    test(`${path} loads nothing from other websites`, async ({ page, baseURL }) => {
      const origin = new URL(baseURL).origin;
      const foreign = [];
      page.on("request", (req) => {
        if (new URL(req.url()).origin !== origin) foreign.push(req.url());
      });
      const failed = [];
      page.on("response", (res) => {
        if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`);
      });
      await page.goto(path, { waitUntil: "networkidle" });
      expect(foreign).toEqual([]);
      expect(failed).toEqual([]);
      for (const font of ['900 1em "Archivo"', '400 1em "Inter Tight"', '400 1em "IBM Plex Mono"']) {
        const loaded = await page.evaluate(async (f) => (await document.fonts.load(f, "T")).length, font);
        expect(loaded, `${font} is self-hosted and loads`).toBeGreaterThan(0);
      }
    });

    test(`${path} has no accessibility violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
      expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target).join(" | ")}`)).toEqual([]);
    });

    for (const width of [320, 390, 768, 1440, 1920]) {
      test(`${path} has no sideways scroll at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  }
});
