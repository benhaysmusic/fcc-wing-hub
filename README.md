# FCC WING Trainer

An internal browser-based console practice tool for First Christian Church. The first milestone is an interactive, audio-less facsimile of FCC's WING Copilot workflow.

## Run locally

Requires Node.js 22.12+ and pnpm 11.

```sh
pnpm install
pnpm dev
```

Open the local address shown in the terminal. Desktop target: 1280 × 800 or larger. Smaller windows scroll; mobile is not a milestone requirement.

```sh
pnpm build
pnpm test
pnpm exec playwright install chromium
pnpm test:e2e
```

## Working in this milestone

- CH 1–16, CH 17–32, CH 33–A8, CH 1–40, AUX, BUSES and DCA layers.
- Channel selection, tapered faders, mute, solo and global Clear Solo.
- HOME: selected-channel Input, Gate, EQ and Compressor controls. MIXVIEW: processing overview; click a tile to open that channel's editor.
- Sixteen bus destinations and Sends on Faders. Green outlines and yellow faders identify sends. Send levels and send on/off are independent for every source and bus. Leaving SOF restores ordinary fader presentation.
- Six named DCAs plus the unused D7–D16 positions. Fixed membership follows the DCA screenshot. DCA levels and effective mute/gain are modeled independently; member fader positions are never rewritten.
- A fixed Main LR strip; in SOF this switches to the selected bus master.
- Reset restores the starting snapshot. Changes stay in memory until reset or reload.

## Architecture

```text
src/
  App.tsx                   Console composition and navigation
  components/
    ChannelStrip.tsx        Scribble strip, solo, fader, mute/send switch
    Fader.tsx               Accessible vertical fader and readout
    MixOverview.tsx         Per-strip processing navigation
    ProcessingEditor.tsx    Input, dynamics and EQ controls
  mixer/
    types.ts                Explicit console state and action contract
    config.ts               FCC names, colors, layer ordering and DCA members
    state.ts                Pure state transitions, taper and derived controls
    store.ts                React subscription and future action observers
  audio/README.md           Future adapter boundary; no engine implemented
  training/README.md        Future scenario boundary; no engine implemented
tests/
  mixer.test.ts              State invariants
  console.e2e.ts             Browser workflow and desktop layout checks
```

React's external-store subscription keeps the mixer independent of components without adding a store dependency. Future audio and training modules can subscribe to snapshots and observe typed actions; neither is initialized today.

## Reference fidelity and deliberate limits

All ten supplied screenshots were inspected. Channel order, names, category colors, initial fader levels, bus names, DCA membership, HOME/MIXVIEW organization and SOF presentation are transcribed from them. See [reference notes](docs/reference-notes.md).

The app is a first UI pass, not a firmware or DSP emulation. Processing starts flat or bypassed. EQ plots are illustrative, not calculated WING filter responses. There was no dedicated compressor screenshot, so its editor uses provisional common controls. Associated group and FX channel sends start enabled at unity (0 dB). Unassociated sends remain off at silence. IEM defaults retain their previous values. Full routing and tap points are not inferred or implemented. No meters fabricate audio activity.

The available screen area is used for the console rather than reproducing the references' large unused black region. AUX stretches across the available bank. Unused routing, matrix, effects management, monitor, scene/library and configuration pages are omitted. No accounts, cloud saving, network control, audio, lessons or scoring are included.

## Next UI refinements

1. Compare this working build against FCC's normal click sequence and refine proportions, spacing and touch targets.
2. Obtain the dedicated compressor view and precise processing defaults; refine its layout and the EQ interaction.
3. Confirm the remaining IEM mixes and send tap points before any audio work.

This repository is for FCC use. It has no deployment workflow or public hosting configuration.

### Mute lights

Unmuted buttons are black. Direct mutes are solid red. Muting a DCA gently pulses the mute lights on its locally unmuted member buses and associated main-group channels. Direct channel or bus mutes remain solid and survive DCA unmute. Bus mute switches do not affect channel mute lights. Fader positions and Sunday send defaults stay unchanged.
