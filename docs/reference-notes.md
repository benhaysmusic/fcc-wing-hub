# Reference transcription

Source: ten user-supplied WING Copilot screenshots from the conversation “FOH Training Tool Idea,” July 10, 2026. These are visual evidence, not exported console configuration.

| Screenshot time | View | Used for |
| --- | --- | --- |
| 11:02:29 | CH 1–16 | Vocal, speech, guitar and keyboard names/colors; fader levels |
| 11:02:40 | CH 17–32 | Drum, track, click and cue channels; fader levels |
| 11:02:49 | CH 33–A8 | Empty input positions and AUX order |
| 11:03:02 | AUX | PC and 2TR names, PC fader |
| 11:03:14 | BUSES | Sixteen buses, categories and levels |
| 11:03:30 | DCA | VOX, GTRS, KEYS, DRUMS, JUSTIN, PC; members and levels |
| 11:03:53 | SOF / IEM 1 | Per-channel send values, send ON, yellow faders, green outline |
| 11:04:14 | Input | Channel input, trim/balance, filter placement |
| 11:04:20 | Gate | Threshold, ratio, attack, hold, release and range layout |
| 11:04:36 | EQ | Six-band editor, response grid and processing navigation |

DCA membership: D1 → B1/B6/B7; D2 → B2; D3 → B3; D4 → B4/B5; D5 → CH7; D6 → A1. Remaining DCAs have no assigned members. This is control membership, not signal routing.

The UI includes CH 1–40 because its layer button is visibly present; it uses a horizontally scrollable bank because its selected view was not supplied. MAIN/MTX, ALL, USER1/2 and other unselected configuration views are intentionally omitted.

Unconfirmed details remain explicit: complete fixed input-to-bus routing, remaining IEM mixes, pre/post send tap points, every channel's processing values, exact WING fader taper, specific compressor model/layout. Gate defaults use visible values but are bypassed initially. EQ starts flat. The six-band curve is an illustrative control visualization, not a DSP prediction.

Original images are retained with the local task under work/reference; they are not embedded into the runtime application.

## DCA mute indication (corrected workflow)

The user's correction supersedes the earlier bus-mute visual behavior. A direct channel or bus mute is solid red; a locally unmuted member glows/pulses red when its DCA is muted. DCA association includes its direct members and the channels in its main-group buses: VOX CH1–4; GTRS CH8–12; KEYS CH13–16; DRUM CH18–27. JUSTIN DCA controls CH7 and PC DCA controls A1. DCA1 also controls B6/B7, DCA4 also controls B5. Bus mute switches never propagate mute lights to input channels.

The UI indication does not rewrite channel/bus mute state, faders or sends. Future audio must handle bus mute at the destination bus so that unrelated sends remain independent. Reduced motion uses a dim red button with dashed border instead of animation.

## Sunday send defaults

User-confirmed: VOX channels CH1–4 feed VOX, VOX VERB and VOX DLY at 0 dB with sends enabled. GTRS CH8–12 feed GTRS; KEYS CH13–16 feed KEYS; DRUM CH18–27 feed DRUM, DRUM CRUSH and DRUM VERB at 0 dB with sends enabled. Unassociated sends remain off. IEM1–8 defaults are unchanged. Reset restores these values. Bus master and source channel faders are unchanged. FX sends do not introduce mute-light propagation.

## Gate/Expander recording

Reviewed the user's 54-second Gate:Expander.mov recording. The dedicated gate view now follows its model/accent/key header, blue transfer graph, threshold drag handle, green envelope and two rows of colored controls. Threshold, ratio (including hard gate) and range jointly affect the expansion curve. Attack, hold and release can be changed by sliders or graph handles; all gate settings remain channel-specific. Accent and key solo retain UI state only. No audio metering is simulated.

The recording demonstrates 1:1.5, 1:2, 1:4 and gate ratios; existing 1:3 settings are preserved. Additional ratio stops and control endpoints are provisional. Envelope geometry is an illustrative logarithmic display, not measured firmware scaling. The model selector, key-source menu and key-filter detail were not demonstrated, so their labels remain fixed to Gate/Expander, Self and Flat. Initial processing values are retained rather than adopting demonstration values as Sunday defaults.

## Input screen recording

Reviewed the user's approximately 43-second Input recording at one-second intervals. Implemented its three-column Channel Input / Trim & Balance / Filter and Delay layout. Demonstrated controls are input gain, vertical trim, horizontal input balance, 48V, LOCUT and HICUT. Gain moves in 2.5 dB steps; trim spans -18 to +18 dB, input balance -9 to +9 dB. White trim and blue balance handles move the display and respond to dragging, keyboard input, and double-click reset to zero. Input balance has its own dB state, separate from output pan.

Per user instruction, untouched MAIN/ALT, input selection, individual/global, invert, MAXER and delay settings are fixed visual elements. Source names retain the existing FCC assignments instead of copying the demonstrated LCL 3 to all channels. Gain/48V controls are shown for assigned input channels, not bus/aux sums. The demonstrated 30 dB gain is a provisional initial value, not a verified per-channel Sunday preamp map; the gain endpoints are also provisional. Existing trim, output pan, gate, fader, mute and send defaults are preserved. 48V and high-cut start off. All interactions affect only simulator state; no hardware or audio is controlled.
