CHAPTER 2 AUDIO MAP
===================

Chapter 2 is paged, not scrolled, so the timings below are NOT on Chapter 1's
scroll scale. They are on a scene scale: 0 is Scene 1 at rest, 10 is Scene 11 at
rest, and fractional values are the continuous wheel-driven drags in between.
The position is read straight off .chapter2-track's inline transform
(translateY in vh / 100), which the nine applySceneNExit() functions and
goToScene() all write. The mapping lives in AUDIO_CONFIG in js/chapter2.js --
volumes and ranges are one-line edits there.

Only one boundary in the whole chapter is a real jump (Scene 10 -> 11). Every
other one is a drag, so the sound moves with the scroll rather than switching at
a commit point. Bed volumes are rate-limited to 700ms (AUDIO_FADE_MS, the same
as SCENE_TRANSITION_MS), which tracks a drag almost exactly and turns that one
jump into a crossfade that lands with the CSS track transition.

Crossovers are deliberately placed mid-drag, not on a rest position, so the
sound changes together with the picture.

Mix direction: the chapter goes curious/wondrous -> monumental/craft ->
elegiac -> solemn/lawful -> collapsing, handing off to the age of war
that Chapter 3 opens on. (Scene 7 was designed as "crowded/uneasy" and the music
that landed there is mournful instead -- a deliberate change, see mChaos under
MUSIC BEDS. Its ambience slot aCrowd is still meant to carry the crowd.) Two beds play at once (one music + one ambience), with
ambience always sitting under the music. During a crossover that briefly becomes
three, because one ambience thread deliberately spans a music change.


CURRENT STATE -- 10 of 21 slots filled
--------------------------------------
  slot          file                                          trim applied
  ------------  --------------------------------------------  ------------------------
  mWonder       freesound_community-mystical-music             startAt 0.72
  mEgypt        universfield-dramatic-flute-for-documentaries  startAt 2.66, loopEnd 63.65
  mChaos        starostin-documentary-sad-sorrowful-music      loopEnd 36.50
  mCollapse     maciejm1992-your-adventure-has-come-to-an-end  --
  aHall         idoberg-ambient-pads-loop                      --
  aRuin         universfield-apocalypse                        startAt 1.30, loopEnd 21.67
  scrollUnfurl  lenspulse-foley-paper-handling-page-turning    startAt 5.00, max 1.0s
  sledgeClick   dragon-studio-button-press                     startAt 0.04, max 1.2s
  slideChange   dragon-studio-simple-whoosh                    startAt 0.04, max 1.0s
  coinSpin      universfield-spinning-coin-on-table            --

Every trim value above was measured, not guessed -- see MEASURING below.

