# Future audio boundary

No audio engine is implemented or initialized. A future adapter can subscribe to mixerStore and translate mixer state into audio parameters. Input and aux sends are separate from channel faders; buses feed Main LR; DCAs only modify the effective gain/mute of assigned members. Never rewrite channel faders when changing DCAs. Validate the full FCC routing and send tap points before implementing audio. Do not infer routes from colors.
