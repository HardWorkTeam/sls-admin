import { describe, expect, it } from "vitest";
import { escapeHtml, sanitizeSvg } from "./utils";

describe("sanitizeSvg", () => {
  it("strips <script> smuggled inside SVG markup", () => {
    const dirty = `<svg xmlns="http://www.w3.org/2000/svg"><script>document.title='x'</script><rect/></svg>`;
    const clean = sanitizeSvg(dirty);

    expect(clean).not.toContain("<script");
    expect(clean).not.toContain("document.title");
  });

  it("strips event-handler attributes", () => {
    const dirty = `<svg xmlns="http://www.w3.org/2000/svg"><rect onload="alert(1)" onclick="steal()" /></svg>`;
    const clean = sanitizeSvg(dirty);

    expect(clean).not.toContain("onload");
    expect(clean).not.toContain("onclick");
    expect(clean).not.toContain("alert(1)");
  });

  it("neutralizes javascript: hrefs while keeping the shape", () => {
    const dirty = `<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><rect/></a></svg>`;
    const clean = sanitizeSvg(dirty);

    expect(clean).not.toContain("javascript:");
  });

  it("preserves a benign QR SVG (rects survive)", () => {
    const qr = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 4"><rect x="0" y="0" width="1" height="1"/><rect x="2" y="2" width="1" height="1"/></svg>`;
    const clean = sanitizeSvg(qr);

    expect(clean).toContain("<svg");
    expect((clean.match(/<rect/g) ?? []).length).toBe(2);
  });
});

describe("escapeHtml", () => {
  it("escapes an XSS payload in a guest name", () => {
    const clean = escapeHtml(`<img src=x onerror="alert(document.cookie)">`);

    expect(clean).not.toContain("<img");
    expect(clean).toBe(
      "&lt;img src=x onerror=&quot;alert(document.cookie)&quot;&gt;",
    );
  });

  it("escapes all five special characters", () => {
    expect(escapeHtml(`&<>"'`)).toBe("&amp;&lt;&gt;&quot;&#39;");
  });

  it("leaves ordinary names untouched", () => {
    expect(escapeHtml("Sok Dara")).toBe("Sok Dara");
  });
});
