INDEX PAGE AUDIO MAP
====================

Sound for index.html -- the landing hero and the era picker. Unlike the chapters, this
page has no scroll progress: audio is driven by the view state (currentView, 'hero' or
'main') in js/index.js. The mapping lives in AUDIO_CONFIG at the top of that file --
volumes and file paths are one-line edits there.

Mix direction: the hero is open and inviting, the era picker is a little darker and more
deliberate. One music bed plays per view and the two crossfade over 1.5s, timed to the
white flash that already covers the hero <-> eras transition.


FILE NAMING
-----------
KEEP EACH FILE'S ORIGINAL DOWNLOAD NAME. Do not rename them to bgm-hero.mp3 -- the
download name is the attribution trail back to the source, same rule as
assets/audio/chapter1/ and assets/audio/chapter2/. The link between a file and its role
is the key in AUDIO_CONFIG, not the filename.


SLOTS
-----
bgmHero                                             vol 0.40   loop
    The landing screen. Starts as early as the browser allows (see BEHAVIOUR NOTES) and
    fades out over 1.5s when the user scrolls down into the era picker; fades back in on
    the way up.
    Wants: open, spacious, "a journey is starting". 30s+ and seamless enough to loop.

bgmEras                                             vol 0.55   loop
    The era picker. Fades in as the hero fades out, and stays under the whole slider.
    Wants: darker and more deliberate than the hero, ancient/archival feel.
    The number is HIGHER than bgmHero even though this bed sits under the slide whoosh,
    which looks backwards until you compare the files: samuelfjohanns averages global_gain
    142 against mfcc's 163, so it is a much quieter recording. Matching the two numbers
    would not have matched the two loudnesses. If a different file ever replaces this one,
    re-judge the number from scratch -- it belongs to the file, not to the slot.

uiClick                                             vol 0.35   one-shot
    Nav logo, "Eras" link, language toggle, and the unmute press. Currently shared with
    both chapters (../chapter1/universfield-mouse-click-351398.mp3) rather than
    duplicated -- there is no reason for this page to have a different click.
    startAt 0.10 skips the file's own lead-in so the sound lands on the click frame.

slideChange                                         vol 0.30   one-shot
    Every era slide change. Fires on wheel, swipe, and the arrow path alike.
    Wants: short (<1s) airy whoosh. It plays often, so anything percussive gets tiring.

    0.30, lowered from 0.40, to match Chapter 2's slideChange. That is not a
    coincidence to be tidied away later: it is the SAME FILE in the SAME role, and
    two pages were playing it at two levels. It also fires constantly over bgmEras
    at 0.55, which is the bed it has to stay under. If a real file ever replaces
    the stand-in, re-judge this against Chapter 2's copy, not on its own.

viewTransition                                      vol 0.45   one-shot
    The hero <-> eras white flash, fired as the flash starts.
    Wants: a bigger, longer whoosh than slideChange -- this is the page's one big move.

enterChapter                                        vol 0.40   one-shot, trimmed to 1.2s
    The "Enter Chapter" button. Navigation is held back 350ms so this is audible before
    the page changes; the clip is faded out at 1.2s so a long tail doesn't get cut off
    mid-note by the page unload.
    Wants: a reveal/confirm swell, not a click.


SEARCH TERMS (Pixabay / Freesound -- search in English)
------------------------------------------------------
Pixabay splits Music and Sound Effects into separate tabs. The two beds are on the
Music tab; the three one-shots are on the Sound Effects tab. Use the Duration filter
rather than auditioning everything.

  bgmHero       cinematic ambient inspiring / atmospheric ambient loop /
                documentary opening ambient / epic ambient journey
                avoid: drums or any steady beat (the hero is still, the music should
                be too), trailer braams, vocals, anything that resolves and ends --
                it has to loop

  bgmEras       ancient ambient / mysterious ambient loop / dark ambient drone /
                history documentary background
                avoid: horror stingers, modern synth leads, and anything as bright as
                bgmHero -- these two play back to back, they need to read as different

  viewTransition  cinematic whoosh transition / whoosh reverb / swoosh transition
                avoid: a big impact/boom on the tail. The white flash is the impact;
                a second one fights it

  slideChange   soft whoosh / short swoosh ui / air whoosh short / page turn
                avoid: metallic, heavy, or anything with a tail past ~1s. This fires
                on every single slide change, so it has to stay in the background

  enterChapter  magic reveal / mystic reveal / shimmer reveal / cinematic riser short
                avoid: fanfares and anything over ~2s -- it gets faded out at 1.2s

TWO THINGS THAT DISQUALIFY A LOOPING BED (learned the hard way in chapter1/2):
  - silence or near-silence at the head: every loop then has an audible hole in it.
  - a fade-out at the tail: every loop point dips.
Neither is obvious auditioning a clip once -- play it twice back to back before
committing. Also keep beds at 30s+ (shorter and the repetition becomes audible) and
under ~4MB (chapter1 dropped an 18MB file as too heavy to serve).

The one-shots want less than ~50ms of lead-in. If a good clip has more, don't trim
the file -- measure the offset and set startAt for it, the way uiClick uses 0.10.


