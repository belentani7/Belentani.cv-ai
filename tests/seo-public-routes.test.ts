import sitemap from "@/app/sitemap";
import robots from "@/app/robots";

describe("SEO público de CV Studio", () => {
  it("incluye sólo inicio y estudio en el sitemap", () => {
    const entries = sitemap();
    expect(entries.map((entry) => new URL(entry.url).pathname)).toEqual(["/", "/cv"]);
    expect(new Set(entries.map((entry) => entry.url)).size).toBe(2);
  });

  it("declara el sitemap y excluye APIs y editores privados", () => {
    const config = robots();
    expect(new URL(config.sitemap as string).pathname).toBe("/sitemap.xml");
    const rules = config.rules as { disallow?: string[] };
    expect(rules.disallow).toEqual(expect.arrayContaining(["/api/", "/cv/editor/", "/cv/drafts/"]));
    expect(rules.disallow).not.toContain("/manos-abiertas/");
  });
});
