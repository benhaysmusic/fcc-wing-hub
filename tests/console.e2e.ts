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

test("DCA mutes glow on channels and buses while bus mutes stay local", async ({
  page,
}) => {
  await page.goto("/");
  const channelMute = page.getByRole("button", { name: "Mute 1", exact: true });
  const toggleDca = async () => {
    await page.getByRole("button", { name: "DCA", exact: true }).click();
    await page.getByRole("button", { name: "Mute D1", exact: true }).click();
    await page.getByRole("button", { name: "CH 1–16", exact: true }).click();
  };
  await channelMute.click();
  await expect(channelMute).toHaveAttribute("aria-pressed", "false");
  await expect(channelMute).toHaveCSS("animation-name", "dca-mute-pulse");
  await toggleDca();
  await expect(channelMute).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await page.getByRole("button", { name: "BUSES", exact: true }).click();
  await page.getByRole("button", { name: "Mute B1", exact: true }).click();
  await page.getByRole("button", { name: "CH 1–16", exact: true }).click();
  await expect(channelMute).toHaveCSS("background-color", "rgb(0, 0, 0)");
  await expect(channelMute).toHaveCSS("animation-name", "none");
  await toggleDca();
  await expect(channelMute).toHaveCSS("animation-name", "dca-mute-pulse");
  await page.getByRole("button", { name: "BUSES", exact: true }).click();
  const busMute = page.getByRole("button", { name: "Mute B1", exact: true });
  await expect(busMute).toHaveClass(/active/);
  await expect(busMute).toHaveCSS("animation-name", "none");
  await busMute.click();
  await expect(busMute).toHaveCSS("animation-name", "dca-mute-pulse");
  await expect(
    page.getByRole("button", { name: "Mute B6", exact: true }),
  ).toHaveCSS("animation-name", "dca-mute-pulse");
  await page.getByRole("button", { name: "CH 1–16", exact: true }).click();
  await channelMute.click();
  await expect(channelMute).toHaveClass(/active/);
  await expect(channelMute).toHaveCSS("animation-name", "none");
  await toggleDca();
  await expect(channelMute).toHaveAttribute("aria-pressed", "true");
  await expect(channelMute).toHaveClass(/active/);
  await toggleDca();
  await channelMute.click();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(channelMute).toHaveCSS("animation-name", "none");
  await expect(channelMute).toHaveCSS("border-top-style", "dashed");
});

