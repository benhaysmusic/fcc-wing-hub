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