TEMPORARY STAND-INS -- 1 slot borrowing another slot's file
------------------------------------------------------------
  mLaw     <- freesound_community-mystical     (mWonder's file)

  (aPaper had one too and it was REMOVED -- see AMBIENCE BEDS. A stand-in whose
  character is wrong for the slot can be worse than silence.)

  (aCrowd had one too -- it borrowed aHall's pad -- and it has now been REMOVED
  for the same reason aPaper's was, plus one aPaper did not have. See AMBIENCE
  BEDS. Two slots pointing at one pad is not the same problem as one slot with
  the wrong pad: it also means the pad crossfades with ITSELF.)

  (mChaos had one too -- it borrowed aRuin's apocalypse drone -- and it now has
  its own file. See MUSIC BEDS: the replacement changes what Scene 7 is ABOUT,
  and that was a deliberate call, not just a file swap.)

Scene 7 had NO bed at all and Scene 10 had none either, which is what "Scene 7 is
too quiet" and "Scene 10 is too loud" actually were: Scene 7 was silent, and
Scene 10's paperUnroll cue was playing with nothing underneath it. That cue has
since been removed outright (see SCENE CUES) -- lowering it was tried three times
and never got it to sit right in a scene this quiet.

Pointing an empty slot at a file already present fixes that WITHOUT touching any
range, so every designed crossover stays as planned and swapping in the real file
is a one-line change. The obvious alternative -- stretching the neighbouring
beds' ranges to cover the gap -- was tried first and is wrong: those stretches
overlap the slots the gaps belong to, so the moment the real aCrowd or aPaper
landed there would be two ambience beds on a rest scene. The harness catches
exactly that, which is how the approach got rejected.

mLaw carries a startAt inherited from the file it borrows. That belongs to the
FILE, not the slot -- drop it when the real file lands. (mChaos carried an
inherited startAt 1.30 / loopEnd 21.67 the same way; both were dropped when its
own file arrived and it was re-measured from scratch.)

The harness prints the stand-in list on every run so they cannot quietly become
permanent.

STILL EMPTY (8): aDesert, stoneDrag, chisel, lowGong, collapse, glyphRoll,
sphinxGrind, featherWrite. Those are simply silent; nothing breaks. aDesert is
the one worth sourcing next -- it covers Scenes 2-6, which currently have music
but no ambience under it at all.

collapse is the odd one in that list: it is empty by REJECTION, not by never
having been filled. See SCENE CUES.

KNOWN COMPROMISES in what is wired, all measured and none fixable in code:
  aHall      19.2s. Under the ~30s where loop repetition starts being heard, and
             it plays across Scenes 8-9, which is a long stretch. Most likely of
             these to actually be noticed -- a longer drone would be better.
  aRuin      23.5s, and mCollapse 27.5s. Both under 30s but both only play on
             Scene 11, the short closing scene, so a cycle may never complete.
  coinSpin   2.1s, under the 3s motion minimum. In practice the coin gesture is
             only 450px, about 1-2 seconds of scrolling, so it will rarely reach
             its own loop point at all. Flagged for completeness, not a worry.

  (collapse was listed here as "an orchestral finale rather than the deep rumble
  originally planned -- arguably better for 'empires fall', but that is an ear
  decision". The ear decision has since been made against it and the slot is
  empty again. A compromise recorded here is a question still open, not a
  settled one.)

There is no candidates/ folder at present. It held two files that nothing loaded --
u_u4pf5h7zip-click (0.2s, a spare click; both click slots are filled and uiClick
borrows Ch.1's) and good_b_music-grand-final-orchestral-tutti (rejected from
collapse) -- and both have been deleted. Recreate the folder when sourcing work
starts again; see the SOURCING GUIDE below.


ADDING THE FILES
----------------
Drop each mp3 into this folder, then paste its filename into the AUDIO_FILES map
at the top of the audio block in js/chapter2.js. An empty string there means "not
supplied yet": that entry is skipped entirely, no element is built and no 404 is
requested, so the chapter stays playable while the library is being assembled.

KEEP EACH FILE'S ORIGINAL DOWNLOAD NAME. Do not rename them to bgm-xxx.mp3 --
the author handle baked into the name is what the credits list below is built
from.

Grab 2-3 candidates per slot and put the spares in a candidates/ subfolder, NOT
in this one. Only the chosen file gets promoted up a level. Chapter 1 left an
unused 18 MB mp3 sitting in its shipping folder; the subfolder keeps that from
happening again.


SOURCING GUIDE
--------------
Targets below are measured from what Chapter 1 actually shipped, not invented:

    type       duration     size          kbps   known-good example
    ---------  -----------  ------------  -----  --------------------------
    music bed   30-50 s      1.0-1.5 MB    256   piano loop, 34.3s / 1.05 MB
    ambience    60-200 s     1.0-3.8 MB    160   cave bg, 180s / 3.44 MB
    motion       3-15 s      < 0.40 MB     192   (new in this chapter)
    cue          3-55 s      0.1-1.7 MB    256   lion roar, 55s / 1.68 MB
    click        1-5 s       < 0.15 MB     256   mouse click, 1.1s / 0.03 MB

The two files Chapter 1 REJECTED set the outer bounds. alex_jauk-waterdrops was
12.4 s and got dropped because the loop repetition became audible, so a bed must
be at least ~30 s. soundreality-fire-crackling was 18.1 MB and got dropped as
too heavy to serve, so ~4 MB is the ceiling.

Motion sounds are the exception to the 30 s rule: they only ever play in 1-3
second bursts, so loop repetition is never heard and 3-15 s is plenty.

TWO THINGS THAT DISQUALIFY A LOOPING BED, both measurable:
  - silence at the head. freesound_community-african-savanna (which Chapter 1
    still uses) has 1,945 ms of near-silence at its start, so every loop has a
    two-second hole in it.
  - a fade-out at the tail. capaholiczsfx-cave-with-water (also still in use)
    ends 57 dB below where it starts, so every loop point dips audibly.
Neither is obvious while auditioning a clip once. Both are caught by the audit
script -- see MEASURING below.

Search terms (Pixabay and Freesound are searched in English):

  mWonder       curious ambient / documentary discovery / wonder ambient piano
                avoid: strong beat, modern synth lead
  mEgypt        ancient egypt ambient / duduk ambient / desert cinematic
                avoid: "epic trailer" (too aggressive), belly-dance rhythm
  mChaos        FILLED -- and not with what this line asked for. Kept for the
                record: tension ambient / rising suspense / tribal drums tension,
                avoiding horror stingers and battle music (Chapter 3's job).
  mLaw          solemn ceremonial / ritual ambient / epic low strings drone
                avoid: church organ or choir (wrong civilisation entirely)
  mCollapse     dark ambient foreboding / ruins ambient / desolate drone
                avoid: jump-scare
  aDesert       desert wind loop / sand wind ambience
                avoid: strong intermittent gusts -- too dynamic to sit under music
  aCrowd        ancient market ambience / medieval market crowd / bazaar
                AVOID: cars, audible English speech, background music
  aHall         stone hall room tone / temple ambience / low drone
                avoid: water dripping (Chapter 1 already owns that sound)
  aPaper        paper rustle loop / parchment handling
                avoid: hard crumpling
  aRuin         desolate wind / distant rumble ambience
  scrollUnfurl  parchment unroll / scroll open
  stoneDrag     stone drag / rock sliding sand / heavy stone slide
  chisel        chisel stone / stone carving / hammer chisel
  lowGong       low gong / ceremonial gong / ram horn / deep bell
  collapse      building collapse rumble / earthquake rumble / deep boom
  sledgeClick   wood thud / wooden knock / sand scrape
  slideChange   page turn / paper flip / soft camera shutter
  coinSpin      coin spin / metal coin ring / spinning coin
  glyphRoll     stone rolling / boulder roll / grinding stone loop
  sphinxGrind   stone scrape / granite drag / heavy stone slide loop
  featherWrite  quill writing / pen writing paper / writing loop

The four motion sounds MUST loop seamlessly. They cover eight set-pieces between
them, so each one is heard in more than one place -- pick something neutral enough
to work twice (see MOTION SOUNDS below for which is used where).

The click sounds should have less than ~50 ms of lead-in, or say so and startAt
gets set for them.

That is 21 files in total, not 25: the sharing means four files do the work of
eight motion sounds.


MUSIC BEDS
----------
mWonder                                            vol 0.40
    Full from the start, fades out 2.40-2.95.
    Scenes 1-3. Curious, airy, documentary opener -- the title card, "from cave
    to architecture", and the two pyramid photographs.

mEgypt                                             vol 0.38
    Fades in 2.40-2.95, out 5.40-5.90.
    Scenes 4-6. Monumental, a sense of scale and craft: Imhotep, the technology
    of sand, and the sledge that answers the question.

mChaos                                             vol 0.40
    Fades in 5.40-5.90, out 6.40-6.90.  loopEnd 36.50, no startAt.
    Scene 7 only.

    THE SLOT NAME NO LONGER DESCRIBES THE FILE. The design brief here was "rising
    density and unease" -- tension ambient, tribal drums -- and the file chosen is
    starostin-documentary-sad-sorrowful-music, which is none of those. It reads as
    elegiac rather than tense: the cost of the great city rather than its noise.
    That was an ear decision made against the brief on purpose, so do not "fix" it
    back toward the brief without asking. The id stays mChaos because renaming it
    would touch the layer, the harness and every reference in this file for no
    audible gain.

    Trim measured, not guessed: lead-in 26ms so no startAt is needed, and the
    track runs flat to ~36.5s before a 4s fade into 3s of silence. loopEnd 36.50
    cuts the cycle before that fade. The value was chosen by matching levels
    across the loop point rather than by the audit script's usual rule -- see the
    comment on the layer in js/chapter2.js, and the audit WARNING below.

    STILL TO CHECK BY EAR: 36.50 is a clean level match, but nothing here knows
    where the musical phrase ends. If the loop point sounds like it cuts a phrase
    off, move it to another value in the 34.0-38.5 window -- all of those measured
    within 6dB at the seam.

mLaw                                               vol 0.36
    Fades in 6.40-6.90, out 8.80-9.70.
    Scenes 8-10. Solemn, ceremonial, low weight -- Hammurabi, the stele, and the
    papyrus that carries the law outward.
    The fade-out starts before Scene 10, so this bed is already coming down by the
    time that scene lands (0.28 of 0.36) and the drag into it audibly settles. It
    used to be 9.05-9.60, which sits ENTIRELY INSIDE the one boundary the position
    jumps across -- so it never faded at all, and Scene 10 inherited the full level
    of the law scenes. That made the chapter's quietest beat louder than Scenes
    1-6. Beware of any range placed between 9.05 and 9.60: the position never
    occupies that span continuously, so a fade written there does nothing.

    The start then moved 8.40 -> 8.80 -- a correction of that fix, not a reversal.
    See SCENE 10 IS THE QUIET BEAT, NOT A HOLE below.

mCollapse                                          vol 0.42
    Fades in 9.05-9.60, never fades out.
    Scene 11. Dark and dying. The 9.05-9.60 window is inside the one hard jump,
    so both this and mLaw flip targets at once and the rate limiter renders the
    crossfade.


AMBIENCE BEDS
-------------
aDesert                                            vol 0.26
    Fades in 0.50-1.20, out 5.50-6.00.
    Scenes 2-6. One continuous open-air thread under both mWonder and mEgypt,
    which is what ties the Egyptian stretch together.

aCrowd                                             vol 0.28   NO FILE YET
    Fades in 5.50-6.00, out 6.50-6.90.
    Scene 7. The market murmur is what actually sells "tens of thousands living
    together" -- the loudest ambience in the chapter, and deliberately so.

    ITS STAND-IN HAS BEEN REMOVED. It borrowed aHall's pad, which failed the same
    test aPaper's borrowed stand-in failed, and one more besides.

    The shared failure: aCrowd and aHall are adjacent slots, so pointing both at
    one file meant that pad ran unbroken from Scene 6 through Scene 10 -- 3.5
    scenes of one drone, which is the exact objection recorded against aPaper's
    stand-in one entry below.

    The failure aPaper did not have: the two slots hand over to each other across
    6.50-6.90. With one file behind both, that handover crossfaded the pad with
    ITSELF -- two elements, one file, at different playback positions. That is not
    a scene change. It is the same sound not stopping, with a phasing artefact for
    the trouble, and no volume value fixes it because the problem is the file
    being on both sides of the fade.

    Scene 7 now rests on mChaos alone at 0.40 (-8.0 dB), which is where Scenes 1-6
    already sit. Borrowing the pad had it at -6.2 dB, making Scene 7 louder than
    the six scenes before it -- so removing the stand-in did not just fix the
    drone, it moved Scene 7 INTO line rather than out of it.

    Nothing about the ranges above changed and nothing needs to when a real file
    lands: the slot is skipped entirely while its src is empty (no element built,
    no 404 requested), so filling it is still a one-line change.

aHall                                              vol 0.24
    Fades in 6.50-6.90, out 8.50-9.00.
    Scenes 8-9. Stone room tone under the law scenes. The fade-out mirrors
    aPaper's fade-in exactly, so the handover finishes during the Scene 9 -> 10
    drag rather than leaving both audible on Scene 10.

aPaper                                             vol 0.14   NO FILE YET
    Fades in 8.50-9.00, out 9.05-9.50.
    Scene 10. Quietest bed in the chapter -- texture under the papyrus, not a
    sound effect, and it sits clearly under the tapering mLaw rather than level
    with it. Its fade-in mirrors aHall's fade-out exactly and both land ON the
    arrival, so the last stretch of the drag is still moving instead of flat.

    DELIBERATELY LEFT EMPTY even though the pad used by aHall was available as a
    stand-in. That file is dense -- median level -3dB, essentially no dynamics --
    so it carries far more energy than a sparse parchment texture and reads as
    loud at any volume still audible. Borrowing it also meant one unbroken pad
    from Scene 7 to Scene 10. Silence here is better: the pad STOPPING is itself
    the sound of things settling.

    So Scene 10 currently runs on mLaw alone, against 0.43 for Scenes 8-9, 0.49 for
    Scene 11 and 0.40 for Scene 7 (which is mChaos alone, now that aCrowd's
    stand-in is gone too). That gap is the point -- it is the chapter's quiet beat,
    and it is the one scene where a wrong stand-in is worse than nothing.


SCENE 10 IS THE QUIET BEAT, NOT A HOLE
--------------------------------------
Three separate "leave it empty" decisions all land on this one scene, and each was
right on its own: aPaper has no file, Scene 10 has no arrival cue (see the CUES
section), and glyphRoll -- its disc motion sound -- has no file either. Stacked,
they left Scene 10 running on nothing but the tail of a fade of a STAND-IN track.

Measured across the chapter's rest points, with only the beds that actually have
files counted:

    Scenes 1-3   -8.0      Scene 8-9    -7.3
    Scenes 4-6   -8.4      Scene 10    -14.3   <- 7 dB under everything else
    Scene 7      -8.0      Scene 11     -6.1

That is not a quiet beat, it is a dropout, and it is worse than the number looks
for a reason the table does not show. Scene 10 is a REST scene, so the reader
sits in it for as long as they want to read -- unlike a drag, it does not pass.
It was reported as "a stretch where I hear nothing".

FIX: mLaw's fade-out start moved 8.40 -> 8.80, so it settles at 0.28 rather than
0.19 when Scene 10 lands. Scene 10 is now -11.1 dB: still the quietest scene in
the chapter by 3.8 dB, still an audible settle on the way in (-7.3 through the
drag, down to -11.1 on arrival), but present.

Nothing else moved. aPaper stays empty, the cue stays removed, and the design
intent -- Scene 10 as the chapter's rest -- is unchanged. If aPaper is ever
filled, pull mLaw back toward 8.40 so the pair still lands near -11 dB rather than
stacking on top of the new level.

aRuin                                              vol 0.26
    Fades in 9.05-9.60, never fades out.
    Scene 11.


SCENE CUES (fire once when passed; re-arm on going back 0.6 clear)
------------------------------------------------------------------
    That 0.6 was 0.15 and was far too twitchy. Every cue sits at a scene rest
    position reached by a 1200px drag, so 0.15 scene units is about 180px --
    under two wheel notches. Nudging back and scrolling forward re-fired the cue,
    which reads as the sound repeating itself. At 0.6 a re-arm means travelling
    most of the way back to the previous scene, which is what a revisit is; every
    cue was checked so a genuine return still re-arms it.

scrollUnfurl    at  3.00   vol 0.40   plays 5.00-6.00s of the file
stoneDrag       at  5.00   vol 0.42   trimmed to 6s
chisel          at  7.00   vol 0.40   trimmed to 5s
lowGong         at  8.00   vol 0.38   trimmed to 7s
collapse        at 10.00   vol 0.45   trimmed to 8s   NO FILE -- see SCENE 11

    Scene 10 (position 9.00) has NO cue. It is the one arrival in the chapter
    that is silent by design -- see SCENE 10 below. Scene 11 is different: its
    cue is wired and waiting, it just has no file right now.

    THE PAPER FILE IS A FOLEY PACK, NOT ONE SOUND. lenspulse-foley-paper-
    handling holds three separate takes with the noise floor between them:

        take 1   0.00-0.46s   peak  -7.5 dB
        take 2   2.72-3.50s   peak  -3.0 dB
        take 3   5.00-5.95s   peak   0.0 dB   loudest in the file

    An earlier window of startAt 0.22 + maxDuration 4 straddled takes 1 AND 2, so
    Scene 4 played two paper sounds back to back. Those numbers were set before
    any file existed, guessing "4s is about right for a scroll unfurling" -- the
    filename said `sfx` plural all along.

    scrollUnfurl now takes take 3 -- Scene 4 unfurls the scroll, the bigger
    moment, so it gets the loudest take. Take 2 used to feed Scene 10's
    paperUnroll on a second element; that cue is gone, so take 2 is now unused
    and take 1 always was.

    SCENE 10: NO CUE, AND FOUR ROUNDS OF WHY. Worth recording in full, because
    three of the four fixes look reasonable and none of them worked:

    1. vol 0.34, no fade. Read as a slam: the bed runs flat through the whole
       Scene 9->10 drag, so the cue was the only event, arriving as a one-frame
       jump of +63%.
    2. vol 0.22 with fadeIn 0.40 from 2.72. STILL too loud, and arguably worse.
       The ramp finished at 3.12 and take 2's -3.0dB transient lands at 3.15, so
       the loudest frame still played at full volume -- just 0.4s later, after
       the fade had built anticipation for it. A FADE-IN CANNOT SOFTEN A PEAK IT
       FINISHES BEFORE.
    3. Cut past the transient entirely: startAt 3.16, maxDuration 0.55, vol 0.36,
       playing only take 2's decaying tail. Measured against the file's own
       envelope the loudest frame heard dropped from 0.156 to 0.079 (5.8dB), and
       this is the version that survived longest -- but it was still the loudest
       thing in the scene.
    4. REMOVED. The problem was never the number. Scene 10 is the chapter's
       calmest beat and aPaper is deliberately empty, so the only thing under the
       cue is mLaw already tapering out. Any cue there is a solo, and a solo quiet
       enough to belong in that scene is not audible at all. Scene 10's sound is
       now the mLaw -> mCollapse handover by itself.

    Do NOT put a cue back on 9.00 on the strength of a lower `volume` -- that is
    round 1 again. If a real parchment ambience ever fills aPaper there would be
    something for a cue to sit inside, and only then is it worth retrying.

    A hit -- chisel, collapse -- should NOT get a fadeIn; those want the transient.

    SCENE 11: THE SLOT IS RIGHT, THE FILE WAS WRONG. good_b_music-grand-final-
    orchestral-tutti filled `collapse` and has been pulled. It measured fine --
    lead-in 552ms, 13.5s trimmed to the first 8 -- and it failed on the only test
    the audit script explicitly cannot run: an orchestral TUTTI is a triumphant
    finale, and Scene 11 is the empires falling. It read as the wrong emotion, at
    volume, as the last thing before Chapter 3. This file was flagged as a known
    compromise from the day it landed; that flag is what a deferred ear decision
    looks like, and this is it being made.

    The cue entry stays, with `at` and `volume` and maxDuration intact -- only
    the filename went. Its startAt was DROPPED with the file: 0.53 was measured
    off that tutti's own lead-in and means nothing to whatever lands next.
    Re-measure it, do not carry it over. Wanted here: a building-collapse rumble,
    earthquake rumble or deep boom (see SOURCING GUIDE), which is what the slot
    was designed around before the tutti was substituted for it.

    The file was good_b_music-grand-final-orchestral-tutti-9927.mp3. It was kept
    in candidates/ for a while and has since been deleted. NOTE: assets/audio/ is
    not tracked by git, so it is not in history either -- the name above is the
    entire record of which file this was. Revisiting the ear decision means
    downloading it again under that name.

    scrollUnfurl lands on Scene 4's arrival, timed with the parchment banner's
    own scene4-scroll-unfurl animation.
    stoneDrag lands on Scene 6, the moment the sledge-on-wet-sand answer appears.
    chisel lands on Scene 8 -- Hammurabi cutting the law into the stele.
    lowGong marks Scene 9, "law on stone".
    collapse is the last thing heard before Chapter 3 -- once it has a file.
    Until then Chapter 2 ends on mCollapse and aRuin alone.


CLICK SOUNDS
------------
sledgeClick    vol 0.50   trimmed 1.2s   #hitbox-sledge (Scene 6)
slideChange    vol 0.30   trimmed 1.0s   Scene 3 carousel, Giza <-> El Castillo
uiClick        vol 0.35                  mute button, on unmute only

    #hitbox-sledge is the only click target in the chapter body -- the popup and
    hotspot markers in chapter2.json are not wired to anything.
    slideChange fires from goToSubSlide(): the carousel is the one place a scene
    changes without the track moving, so it is the one place the position-driven
    system cannot see on its own.
    uiClick deliberately points at Chapter 1's copy
    (../chapter1/universfield-mouse-click-351398.mp3) rather than duplicating a
    33 KB file and a second licensing entry for the same sound.


MOTION SOUNDS (level follows scroll SPEED, not scroll position)
---------------------------------------------------------------
This is the "sound when you scroll" layer: every piece of artwork that moves
under the scroll makes a noise while it is moving. Eight set-pieces, but only
FOUR files -- entries marked (shared) reuse another entry's file on their own
element, the same way Chapter 1 reuses fire-6699 across a layer and an sfx.

  id            file          span   scene  vol   what moves
  ------------  ------------  -----  -----  ----  --------------------------
  coinSpin      coinSpin        450     1   0.28  two Mayan coins spinning
  glyphRoll     glyphRoll      4500     2   0.34  four glyph discs rolling
  featherWrite  featherWrite   2400     4   0.22  feather tracing the caption
  sphinxEnter   sphinxGrind     900     4   0.26  sphinx sliding in (shared)
  pharaohEnter  sphinxGrind     900     5   0.24  two pharaoh figures (shared)
  textReveal    featherWrite   2400     7   0.14  text arriving line by line (shared)
  sphinxGrind   sphinxGrind    1000     8   0.30  two sphinxes sliding apart
  discFlow      glyphRoll      1600    10   0.24  seven calendar discs (shared)

    The sharing is not a shortcut, it is the same object twice: Scene 10's
    calendar discs ARE Mayan stone discs like Scene 2's glyphs, and the sphinx
    and pharaoh figures are all heavy stone statues sliding. textReveal is the
    quietest thing in the chapter at 0.14 -- text arriving should be felt more
    than heard.

    None of these could be ordinary layers. During all of them the track does not
    move -- applyScene2GlyphTransform holds translateY at exactly -100vh for the
    first 70% of its drag -- so the scene position the rest of the system runs on
    is blind to them. Each gets its own hook instead, one line at the end of the
    apply* function that drives it.

    Level follows how fast the gesture is being dragged, not how far it has got.
    Stop scrolling halfway and the sound fades in about 450ms even though the
    discs are still mid-screen -- a rolling-stone sound over a stationary stone is
    worse than silence. Each hook adds movement to a decaying energy accumulator
    that the rAF loop drains.

    THREE GUARDS IN THERE THAT LOOK ARBITRARY AND ARE NOT:

    Energy is capped at its saturation point. A sustained drag otherwise banks
    about twice what it can use, and the tail then takes a full second to die --
    long after the thing on screen stopped.

    A single call covering 90% or more of its gesture (MOTION_RESET_T) is
    DISCARDED. Those are the programmatic resets -- applyScene5PharaohSlide(0)
    and applyScene8SphinxSlide(0) when leaving a scene. They jump the whole
    gesture, which real input never does. Clamping such a jump instead of
    dropping it was tried first and still made an audible blip.

    The absolute cap is 1500px, NOT a tight number. It was 600px at first, on the
    reasoning that a wheel tick is only ~100px. That was wrong: a hard trackpad
    flick legitimately produces a deltaY near 1000, which on the 4500px glyph drag
    is a valid 22% of the gesture -- so the rolling sound dropped out exactly when
    someone scrolled hard. Do not tighten it back. The fractional rule above is
    what catches resets; this one is only a backstop for a wild delta, and it has
    to stay clear of real input.


NOTES
-----
- Files longer than the moment needs are trimmed in code (a short volume ramp,
  then pause), so nothing here needs editing in an audio editor.
- BEDS ARE TRIMMED TOO, via startAt and loopEnd. This is not the same mechanism
  as a cue's startAt. A bed loops, and el.loop always restarts at 0, so a file
  with a silent head would replay that silence on every single cycle -- one of
  the sourced tracks is silent for its first 2.7 seconds. A bed with either value
  set therefore turns el.loop OFF and drives its own cycle (attachLoopWindow in
  js/chapter2.js): `ended` rewinds to startAt, and a timeupdate watch rewinds
  early at loopEnd to skip a fading tail that would dip at the seam.
  The source files stay exactly as downloaded, so the credits still match what
  was actually obtained.
- CUE TIMING IS NOT UNIFORM, by consequence of how the chapter moves. On the nine
  drag boundaries a cue fires when the drag completes, which is the moment the
  scene has fully arrived. On the one jump boundary (Scene 10 -> 11) the inline
  transform reaches its target immediately, so `collapse` fires as the transition
  BEGINS -- about 700ms before Scene 11 settles. For a deep rumble under an
  incoming scene that is arguably the better placement, but it is a judgement
  call that needs an ear. If it wants pushing back, the fix is a delay field on
  the cue rather than a change to `at` (position never goes past 10).
- startAt skips a file's own lead-in so the sound lands on the same frame as the
  click. uiClick uses 0.10, measured rather than guessed: that file is silent
  through 24ms, sits at low-level room tone to about 96ms, and only hits its
  transient at 120ms -- which is past the ~100ms mark where a delay becomes
  audible, and it did read as a lagging click before the offset was added.
  sledgeClick and slideChange still need the same treatment once their files
  land. Measure first, do not guess, and do not trim the file itself.

  MEASURING: scratchpad/audio-audit.js does all of this automatically. Run
  `node audio-audit.js` to screen everything in this folder, or
  `node audio-audit.js mEgypt=some-track.mp3` to judge a file against a specific
  slot. It reports duration, size, lead-in and loop seam, applies the limits
  above, and prints the startAt any click sound needs. `--selftest` checks the
  analyser against Chapter 1, whose four known-bad files it must still catch.

  What it CANNOT do is tell you whether a track sounds right for its scene, and
  it deliberately does not compute a `volume` for you: global_gain is a quantiser
  scale factor, so its absolute value tracks encoder and spectral content as much
  as loudness, and comparing it across unrelated files means very little. The
  volumes in this file are the mix plan; set them finally by ear.

  KNOWN BUG -- A GARBAGE TAIL LONGER THAN 3 FRAMES BREAKS EVERY OTHER NUMBER.
  The script drops the last 3 frames because they are routinely garbage. On
  starostin-documentary-sad-sorrowful the garbage runs 27 frames, all carrying an
  identical global_gain of 210. Three dropped is not enough, so 210 becomes the
  file's apparent peak -- 32dB above the real one of 170 -- and since lead-in is
  defined as "first frame within 12dB of the peak", NO real frame qualifies. The
  script reported "45086ms of silence at the head" and suggested startAt 45.06 on
  a 45.8s file, which would have left 0.74s of audio looping. The true lead-in is
  26ms.

  SPOTTING IT: any suggested startAt near the file's own duration is this bug,
  not a property of the file. So is a lead-in that would leave less audio than
  the 30s a bed needs. Both mean the peak is wrong.

  CONFIRMING IT: dump the per-second envelope instead of trusting one number --
  scratchpad/envelope.js prints it, using the same frame parse. A real fade has a
  slope; this artefact is a flat run of identical values pinned to the last
  second. A constant global_gain over dozens of frames is not something real
  audio produces.

  The fix is to drop trailing frames whose gain is identical rather than a fixed
  count of 3. Not done yet -- it changes an analyser that is currently trusted by
  every measurement in this file, and `--selftest` must still catch Chapter 1's
  four known-bad files afterwards.

  HOW TO MEASURE A LEAD-IN WITHOUT FFMPEG (there is none on this machine):
  read global_gain straight out of each MP3 frame's side info -- no decoding
  needed. Walk the frames from the first sync word (skipping any ID3v2 header),
  and for MPEG1 Layer III read 8 bits at offset 21 within each granule/channel
  block of 59 bits, after a header of 9 + (5 mono / 3 stereo) + 4*channels bits.
  Two traps: a stereo file carries one value PER CHANNEL per granule, so collapse
  them with max -- counting them as extra granules doubles the apparent length --
  and the last ~3 frames are usually garbage and must be dropped before taking
  the peak. Each step of 2 in global_gain is about 1.5 dB, which is enough to
  plot an envelope and read the transient off it directly.
- Everything except mWonder uses preload="none" and only starts downloading
  about 1.5 scenes before it is needed, so the page does not pull the whole
  library up front.
- Browsers block audio until a real user interaction, so nothing plays until the
  first wheel, tap or click.
- Muting is instant, and mute is now SHARED across the whole site rather than
  per-page. The dedicated pass this note used to ask for has happened: the mute
  button and its icons live in js/audio-settings.js, used by the index page and
  both chapters, under one key -- 'audioMuted'. The old per-page keys
  ('chapter2Muted', 'chapter1Muted', 'indexMuted') are read once as a fallback so
  an existing visitor's choice is not reset, and are not written to any more.
- Mute is the ONLY audio setting: there is no in-page volume control, so every
  number in this file is exactly what plays. Anyone wanting it louder or quieter
  uses their own device, which leaves the mix alone -- the balance between slots
  is set here and nothing else scales it.
- While muted nothing downloads, so unmuting part-way through the chapter may be
  briefly silent while the current bed loads. Chapter 1 behaves the same way.
- Filenames deliberately keep their original author handles -- see below.


LICENSING -- FILL THIS IN AS EACH FILE IS ADDED
-----------------------------------------------
Pixabay audio generally needs no attribution. Freesound CC-BY clips DO. Check
each clip on its own source page as you download it and fill in the row -- this
is much harder to reconstruct later, which is why Chapter 1's list is still
outstanding.

  key            filename                         source     license   attrib?
  -------------  -------------------------------  ---------  --------  -------
  mWonder
  mEgypt
  mChaos         starostin-documentary-sad-       Pixabay    Pixabay   no
                 sorrowful-music-479773.mp3                  Content
                                                             License
  mLaw
  mCollapse
  aDesert
  aCrowd
  aHall
  aPaper
  aRuin
  scrollUnfurl
  stoneDrag
  chisel
  lowGong
  collapse
  sledgeClick
  slideChange
  coinSpin
  glyphRoll      (also serves discFlow)
  sphinxGrind    (also serves sphinxEnter, pharaohEnter)
  featherWrite   (also serves textReveal)
  uiClick        (Chapter 1's copy -- see ../chapter1/README.txt)

Once every row has an answer, any clip marked "attrib? yes" needs a credits list
-- in this file at minimum, and ideally somewhere visible on the site.