test("Sunday group and FX send defaults are visible at unity", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /SENDS ON FADERS OFF/ }).click();
  for (const [bus, channel, layer] of [
    ["VOX", "1", "CH 1–16"],
    ["GTRS", "8", "CH 1–16"],
    ["KEYS", "13", "CH 1–16"],
    ["DRUM", "18", "CH 17–32"],
    ["DRUM CRUSH", "18", "CH 17–32"],
    ["VOX VERB", "1", "CH 1–16"],
    ["VOX DLY", "1", "CH 1–16"],
    ["DRUM VERB", "18", "CH 17–32"],
  ]) {
    await page.getByRole("button", { name: layer, exact: true }).click();
    await page
      .getByRole("button", { name: `Select bus ${bus}`, exact: true })
      .click();
    await expect(
      page.getByRole("slider", { name: `Send ${channel}`, exact: true }),
    ).toHaveAttribute("aria-valuetext", "0.0 dB");
    await expect(
      page.getByRole("button", { name: `Send on ${channel}`, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", { name: "CH 1–16", exact: true }).click();
  await page
    .getByRole("button", { name: "Select bus IEM 1", exact: true })
    .click();
  await expect(
    page.getByRole("slider", { name: "Send 1", exact: true }),
  ).toHaveAttribute("aria-valuetext", "-12.9 dB");
});

test("recorded gate controls and graph handles stay synchronized per channel", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EQ 1", exact: true }).click();
  await page.getByRole("button", { name: "GATE", exact: true }).click();
  const threshold = page.getByRole("slider", {
    name: "Threshold",
    exact: true,
  });
  await threshold.fill("-34");
  await page.getByRole("slider", { name: "Range", exact: true }).fill("14.5");
  const curve = page.getByTestId("gate-curve");
  const before = await curve.getAttribute("d");
  await page.getByRole("slider", { name: "Ratio", exact: true }).fill("7");
  expect(await curve.getAttribute("d")).not.toBe(before);
  const handle = page.getByLabel("Drag gate threshold");
  const box = (await handle.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2 - 35, {
    steps: 5,
  });
  await page.mouse.up();
  const changedThreshold = await threshold.inputValue();
  expect(Number(changedThreshold)).toBeGreaterThan(-34);
  const attack = page.getByRole("slider", { name: "Attack", exact: true });
  const attackHandle = (await page
    .getByLabel("Drag attack", { exact: true })
    .boundingBox())!;
  await page.mouse.move(
    attackHandle.x + attackHandle.width / 2,
    attackHandle.y + attackHandle.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    attackHandle.x - 30,
    attackHandle.y + attackHandle.height / 2,
    { steps: 5 },
  );
  await page.mouse.up();
  expect(Number(await attack.inputValue())).toBeGreaterThan(10);
  await page
    .getByRole("button", { name: "Select 2 VOX 2", exact: true })
    .click();
  await expect(threshold).toHaveValue("-69.5");
  await page
    .getByRole("button", { name: "Select 1 VOX 1", exact: true })
    .click();
  await expect(threshold).toHaveValue(changedThreshold);
});

test("recorded input controls retain independent channel settings and fixed sections", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EQ 1", exact: true }).click();
  await page.getByRole("button", { name: "INPUT", exact: true }).click();
  const gain = page.getByRole("slider", { name: "Input gain", exact: true });
  const trim = page.getByRole("slider", { name: "Trim", exact: true });
  const balance = page.getByRole("slider", {
    name: "Input balance",
    exact: true,
  });
  await gain.fill("12.5");
  await trim.fill("13.3");
  await balance.fill("-2.7");
  const curve = await page.getByTestId("input-trim-response").getAttribute("d");
  await balance.fill("9");
  expect(
    await page.getByTestId("input-trim-response").getAttribute("d"),
  ).not.toBe(curve);
  for (const name of ["48V phantom power", "Low cut", "High cut"]) {
    await page.getByRole("button", { name, exact: true }).click();
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
  }
  await page
    .getByRole("button", { name: "Select 2 VOX 2", exact: true })
    .click();
  await expect(gain).toHaveValue("30");
  await expect(trim).toHaveValue("0");
  await expect(balance).toHaveValue("0");
  await expect(
    page.getByRole("button", { name: "48V phantom power", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page
    .getByRole("button", { name: "Select 1 VOX 1", exact: true })
    .click();
  await expect(gain).toHaveValue("12.5");
  await expect(trim).toHaveValue("13.3");
  await expect(balance).toHaveValue("9");
  await trim.dblclick();
  await expect(trim).toHaveValue("0");
  await balance.dblclick();
  await expect(balance).toHaveValue("0");
  // Exercise the same mouse drags as the recording, not just direct field edits.
  const trimBox = (await trim.boundingBox())!;
  await page.mouse.move(
    trimBox.x + trimBox.width / 2,
    trimBox.y + trimBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    trimBox.x + trimBox.width / 2,
    trimBox.y + trimBox.height / 2 - 30,
    { steps: 8 },
  );
  await page.mouse.up();
  expect(Number(await trim.inputValue())).toBeGreaterThan(0);
  const balanceBox = (await balance.boundingBox())!;
  await page.mouse.move(
    balanceBox.x + balanceBox.width / 2,
    balanceBox.y + balanceBox.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    balanceBox.x + balanceBox.width / 2 + 35,
    balanceBox.y + balanceBox.height / 2,
    { steps: 8 },
  );
  await page.mouse.up();
  expect(Number(await balance.inputValue())).toBeGreaterThan(0);
  await expect(
    page.getByRole("button", { name: "INVERT", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("slider", { name: /delay/i })).toHaveCount(0);
  for (const width of [1440, 1280]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 800 });
    const panel = (await page.locator(".wing-input").boundingBox())!;
    const filter = (await page
      .getByRole("button", { name: "High cut", exact: true })
      .boundingBox())!;
    expect(filter.x + filter.width).toBeLessThanOrEqual(panel.x + panel.width);
    const delay = (await page.locator(".input-delay-off").boundingBox())!;
    expect(delay.y + delay.height).toBeLessThanOrEqual(
      panel.y + panel.height + 1,
    );
    await page.screenshot({ path: `test-results/input-active-${width}.png` });
  }
  await page.getByRole("button", { name: "RESET", exact: true }).click();
  await page
    .getByRole("button", { name: "RESET CONSOLE", exact: true })
    .click();
  await page.getByRole("button", { name: "EQ 1", exact: true }).click();
  await page.getByRole("button", { name: "INPUT", exact: true }).click();
  await expect(gain).toHaveValue("30");
  await expect(trim).toHaveValue("0");
  await expect(balance).toHaveValue("0");
  for (const name of ["48V phantom power", "Low cut", "High cut"])
    await expect(
      page.getByRole("button", { name, exact: true }),
    ).toHaveAttribute("aria-pressed", "false");
});

test("EQ cuts share input state and change the same response in both directions", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "EQ 1", exact: true }).click();
  const curve = page.getByTestId("eq-response");
  const flat = await curve.getAttribute("d");
  await page.getByRole("button", { name: "INPUT", exact: true }).click();
  await page.getByRole("button", { name: "Low cut", exact: true }).click();
  await page.getByRole("button", { name: "EQ", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Low cut", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const low = await curve.getAttribute("d");
  expect(low).not.toBe(flat);
  await page.getByRole("button", { name: "High cut", exact: true }).click();
  const both = await curve.getAttribute("d");
  expect(both).not.toBe(low);
  await page
    .getByRole("slider", { name: "Low cut frequency", exact: true })
    .fill("800");
  const moved = await curve.getAttribute("d");
  expect(moved).not.toBe(both);
  await page.getByRole("button", { name: "INPUT", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "High cut", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Low cut", exact: true }).click();
  await page.getByRole("button", { name: "EQ", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Low cut", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  expect(await curve.getAttribute("d")).not.toBe(moved);
  await page.getByRole("button", { name: "High cut", exact: true }).click();
  await expect(curve).toHaveAttribute("d", flat!);
  await page.getByRole("button", { name: "INPUT", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "High cut", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "EQ", exact: true }).click();
  await page.getByRole("button", { name: "EQ enabled", exact: true }).click();
  await page
    .getByRole("button", { name: "Low band mode", exact: true })
    .click();
  await expect(
    page.getByRole("slider", { name: "Q", exact: true }),
  ).toBeVisible();
  await page.getByRole("slider", { name: "Gain", exact: true }).fill("6");
  const wide = await curve.getAttribute("d");
  await page.getByRole("slider", { name: "Q", exact: true }).fill("8");
  expect(await curve.getAttribute("d")).not.toBe(wide);
  const handle = (await page
    .getByLabel("Drag EQ band 1", { exact: true })
    .boundingBox())!;
  await page.mouse.move(
    handle.x + handle.width / 2,
    handle.y + handle.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    handle.x + handle.width / 2 + 40,
    handle.y + handle.height / 2 - 20,
    { steps: 8 },
  );
  await page.mouse.up();
  await expect(
    page.getByRole("button", { name: "EQ band 1", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  const gain = await page
    .getByRole("slider", { name: "Gain", exact: true })
    .inputValue();
  expect(Number(gain)).toBeGreaterThan(0);
  const retained = await curve.getAttribute("d");
  await page
    .getByRole("button", { name: "Select 2 VOX 2", exact: true })
    .click();
  await expect(curve).toHaveAttribute("d", flat!);
  await page
    .getByRole("button", { name: "Select 1 VOX 1", exact: true })
    .click();
  await expect(curve).toHaveAttribute("d", retained!);
  for (const width of [1440, 1280]) {
    await page.setViewportSize({ width, height: width === 1440 ? 900 : 800 });
    const panel = (await page.locator(".wing-eq").boundingBox())!;
    const control = (await page
      .getByRole("slider", { name: "High cut frequency", exact: true })
      .boundingBox())!;
    expect(control.y + control.height).toBeLessThanOrEqual(
      panel.y + panel.height,
    );
    await page.screenshot({ path: `test-results/eq-active-${width}.png` });
  }
});
