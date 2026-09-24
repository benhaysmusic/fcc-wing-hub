import { test, expect } from "@playwright/test";
test("console workflow preserves independent mixes and processing", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByTestId("strip-ch1")).toBeVisible();
  await expect(
    page.getByRole("slider", { name: "Fader 1", exact: true }),
  ).toHaveAttribute("aria-valuetext", "-15.0 dB");
  await page.getByRole("button", { name: /SENDS ON FADERS OFF/ }).click();
  const send = page.getByRole("slider", { name: "Send 1", exact: true });
  await expect(send).toHaveAttribute("aria-valuetext", "-12.9 dB");
  await send.fill("75");
  await expect(send).toHaveAttribute("aria-valuetext", "0.0 dB");
  await page
    .getByRole("button", { name: "Select bus IEM 2", exact: true })
    .click();
  await expect(send).toHaveAttribute("aria-valuetext", "−∞ dB");
  await page
    .getByRole("button", { name: "Select bus IEM 1", exact: true })
    .click();
  await expect(send).toHaveAttribute("aria-valuetext", "0.0 dB");
  await page.getByRole("button", { name: "EXIT SOF ×" }).click();
  await expect(
    page.getByRole("slider", { name: "Fader 1", exact: true }),
  ).toHaveAttribute("aria-valuetext", "-15.0 dB");
  await page.getByRole("button", { name: "Solo 1", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Solo 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Mute 1", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Mute 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "EQ 1", exact: true }).click();
  await page.getByRole("button", { name: "EQ enabled" }).click();
  await page.getByRole("slider", { name: "Gain", exact: true }).fill("4");
  await page.getByRole("button", { name: "GATE", exact: true }).click();
  await page
    .getByRole("slider", { name: "Threshold", exact: true })
    .fill("-30");
  await page.getByRole("button", { name: "COMP", exact: true }).click();
  await page.getByRole("slider", { name: "Ratio", exact: true }).fill("4");
  await page.getByRole("button", { name: "INPUT", exact: true }).click();
  await page.getByRole("slider", { name: "Trim", exact: true }).fill("3");
  await page
    .getByRole("button", { name: "Select 2 VOX 2", exact: true })
    .click();
  await expect(
    page.getByRole("slider", { name: "Trim", exact: true }),
  ).toHaveValue("0");
  await page
    .getByRole("button", { name: "Select 1 VOX 1", exact: true })
    .click();
  await expect(
    page.getByRole("slider", { name: "Trim", exact: true }),
  ).toHaveValue("3");
  for (const [layer, id] of [
    ["CH 17–32", "ch18"],
    ["CH 33–A8", "a1"],
    ["CH 1–40", "ch40"],
    ["AUX", "a1"],
    ["BUSES", "b1"],
    ["DCA", "d1"],
  ]) {
    await page.getByRole("button", { name: layer, exact: true }).click();
    await expect(page.getByTestId(`strip-${id}`)).toBeAttached();
  }
  await page.getByRole("slider", { name: "Fader D2", exact: true }).fill("55");
  await page.getByRole("button", { name: "BUSES", exact: true }).click();
  await expect(
    page.getByRole("slider", { name: "Fader B2", exact: true }),
  ).toHaveAttribute("aria-valuetext", "0.0 dB");
  await page.getByRole("button", { name: /CLR SOLO/ }).click();
  await page.getByRole("button", { name: "RESET", exact: true }).click();
  await page
    .getByRole("button", { name: "RESET CONSOLE", exact: true })
    .click();
  await expect(page.getByTestId("strip-ch1")).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Solo 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(
    page.getByRole("button", { name: "Mute 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  expect(errors).toEqual([]);
});
test("desktop layouts keep console controls reachable", async ({ page }) => {
  await page.goto("/");
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1280, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    const mute = await page
      .getByRole("button", { name: "Mute M1", exact: true })
      .boundingBox();
    expect(mute!.y + mute!.height).toBeLessThanOrEqual(viewport.height);
    await expect(
      page.getByRole("button", { name: "Select bus IEM 8", exact: true }),
    ).toBeInViewport();
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.screenshot({ path: "test-results/console.png", fullPage: true });
  await page.getByRole("button", { name: /SENDS ON FADERS OFF/ }).click();
  await page.screenshot({
    path: "test-results/sends-on-faders.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "EXIT SOF ×" }).click();
  await page.getByRole("button", { name: "EQ 1", exact: true }).click();
  await page.getByRole("button", { name: "EQ enabled" }).click();
  await page.getByRole("slider", { name: "Gain", exact: true }).fill("3");
  await page.screenshot({ path: "test-results/eq.png", fullPage: true });
  await page.getByRole("button", { name: "GATE", exact: true }).click();
  await page.screenshot({ path: "test-results/gate.png", fullPage: true });
  await page.getByRole("button", { name: "COMP", exact: true }).click();
  await page.screenshot({
    path: "test-results/compressor.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "INPUT", exact: true }).click();
  await page.screenshot({ path: "test-results/input.png", fullPage: true });
  await page.getByRole("button", { name: /MIXVIEW/ }).click();
  await page.getByRole("button", { name: "DCA", exact: true }).click();
  await page.screenshot({ path: "test-results/dca.png", fullPage: true });
});

test("bus mute pulses while direct channel mute remains independent", async ({
  page,
}) => {
  await page.goto("/");
  const channelMute = page.getByRole("button", { name: "Mute 1", exact: true });
  const toggleBus = async () => {
    await page.getByRole("button", { name: "BUSES", exact: true }).click();
    await page.getByRole("button", { name: "Mute B1", exact: true }).click();
    await page.getByRole("button", { name: "CH 1–16", exact: true }).click();
  };
  await channelMute.click();
  await toggleBus();
  await expect(channelMute).toHaveAttribute("aria-pressed", "false");
  await expect(channelMute).toHaveClass(/bus-inherited/);
  await expect(channelMute).toHaveCSS("animation-name", "bus-mute-pulse");
  await toggleBus();
  await expect(channelMute).not.toHaveClass(/bus-inherited|active/);
  await toggleBus();
  await channelMute.click();
  await expect(channelMute).toHaveClass(/active/);
  await expect(channelMute).toHaveCSS("animation-name", "none");
  await toggleBus();
  await expect(channelMute).toHaveAttribute("aria-pressed", "true");
  await expect(channelMute).toHaveClass(/active/);
  await toggleBus();
  await channelMute.click();
  await expect(channelMute).toHaveClass(/bus-inherited/);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(channelMute).toHaveCSS("animation-name", "none");
  await expect(channelMute).toHaveCSS("border-top-style", "dashed");
});
