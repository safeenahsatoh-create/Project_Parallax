CHAPTER 1 AUDIO MAP
===================

All timings below are on the same scroll-progress scale the parallax engine uses
(progress = scrollY / (3 * viewportHeight)), which runs from 0 at the prologue to
about 6.5 at the closing text. The mapping lives in AUDIO_CONFIG at the top of
js/chapter1.js -- volumes and ranges are one-line edits there.

Mix direction: the chapter goes fragile/mysterious -> open/dangerous -> thoughtful
-> warm/triumphant, and the audio follows it. Two beds play at once throughout
(one ambience + one music), with ambience always sitting under the music.


MUSIC BEDS
----------
zec53-thoughtful-mysterious-ambient-piano-loop...   vol 0.40 / 0.37
    Full from the start, fades out 0.45-0.70.
    Reprise: fades in 3.35-3.75, out 5.55-5.80, at its own lower peak of 0.37.
    The lead voice for the prologue, returning under the night sky as a bookend.
    The reprise starts at 3.35, not 3.55, so it overlaps the savanna and dreamscape
    fade-outs -- see THE THREE HOLES below.
    This is the only bed with a per-range volume (`volume` inside a range entry,
    which updateAudio prefers over the layer's own). The prologue plays it alone
    and the reprise plays it over three ambiences, so one number cannot serve both
    -- see THE FOUR-BED STACK below.

grumpynora-savanna-39-sec-edit...                   vol 0.38
    In 0.66-0.88, out 1.08-1.30.
    Rides the animal parade and the savanna text.

freesound_community-sci-fi-survival-dreamscape...   vol 0.40
    In 1.10-1.60, out 3.25-3.55.
    The hominid shadows and the long footprints walk. Starts under the black scene
    transition rather than after it -- the new world arrives before you see it.

fronbondi_skegs-amb-triumphant-march...             vol 0.44
    In 5.50-5.85, never fades out.
    The ending fade-to-black and the closing text. The loudest single bed in the
    chapter. It no longer plays alone -- the fire bed runs to the end underneath
    it -- and it starts at 5.50 rather than 5.65 so it climbs through the piano's
    fall instead of after it. See THE ENDING below.


AMBIENCE BEDS
-------------
freesound_community-cave-background-sound...        vol 0.30
    Full from the start, out 0.55-0.80. Under the piano in the opening cave.

freesound_community-african-savanna-2...            vol 0.24
    In 0.50-0.76, out 1.08-1.30; then in again 1.30-1.70, out 3.25-3.55.
    Returns for phase 5 (still an outdoor daytime scene), and still dips across
    the black scene transition so the cut lands -- just no longer to silence.

The three below all play at once from 4.60 to 5.50, underneath the piano reprise.
That is four beds, the only place in the chapter with that many, and their levels
are set as a group rather than individually: see THE FOUR-BED STACK below.

capaholiczsfx-cave-with-water-dripping...           vol 0.28
    In 4.05-4.50, out 6.00-6.50. A different cave sound for the final cave. It
    starts 0.15 before the cave group is visible (that fades in 4.20-4.60) and
    fades out across the closing text rather than before it.

freesound_community-fire-6699                       vol 0.32
    In 4.10-4.55, no fade-out. The only ambience that runs to the end of the
    chapter, under the black screen and the closing text ("around that campfire").

freesound_community-stone_tap...                    vol 0.20
    In 4.60-4.95, out 5.50-5.75. Quiet toolmaking texture behind the cave scene.


SCENE CUES (fire once when scrolled past; re-arm on scrolling back)
-------------------------------------------------------------------
engyclick-lion-roaring-sound-effect...   at 0.87   vol 0.40   trimmed to 6s
keannix-whoosh-1...                      at 1.17   vol 0.45
universfield-mystic-reveal...            at 1.55   vol 0.38   trimmed to 9s
magiaz-sound_of_hyenas...                at 3.80   vol 0.35

The lion is at 0.40 rather than 0.45 because it fires where the savanna pair is
already at full level, and the two together used to be the loudest moment in the
chapter. The whoosh at 1.17 is the opposite case and stays at 0.45 on purpose: it
fires into the black transition where the beds are thinnest, so it is carrying
that moment alone and is SUPPOSED to be the loudest thing playing.


CLICK SOUNDS
------------
studiokolomna-fast-whoosh...        vol 0.45               shadow hominids (>= 1.5)
freesound_community-cave-taps...    vol 0.48  trimmed 1.0s  tool hitbox (>= 4.6)
freesound_community-fire-6699       vol 0.52  trimmed 1.5s  fire hitbox (>= 4.6)
universfield-mouse-click...         vol 0.35               mute button, on unmute only

The first two are clicked during the fire scene, on top of its four-bed stack, so
both are set against that stack rather than in isolation. Both went up by about
0.5 dB when the stack did.

The fire click is tied to a bed more tightly than that. It is the SAME FILE as the
fireAmbience bed, which is playing at 0.32 wherever the fire is clickable, so the
click is the identical crackle sitting inside the sound it is answering. It is
held at about +4.4 dB over that bed: far above and it reads as the fire jumping in
volume rather than as a response to the click, level with it and the click does
not register at all. If that bed's level changes, move this with it -- it was 0.40
when the bed was 0.24.


DELETED
-------
Both unreferenced files have been removed. Every mp3 left in this folder is used
by js/chapter1.js -- verified against the code, not against this file. Recorded
here so neither gets re-sourced by mistake; each is re-downloadable from the ID
in its filename if it is ever wanted back.

soundreality-fire-crackling-528620.mp3
    19 MB / 9:54 -- far too heavy for a web page, and fire-6699 (0.6 MB) already
    covers the same need. It was the single largest file in the project.

alex_jauk-waterdrops-cave-echo-sounds-230896.mp3
    0.38 MB / 12.4 s, mono. A third cave ambience, kept for a while as a swap-in
    alternative for the opening bed. Dropped because a 12-second loop repeats too
    audibly over a long stretch -- an alternative already judged worse than what
    it would have replaced.

One file here is shared: universfield-mouse-click-351398.mp3 is referenced by
js/chapter2.js as well, rather than being duplicated into chapter2's folder.


BALANCE PASS -- HOW THESE LEVELS WERE SET
-----------------------------------------
The levels and ranges above were re-set in one pass across the whole site, after
the question "is any of this actually at the right volume" was asked of the index
page and both chapters together.

The method: replay the mixer's own maths (mapRange, then "a bed's volume is the
max across its ranges") at every scroll position, and combine every bed audible at
that position as sqrt(sum of squares) -- the right sum for unrelated sources, which
these are. That gives one number per position for how loud the chapter actually is
there, which can be compared against every other position and against Chapter 2.
The scratch script that does it is not kept in the repo; it is ~80 lines and is
quicker to rewrite than to maintain, but the numbers below are its output.

WHAT IT FOUND. Chapter 1 swung 20.5 dB from its loudest point to its quietest,
against Chapter 2's 8.2 dB over comparable material. That gap was the real problem
-- and it was NOT that the chapter is too loud. The resting points were all within
3.6 dB of each other and of Chapter 2's. The swing came from holes.

AFTER: 10.6 dB. Peak -5.4 dB (the fire scene), quietest -16.0 dB (the black scene
transition), resting points -5.4 to -8.0 dB.

A second pass later revisited 4.20 onwards -- see THE FOUR-BED STACK and THE
ENDING below -- and moved the peak to -4.3 dB, at the fade-to-black. The rest of
the chapter is untouched by it.

Two limits worth stating, because they bound what any of this proves:

  1. This measures the volume NUMBERS, not the files. A bed at 0.40 whose file was
     mastered quietly is not as loud as another bed at 0.40. Nothing here decodes
     audio, so cross-file loudness is still an ear judgement -- see the same
     warning, at more length, in chapter2/README.txt's note on global_gain.
  2. It measures beds only. Cues and click sounds play on top and are judged
     against the bed level underneath them, which is how the lion and the fire
     click above got their numbers.


THE THREE HOLES
---------------
Three stretches had nothing playing, or nearly nothing. All three are places where
one group of beds finished fading before the next started, which is easy to miss
while tuning one scene at a time and obvious when the whole chapter is plotted.

  0.70   was -18.2 dB. The cave was essentially gone (0.03) while the savanna had
         only reached 0.12 and its music had not started at all. Fixed by holding
         the cave 0.08 longer, starting the savanna ambience 0.08 earlier, and the
         savanna music 0.06 earlier. Now -12.7 dB, which reads as a handover.

  1.20-1.45  was SILENT -- not quiet, silent, for about 0.75 viewport-heights of
         scrolling. The savanna pair was out by 1.22 and the dreamscape did not
         begin until 1.45. This was the single largest hole and the main reason
         the chapter's swing was 20 dB. Fixed mostly by starting the dreamscape at
         1.10 instead of 1.45, and partly by fading the savanna pair out over 1.08
         -1.30 instead of 1.08-1.22. Now bottoms out at -16.0 dB.

         The dip is deliberately still there. The black scene transition SHOULD
         drop -- the whoosh cue at 1.17 is what carries it. What it should not do
         is go to nothing.

  3.50-3.65  was about -25 dB, between the savanna/dreamscape fade-out ending at
         3.55 and the piano reprise starting at 3.55 -- the two met exactly, with
         no overlap, so both were near zero at the join. Fixed by pulling the
         piano's fade-in back to 3.35 so it rises through their fall. Now -15.4 dB.


THE FOUR-BED STACK (4.60 - 5.50)
--------------------------------
caveFinalAmbience, fireAmbience and stoneKnapping all run together here, under the
piano reprise. This has now been set twice, and the second pass is a correction of
the first, so both are recorded.

FIRST PASS. At 0.26 / 0.32 / 0.18 under a 0.40 piano the four summed to -4.4 dB --
the loudest point on the entire site. All three ambiences were trimmed to 0.22 /
0.24 / 0.14 and the piano was left untouched, bringing the stack to -5.4 dB.

WHAT THAT GOT WRONG. Taking the whole trim out of the ambiences and none out of the
music inverted which of the two leads. Piano alone is -8.0 dB; the three ambiences
together came to -9.0 dB. In a scene whose subject is fire and stone tools, the
loudest single source was the score, and the section read as thin -- not because
the number was low (it was the chapter's peak) but because the scene's own sound
was underneath the music. dB alone will not show this; compare the ambience group
against the music bed separately.

SECOND PASS (current). The ambiences go back up to 0.28 / 0.32 / 0.20 and the
piano reprise comes down to 0.37 via its per-range volume, which leaves its
prologue at 0.40 where it plays alone and belongs. The stack sums to -4.5 dB and
the ambience group now leads the piano by 2.1 dB. That is 0.9 dB louder than the
first pass and 0.1 dB below the original -4.4, so the peak is essentially back
where it started -- but it is a fuller scene rather than a louder one, which is
what the first pass was actually reaching for.

If a fourth ambience is ever added here, take the budget out of these three rather
than adding on top.


THE ENDING (5.50 - 7.00)
------------------------
The chapter runs to progress 7.0 (a 2200vh container over a 300vh progress unit),
so there is about 1.5 of scrolling after the fade-to-black begins.

This stretch used to have two problems, both of density rather than level.

  5.75   was -8.7 dB, the thinnest point of the whole back half, and it landed on
         the fade-to-black. The piano's fade-out (5.55-5.80) and the march's
         fade-in (5.65-5.95) barely overlapped, and stoneKnapping was already
         gone, so both music beds were near zero at the same moment. Fixed by
         starting the march at 5.50 so it rises through the piano's fall. Now
         -5.5 dB.

  6.20-7.00  was the march alone at -6.9 dB for about 2.4 viewport-heights,
         covering the closing text. Every ambience had finished: the cave by 6.00,
         the fire by 6.20. The level was inside the chapter's resting band, but
         going from four beds to one is a drop in density that the dB figure does
         not capture, and it is what made the ending read as light. Fixed by
         removing fireAmbience's fade-out entirely -- it plays under the black
         screen to the end -- and holding the cave out to 6.50. Now -4.9 dB at the
         closing text and -5.3 dB at the end, on two beds.

Keeping the fire under the ending is also the right reading of the scene: the
closing text is "around that campfire, they began to unite as a species".


BED SMOOTHING
-------------
Bed levels are rate-limited on their way to the target, capped at a full 0 -> its
own volume sweep per AUDIO_FADE_MS (400 ms). Chapter 2 has the same mechanism for
the one scene boundary its track jumps across; here there are no jumps, so on
ordinary scrolling the cap never binds and the sound still tracks the scroll 1:1.
It exists for a hard flick, where one wheel event can move progress far enough to
snap a bed from silence to full within a single frame.

One consequence worth knowing if you touch updateAudio: updateParallax runs on
scroll events, not on a standing animation loop, so when scrolling stops this
function stops being called. A bed the cap caught mid-ramp would be stranded at a
partial level -- exactly the case the cap exists for. updateAudio therefore asks
for another frame whenever any bed has not landed yet (scheduleAudioSettle).


NOTES
-----
- Mute and the master volume slider are NOT in this chapter's code. They live in
  js/audio-settings.js and are shared with the index page and Chapter 2, under one
  localStorage key each ('audioMuted' / 'audioVolume'), so muting anywhere carries
  everywhere. Every level in this file is scaled by that slider at the point it is
  written to the element; the numbers here are what plays at full slider.
- Files longer than the moment needs are trimmed in code (a short volume ramp,
  then pause), so nothing here needs editing in an audio editor.
- Everything except the two opening beds and the four click sounds uses
  preload="none" and only starts downloading shortly before it is needed, so the
  page does not pull ~18 MB up front.
- Browsers block audio until a real user interaction, so nothing plays until the
  first scroll, key press, tap or click.
- Filenames deliberately keep their original author handles -- see licensing below.


LICENSING -- NEEDS CHECKING BEFORE PUBLISHING
---------------------------------------------
Most filenames carry the author handle: capaholiczsfx, engyclick, fronbondi_skegs,
grumpynora, keannix, magiaz, studiokolomna, universfield, zec53, plus several
freesound_community files.

(alex_jauk and soundreality were dropped from this list along with their files --
see DELETED above. Nothing that shipped needs their attribution any more.)

Pixabay audio generally needs no attribution, but Freesound CC-BY clips DO.
Check each clip's source and license, then add a credits list -- in this file at
minimum, and ideally somewhere visible on the site.