CURRENT FILES
-------------
  slot            file                                      length  lead-in  seam
  bgmHero         mfcc-ambient-ambient-music-479762.mp3      51.7s     0ms   -27
  bgmEras         samuelfjohanns-ancient-99556.mp3           27.5s   313ms   -10
  viewTransition  lordsonny-whoosh-cinematic-161021.mp3       3.0s     0ms    n/a
  slideChange     ../chapter2/dragon-studio-simple-whoosh     0.6s    26ms    n/a  STAND-IN
  uiClick         ../chapter1/universfield-mouse-click-...      --    96ms    n/a  shared
  enterChapter    ../chapter1/universfield-mystic-reveal-    15.1s    26ms    n/a  STAND-IN

"seam" is the head-to-tail difference in global_gain, the loop-point dip. Roughly 1.5 dB
per unit, so -10 is about -15 dB and -27 about -40 dB. Numbers come from the MPEG frame
headers, no decoding -- treat them as "roughly", accurate enough to rank files.


WHAT TO LISTEN FOR IN THE BEDS
------------------------------
Both beds fade out at the tail, so both dip at the loop point, and neither is a clean
loop. What each one costs depends on which view it is under:

  bgmHero (mfcc, 51.7s, seam -27 ~= -40 dB) has the worse seam of the two, but the hero
  is a splash screen people leave in five to fifteen seconds. Playback rarely reaches
  0:51 at all, so the bad seam is mostly theoretical.

  bgmEras (samuelfjohanns, 27.5s, 313ms silent head, seam -10 ~= -15 dB) is the one to
  watch. The era picker is where people linger -- six eras to scroll -- so this loops
  every 27.5s, and each loop opens with a 313ms hole. Sit on the era picker for two
  minutes and decide whether that reads as a breath or as a dropout.

If the hole does bother you, the fix is a different file. Not a volume change, and not
startAt either: startAt only applies to one-shots, because anything with loop = true
always wraps back to 0.


STILL ON STAND-INS
------------------
slideChange and enterChapter have no file of their own yet and point at chapter files.
Both work as they are, so this is optional polish rather than a gap:

  slideChange   ../chapter2/dragon-studio-simple-whoosh-382724.mp3 -- 0.6s, flat, clean.
                Genuinely well suited; there may be no reason to replace it.
  enterChapter  ../chapter1/universfield-mystic-reveal-567294.mp3 -- 15.1s, trimmed to
                1.2s with a startAt of 0.50. See the note in js/index.js: the file rises
                over its first 0.78s, and only ~350ms is audible before the page
                navigates, so the offset puts that window on the body of the sound.

uiClick is NOT a stand-in -- it deliberately shares the chapter1 click file.

Every mp3 in this folder is loaded by js/index.js. freesound_community-calm-loop-80576
sat here unreferenced and has been deleted: 5.1s, the only file here with a clean loop
seam (-0.3), but far too short for a bed -- it would repeat 12 times a minute, and no
slot on this page wants a 5s loop.

TO REPLACE ANY FILE:
    1. Drop it in this folder under its original download name.
    2. In js/index.js, point that slot's src at AUDIO_DIR + 'the-file.mp3'.
    3. If it was a stand-in, delete the "// STAND-IN" comment.


BEHAVIOUR NOTES
---------------
- unlockAudio() in js/index.js starts the bed matching the current view -- arriving from
  a chapter via ?era=N opens straight into the era picker, so it starts on bgmEras, not
  bgmHero. It is called twice over: once at the end of initApp, and again from the first
  wheel, touch, or click.
- The load-time attempt is a coin flip by design. Browsers block non-muted playback until
  a real user gesture, but the bar is per-origin rather than absolute -- Chrome's Media
  Engagement Index lets a frequently visited site autoplay. So a returning visitor tends
  to get music on arrival, and a first-time visitor stays silent until they scroll. Both
  are correct behaviour; there is no way to guarantee the first without a click-to-enter
  gate. A refused attempt costs nothing: audioUnlocked stays false and the gesture
  listeners retry exactly as before.
- TESTING THAT HONESTLY: on localhost the load-time attempt nearly always succeeds,
  because we visit it constantly. That result says nothing about a real first-time
  visitor. Use a fresh incognito window to see what they get.
- A bed that fades to 0 keeps playing silently instead of pausing, so going back to the
  other view resumes it mid-loop rather than restarting the track.
- The mute button sits in the navbar left of the language toggle, with a master volume
  slider beside it. Neither is built here: both live in js/audio-settings.js and are
  shared with Chapter 1 and Chapter 2, so muting this page now DOES mute the chapters.
  State is one key each -- 'audioMuted' and 'audioVolume'. The old per-page keys
  ('indexMuted', 'chapter1Muted', 'chapter2Muted') are read once as a fallback so an
  existing visitor's choice is not reset, and are never written to again.
- The slider is a master multiplier applied where each level is written to its audio
  element, so both volumes in this file are what plays at full slider. It scales the
  whole mix together and does not change the balance between slots -- that is still set
  by the numbers here.
- Every .play() is followed by .catch(() => {}), so a missing file leaves a console
  error but never breaks the page.
