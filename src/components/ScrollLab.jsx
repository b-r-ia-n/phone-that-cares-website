/**
 * ScrollLab.jsx — The Scroll Lab, ported from Chrome Extension to React/Astro
 *
 * A self-contained React component that embeds the Scroll Lab experiment panel
 * into an Astro website. Uses direct DOM manipulation for experiments that
 * modify elements outside the component tree.
 *
 * Usage in Astro: <ScrollLab client:load />
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ============================================================
// CONSTANTS
// ============================================================

const BASE_INERT_MIN = 10;
const BASE_RAMP_MIN  = 10;
const WAR_AND_PEACE_WORDS = 580_000;
const FONTS = [null, 'Georgia'];
const WAVE_CHARS = ['~', '\u2248', '\u223C', '\u00B7', '.', '\u02D9', '\u2591', '\u2592'];

const ALTERING_FEATURES = [
  'contentPadding', 'blur',
  'grayscale', 'letterTwinkle',
];

const PANEL_FEATURES = [
  { key: 'none',            name: 'None',            hint: 'Passive tracking only' },
  { key: 'contentPadding',  name: 'Content Padding',  hint: 'Spreads out content over time' },
  { key: 'blur',            name: 'Feed Blur',        hint: 'Gradually blurs the content' },
  { key: 'grayscale',       name: 'Grayscale',        hint: 'Slowly desaturates the entire page' },
  { key: 'letterTwinkle',   name: 'Letter Twinkle',   hint: 'Letters sparkle like stars' },
];

// ============================================================
// BREAK CARD ASCII ART (all 12 from Chrome extension)
// ============================================================

const BREAK_CARDS = [
  // 1 - Starry Night
`
            .
                                 *
                                              .
       *                                                         .
                    .
                                                    *
                                         .
   .
                         *                                 .

             .                      .
                                                                    *
                                              *
        *              .
                                                          .

   .                          *                                      .

                    .
                                         .                *
            *

                          .                         .
   .
                                    *                              .
             *
                       .                      .
                                                             *
        .                     *
                                                  .
                    .
   *                                                               .
                              .            *

            .                                            .
                        *

   .                              .                                 *

                   *                           .

            .                                              .
                                     *
        *
                        .                          *

   .                                                               .
                              *
                                           .
            .
                                                          *
                    *
                                     .
   .                                                    .
                           *
             .                                                     *
                                          .
        *
                                                   .
                     .
   .                              *

                                           .
            .
                                                          *
                    *
                            .
        .                                               .
                              *
   .                                                               .
             .                         *
                                                   .
        *
                     .
                                          .                        *
   .
                                     .
            .                                              .
                        *
                                           .               *
   .                              .
                   *
                                                               .
            .
        *                          *
                        .
                                           .
   .                                                    .
`,

  // 2 - Clouds
`







               .-~~~-.
           .~~         ~~.
          (               )
       .~~                 ~~.
      (                       )
       \`~~.               .~~'
           \`~~.       .~~'
               \`-~~~-'





                                            .-~~~-.
                                        .~~         ~~.
                                       (               )
                                    .~~                 ~~.
                                   (                       )
                                    \`~~.               .~~'
                                        \`~~.       .~~'
                                            \`-~~~-'





     .-~~~-.
 .~~         ~~.                                .-~~~-.
(               )                           .~~         ~~.
                 ~~.                        (               )
                    )                    .~~                 ~~.
                .~~'                    (                       )
            .~~'                         \`~~.               .~~'
        -~~~-'                               \`~~.       .~~'
                                                 \`-~~~-'








                        .-~~~-.
                    .~~         ~~.
                   (               )
                .~~                 ~~.
               (                       )
                \`~~.               .~~'
                    \`~~.       .~~'
                        \`-~~~-'






                                                     .-~~~-.
                                                 .~~         ~~.
                                                (               )
                                             .~~                 ~~.
                                            (                       )
                                             \`~~.               .~~'
                                                 \`~~.       .~~'
                                                     \`-~~~-'



`,

  // 3 - Grass Field
`






















  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,  ,
  | /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /| /|
  |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/ |/
`,

  // 4 - Birds in Flight
`







                                  \\   /
                                   \\ /
                                    v



         \\   /
          \\ /
           v



                                                    \\     /
                                                     \\   /
                                                      \\ /
                                                       v


                   \\   /
                    \\ /
                     v


                                           \\   /
                                            \\ /
                                             v




      \\     /
       \\   /                                            \\   /
        \\ /                                              \\ /
         v                                                v




                          \\   /
                           \\ /
                            v




                                                           \\     /
                                                            \\   /
                                                             \\ /
                                                              v


               \\   /
                \\ /
                 v



                                       \\   /
                                        \\ /
                                         v



`,

  // 5 - Mountain Range
`













                                /\\
                               /  \\
                              /    \\
                             /      \\             /\\
                            /        \\           /  \\
                     /\\    /          \\         /    \\
                    /  \\  /            \\       /      \\
                   /    \\/              \\     /        \\   /\\
                  /                      \\   /          \\ /  \\
                 /                        \\ /            /    \\
                /                          /            /      \\
               /                          / \\          /        \\
              /                          /   \\        /          \\
             /                          /     \\      /            \\  /\\
            /                          /       \\    /              \\/  \\
           /                          /         \\  /                    \\
          /                          /           \\/                      \\
         /                          /                                     \\
        /                          /                                       \\
       /                          /                                         \\
      /                          /                                           \\
     /                          /                                             \\
    /                          /                                               \\
   /                          /
  /                          /

  . , . '  . , . '  , .   , . '  . , .  ' . , .  '  . ,  . '  , .   , . '  . ,
   ' .  , .  ' . ,  . '  .  , ' .   , . '  . , .  '  .  , .  '  . ,  . '  . ,
  , . '  , .  ' .  , . ' .  , .  '  . , .  ' . , .   , . '  , .   , . '  . , .
   .  , '  .  , . '  . ,   ' .  , .  ' .  , . '  .  , .  ' .  , . '  .  , . '
  . , .  '  . ,  . '  , .   , . '  . , .  ' . , .  '  . ,  . '  , .   , . '  .
  '  .  , .  ' . ,  . '  .   , ' .   , . '  . , .  '  .  , .  '  . ,  . '  . ,
  , . '  , .  ' .  , . ' .  , .  '  . , .  ' . , .   , . '  , .   , . '  . , .
   .  , '  .  , . '  . ,   ' .  , .  ' .  , . '  .  , .  ' .  , . '  .  , . '
  . , .  '  . ,  . '  , .   , . '  . , .  ' . , .  '  . ,  . '  , .   , . '  .
  '  .  , .  ' . ,  . '  .   , ' .   , . '  . , .  '  .  , .  '  . ,  . '  . ,
  , . '  , .  ' .  , . ' .  , .  '  . , .  ' . , .   , . '  , .   , . '  . , .
`,

  // 6 - Forest Trees
`




                *                                *
               ***                              ***
              *****                            *****
             *******                          *******
            *********                        *********
           ***********                      ***********
          *************                    *************
         ***************                  ***************
               |                                |
               |                                |


                         *                                *
                        ***                              ***
                       *****                            *****
                      *******                          *******
                     *********                        *********
                    ***********                      ***********
                   *************                    *************
                  ***************                  ***************
                        |                                |
                        |                                |


       *                                *                               *
      ***                              ***                             ***
     *****                            *****                           *****
    *******                          *******                         *******
   *********                        *********                       *********
  ***********                      ***********                     ***********
 *************                    *************                   *************
***************                  ***************                 ***************
      |                                |                               |
      |                                |                               |


                  *                                *
                 ***                              ***
                *****                            *****
               *******                          *******
              *********                        *********
             ***********                      ***********
            *************                    *************
           ***************                  ***************
                 |                                |
                 |                                |



     *                   *                    *                   *
    ***                 ***                  ***                 ***
   *****               *****                *****               *****
  *******             *******              *******             *******
 *********           *********            *********           *********
***********         ***********          ***********         ***********
    |                   |                    |                   |
    |                   |                    |                   |

  .:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:.
  :;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..
  ;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..
  :..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:
  ..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..;:
  .:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:.
  :;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..
  ;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..
`,

  // 7 - Rain
`
        |              |                    |              |
                  |              |                    |              |
    |                       |         |                       |
              |                              |                           |
   |                    |              |                    |
                  |              |                    |              |
        |                       |         |                       |
              |     |                  |         |                        |
   |                    |                             |                    |
                  |              |         |                    |
        |                       |                  |              |
    |              |     |                  |                       |
              |                    |   |                    |
   |                    |                            |              |
                  |              |         |                       |
        |                       |                |     |
              |     |                  |                    |              |
   |                    |                            |              |
        |         |              |         |                       |
                        |                        |     |
    |              |                    |                    |
              |              |              |                       |
   |                       |         |              |     |
                  |                             |                    |
        |              |              |                    |
              |                    |         |              |              |
   |                    |                            |                       |
        |         |              |         |                       |
                        |                        |     |
    |              |                    |                    |
              |              |              |                       |
   |                       |         |              |     |
                  |                             |                    |
        |              |              |                    |
              |                    |         |              |              |
   |                    |                            |                       |
        |         |              |         |                       |
                        |                        |     |
    |              |                    |                    |
              |              |              |                       |
   |                       |         |              |     |
                  |                             |                    |
        |              |              |                    |
              |                    |         |              |              |
   |                    |                            |                       |
        |         |              |         |                       |
                        |                        |     |
    |              |                    |                    |
              |              |              |                       |
   |                       |         |              |     |
                  |                             |                    |
        |              |              |                    |
              |                    |         |              |              |
   |                    |                            |                       |
        |         |              |         |                       |
                        |                        |     |
    |              |                    |                    |
              |              |              |                       |
   |                       |         |              |     |
                  |                             |                    |
        |              |              |                    |
              |                    |         |              |              |
   |                    |                            |                       |
        |         |              |         |                       |
                        |                        |     |
    |              |                    |                    |
`,

  // 8 - Garden Flowers
`









                       @
                      @@@                            @
                     @@@@@                          @@@
                      @@@                          @@@@@
                       @                            @@@
                       |                             @
                       |                             |
                       |                             |
                       |                             |
                       |                             |




                                  @
                                 @@@                        @
          @                     @@@@@                      @@@
         @@@                     @@@                      @@@@@
        @@@@@                     @                        @@@
         @@@                      |                         @
          @                       |                         |
          |                       |                         |
          |                       |                         |
          |                       |                         |
          |                       |                         |



   @                                           @
  @@@               @                         @@@
 @@@@@             @@@                       @@@@@             @
  @@@             @@@@@                       @@@             @@@
   @               @@@             @           @             @@@@@
   |                @             @@@          |              @@@
   |                |            @@@@@         |               @
   |                |             @@@          |               |
   |                |              @           |               |
   |                |              |           |               |
                                   |                           |
                                   |


  .:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:.
  :;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..
  ;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..
  :..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:
  ..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..;:
  .:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:.
  :;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..
  ;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..:;:..
`,

  // 9 - Falling Leaves
`



                \\
                                              \\


                              /

                                                          \\
      /


                         \\

                                                  /


             /

                                          \\


   \\                                                         /

                                  /


                                                    \\
         \\


                            /

                                                              /


                    \\

                                            /


   /

                                                     \\


              /

                                    \\


                                                         /

       \\


                          /

                                              \\


                   /

                                                    /


                \\

                                    \\


                                                         /

       /


                          \\

                                              /


                    \\

                                                    \\


              /

                                    /


                                                         \\

       \\


                          /

                                              \\


                   /
`,

  // 10 - Constellations
`



             *
            / \\
           /   \\                                  *
          *     *                                /
                 \\                              /
                  \\                            *-----*
                   *                                  \\
                                                       \\
                                                        *



                           *
                          / \\
                         /   \\
                        /     \\
                       *       *-----*
                                      \\
                                       *



    *
     \\                                                         *
      \\                                                       / \\
       *-----*                                               /   *
              \\                                             /
               *                                           *



                                    *-----*
                                   /       \\
                                  /         *
                                 *         /
                                          /
                                         *




            *
           / \\                                            *
          /   *                                          / \\
         *                                              *   *
                                                             \\
                                                              *



                       *
                      /
                     /
                    *-----*
                           \\
                            *



`,

  // 11 - Ripples on Water
`












                                   .

                               . .   . .

                           .  .         .  .

                        .  .               .  .

                     .  .                     .  .

                  .  .                           .  .

               .  .                .                .  .

            .  .               . .   . .              .  .

         .  .              .  .         .  .              .  .

       .  .             .  .               .  .             .  .

     .  .            .  .                     .  .            .  .

   .  .           .  .                           .  .           .  .

  .  .         .  .                                 .  .          .  .

                .  .                                 .  .

                  .  .                           .  .

                     .  .                     .  .

                        .  .               .  .

                           .  .         .  .

                               . .   . .

                                   .



`,

  // 12 - Ocean Swell
`
              .                                          .
        .            .                  .           .              .
     .      .     .        .      .         .    .       .     .      .
   .    ~   .    .   ~   .      ~   .    .   ~   .    ~   .   .   ~   .
  ~ .  ~  ~ . ~  ~ .  ~  ~ . ~  ~  ~ . ~  ~ .  ~  ~ . ~  ~  ~ .  ~  ~ . ~
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
  ~ .  ~  ~ .  ~ ~ .  ~  ~ .  ~ ~  ~ . ~  ~ .  ~  ~ .  ~  ~ . ~  ~ .  ~  ~
   .    ~   .    .   ~   .    .  ~   .   .   ~   .    ~   .   .   ~   .
     .      .     .        .      .      .   .       .     .      .     .
        .            .                  .           .              .
              .                                          .

              .                                .
        .            .                  .           .              .
     .      .     .       .       .         .    .       .     .      .
   .    ~   .    .   ~   .      ~   .    .   ~   .    ~   .   .   ~   .
  ~ .  ~  ~ . ~  ~ .  ~  ~ .  ~ ~  ~ . ~  ~ .  ~  ~ . ~  ~  ~ .  ~  ~ . ~
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
  ~ .  ~  ~ .  ~  ~ .  ~  ~ . ~ ~  ~ .  ~  ~ .  ~  ~ .  ~  ~ . ~  ~ .  ~  ~
   .    ~   .    .   ~   .    .  ~   .   .   ~   .    ~   .   .   ~   .
     .      .     .        .      .      .    .      .     .      .     .
        .            .                  .           .              .
              .                                          .

              .                                          .
        .            .                  .           .              .
     .      .     .        .      .         .    .       .     .      .
   .    ~   .    .   ~   .      ~   .    .   ~   .    ~   .   .   ~   .
  ~ .  ~  ~ . ~  ~ .  ~  ~ . ~  ~  ~ . ~  ~ .  ~  ~ . ~  ~  ~ .  ~  ~ . ~
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
  ~ .  ~  ~ .  ~ ~ .  ~  ~ .  ~ ~  ~ . ~  ~ .  ~  ~ .  ~  ~ . ~  ~ .  ~  ~
   .    ~   .    .   ~   .    .  ~   .   .   ~   .    ~   .   .   ~   .
     .      .     .        .      .      .   .       .     .      .     .
        .            .                  .           .              .
              .                                          .

              .                                .
        .            .                  .           .              .
     .      .     .       .       .         .    .       .     .      .
   .    ~   .    .   ~   .      ~   .    .   ~   .    ~   .   .   ~   .
  ~ .  ~  ~ . ~  ~ .  ~  ~ .  ~ ~  ~ . ~  ~ .  ~  ~ . ~  ~  ~ .  ~  ~ . ~
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
  ~ .  ~  ~ .  ~  ~ .  ~  ~ . ~ ~  ~ .  ~  ~ .  ~  ~ .  ~  ~ . ~  ~ .  ~  ~
   .    ~   .    .   ~   .    .  ~   .   .   ~   .    ~   .   .   ~   .
     .      .     .        .      .      .    .      .     .      .     .
        .            .                  .           .              .
              .                                          .

              .                                          .
        .            .                  .           .              .
     .      .     .        .      .         .    .       .     .      .
   .    ~   .    .   ~   .      ~   .    .   ~   .    ~   .   .   ~   .
  ~ .  ~  ~ . ~  ~ .  ~  ~ . ~  ~  ~ . ~  ~ .  ~  ~ . ~  ~  ~ .  ~  ~ . ~
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
  ~ .  ~  ~ .  ~ ~ .  ~  ~ .  ~ ~  ~ . ~  ~ .  ~  ~ .  ~  ~ . ~  ~ .  ~  ~
   .    ~   .    .   ~   .    .  ~   .   .   ~   .    ~   .   .   ~   .
     .      .     .        .      .      .   .       .     .      .     .
        .            .                  .           .              .
              .                                          .

              .                                .
        .            .                  .           .              .
     .      .     .       .       .         .    .       .     .      .
   .    ~   .    .   ~   .      ~   .    .   ~   .    ~   .   .   ~   .
  ~ .  ~  ~ . ~  ~ .  ~  ~ .  ~ ~  ~ . ~  ~ .  ~  ~ . ~  ~  ~ .  ~  ~ . ~
 ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~ ~
  ~ .  ~  ~ .  ~  ~ .  ~  ~ . ~ ~  ~ .  ~  ~ .  ~  ~ .  ~  ~ . ~  ~ .  ~  ~
   .    ~   .    .   ~   .    .  ~   .   .   ~   .    ~   .   .   ~   .
     .      .     .        .      .      .    .      .     .      .     .
        .            .                  .           .              .
              .                                          .
`,
];

// ============================================================
// CSS STYLES (injected into document on mount)
// ============================================================

const SCROLLLAB_STYLES = `
/* Break Cards */
.scrolllab-break-card {
  width: 100%;
  min-height: 187vh;
  display: flex !important;
  align-items: flex-end !important;
  justify-content: center !important;
  background: #000 !important;
  box-sizing: border-box;
  padding: 20px;
}
.scrolllab-break-card pre {
  font-family: 'Courier New', Courier, monospace !important;
  font-size: 12px !important;
  line-height: 1.5 !important;
  color: rgba(255, 255, 255, 0.22) !important;
  text-align: left !important;
  white-space: pre !important;
  margin: 0 !important;
  padding: 0 !important;
  background: transparent !important;
  border: none !important;
  letter-spacing: 0.03em;
  overflow: hidden !important;
  max-width: 100% !important;
}

/* Screensaver overlay */
#scrolllab-screensaver {
  position: fixed;
  inset: 0;
  z-index: 9999999;
  background: #0a0a0a;
  overflow: hidden;
  cursor: none;
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
}
#scrolllab-screensaver pre {
  font-family: 'Courier New', Courier, monospace;
  font-size: 13px;
  line-height: 1.25;
  color: #2a9090;
  margin: 0;
  padding: 0;
  white-space: pre;
  letter-spacing: 0.03em;
  text-shadow: 0 0 10px rgba(0, 190, 190, 0.25);
  user-select: none;
}

/* Letter twinkle dim spans */
.scrolllab-dim {
  transition: opacity 0.15s ease-in;
}
`;

// ============================================================
// STORAGE HELPERS
// ============================================================

const STORAGE_KEY = 'scrollLabConfig_v2';

function loadStoredConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw);
    // Merge with defaults so new defaults take effect
    const defaults = makeDefaultConfig();
    return {
      ...defaults,
      ...stored,
      features: { ...defaults.features, ...(stored.features || {}) },
    };
  } catch { return null; }
}

function saveConfig(cfg) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
  } catch { /* ignore */ }
}

// ============================================================
// DEFAULT CONFIG
// ============================================================

function makeDefaultConfig() {
  return {
    rampMinutes: 0,
    features: {
      contentPadding: false,
      blur: false,
      grayscale: false,
      letterTwinkle: false,
      screensaver: true,
      scrollCounter: false,
      minuteTally: false,
    },
  };
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ScrollLab() {
  // ---- State ----
  const [panelOpen, setPanelOpen] = useState(false);
  const [passiveOpen, setPassiveOpen] = useState(false);
  const [screensaverActive, setScreensaverActive] = useState(false);

  // Config stored in ref for use in intervals/effects without re-renders
  const cfgRef = useRef(null);
  const [, forceUpdate] = useState(0);
  const rerender = useCallback(() => forceUpdate(n => n + 1), []);

  // Session state refs
  const sessionStartRef = useRef(null);
  const wordsReadRef = useRef(0);
  const breakCardIdxRef = useRef(0);
  const contentSinceLastBreakRef = useRef(0);
  const lastFontCycleMsRef = useRef(0);
  const currentFontIdxRef = useRef(-1);
  const lastCompletedMinuteRef = useRef(0);

  // DOM manipulation refs
  const mainIntervalRef = useRef(null);
  const wordObserverRef = useRef(null);
  const observedTextsRef = useRef(new WeakSet());
  const countedTextsRef = useRef(new WeakSet());
  const paddedElementsRef = useRef(new Set());
  const breakCardsInsertedRef = useRef(new WeakSet());

  // Wave distortion refs
  const waveSvgRef = useRef(null);
  const waveFilterRef = useRef(null);
  const waveRafRef = useRef(null);
  const waveStartRef = useRef(0);

  // Letter twinkle ref
  const twinkleIntervalRef = useRef(null);

  // Screensaver refs
  const screensaverElRef = useRef(null);
  const screensaverRafRef = useRef(null);
  const screensaverStartRef = useRef(0);
  const screensaverLastFrameRef = useRef(0);

  // Tally DOM refs
  const tallyMarksRef = useRef(null);
  const tallyProgressRef = useRef(null);

  // Ramp canvas ref
  const rampCanvasRef = useRef(null);

  // Panel ref for click-outside
  const panelRef = useRef(null);
  const btnRef = useRef(null);

  // Style element ref
  const styleRef = useRef(null);

  // ---- Derived timing functions ----
  const getCfg = useCallback(() => {
    if (!cfgRef.current) {
      const stored = loadStoredConfig();
      cfgRef.current = stored || makeDefaultConfig();
    }
    return cfgRef.current;
  }, []);

  const getSpeed = useCallback(() => {
    const c = getCfg();
    return c.rampMinutes === 0 ? 20 : 20 / c.rampMinutes;
  }, [getCfg]);

  const getTestMode = useCallback(() => getCfg().rampMinutes === 0, [getCfg]);

  const elapsedMinutes = useCallback(() => {
    if (!sessionStartRef.current) return 0;
    return (Date.now() - sessionStartRef.current) / 60000;
  }, []);

  const inertMinutes = useCallback(() => BASE_INERT_MIN / getSpeed(), [getSpeed]);
  const rampMinutesCalc = useCallback(() => BASE_RAMP_MIN / getSpeed(), [getSpeed]);

  const rampProgress = useCallback(() => {
    if (getTestMode()) return 1;
    const elapsed = elapsedMinutes();
    const inert = inertMinutes();
    if (elapsed < inert) return 0;
    return Math.min(1, (elapsed - inert) / rampMinutesCalc());
  }, [getTestMode, elapsedMinutes, inertMinutes, rampMinutesCalc]);

  const pastInert = useCallback(() => {
    if (getTestMode()) return true;
    return elapsedMinutes() >= inertMinutes();
  }, [getTestMode, elapsedMinutes, inertMinutes]);

  const sessionFraction20 = useCallback(() => {
    return Math.min(1, elapsedMinutes() / 20);
  }, [elapsedMinutes]);

  // ---- Content selectors ----
  const getContentItems = useCallback(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    return Array.from(main.querySelectorAll('p, h2, h3, li, blockquote'));
  }, []);

  const getTextElements = useCallback(() => {
    const main = document.querySelector('main');
    if (!main) return [];
    return Array.from(main.querySelectorAll('p, h2, h3, li, blockquote, a'));
  }, []);

  const getMainElement = useCallback(() => document.querySelector('main'), []);

  // ---- Update config and save ----
  const updateCfg = useCallback((updater) => {
    const c = getCfg();
    updater(c);
    cfgRef.current = { ...c };
    saveConfig(c);
    rerender();
  }, [getCfg, rerender]);

  // ---- Feature: Content Padding ----
  const clearContentPadding = useCallback(() => {
    paddedElementsRef.current.forEach(el => {
      if (el && el.style) {
        el.style.removeProperty('margin-top');
        el.style.removeProperty('margin-bottom');
      }
    });
    paddedElementsRef.current.clear();
  }, []);

  const updateContentPadding = useCallback(() => {
    const c = getCfg();
    if (!c.features.contentPadding) { clearContentPadding(); return; }
    const progress = rampProgress();
    if (progress === 0) return;
    const halfPx = Math.round(progress * 60);
    getContentItems().forEach(el => {
      el.style.setProperty('margin-top', `${halfPx}px`, 'important');
      el.style.setProperty('margin-bottom', `${halfPx}px`, 'important');
      paddedElementsRef.current.add(el);
    });
  }, [getCfg, rampProgress, getContentItems, clearContentPadding]);

  // ---- Feature: Break Cards ----
  const clearBreakCards = useCallback(() => {
    document.querySelectorAll('[data-scrolllab-break]').forEach(el => el.remove());
    contentSinceLastBreakRef.current = 0;
  }, []);

  const createBreakCardEl = useCallback(() => {
    const fullArt = BREAK_CARDS[breakCardIdxRef.current % BREAK_CARDS.length];
    breakCardIdxRef.current = (breakCardIdxRef.current + 1) % BREAK_CARDS.length;
    const lines = fullArt.split('\n');
    const maxLines = Math.floor((window.innerHeight * 1.87 - 40) / 18);
    let cropped = lines;
    if (lines.length > maxLines) {
      const start = Math.floor((lines.length - maxLines) / 2);
      cropped = lines.slice(start, start + maxLines);
    }
    const card = document.createElement('div');
    card.className = 'scrolllab-break-card';
    card.setAttribute('data-scrolllab-break', 'true');
    card.setAttribute('aria-hidden', 'true');
    const pre = document.createElement('pre');
    pre.textContent = cropped.join('\n');
    card.appendChild(pre);
    return card;
  }, []);

  const updateBreakCards = useCallback(() => {
    const c = getCfg();
    if (!c.features.breakCards || !pastInert()) return;
    const freq = Math.max(3, Math.round(8 - rampProgress() * 5));
    getContentItems().forEach(el => {
      if (breakCardsInsertedRef.current.has(el)) return;
      breakCardsInsertedRef.current.add(el);
      contentSinceLastBreakRef.current++;
      if (contentSinceLastBreakRef.current >= freq) {
        contentSinceLastBreakRef.current = 0;
        const card = createBreakCardEl();
        if (el.parentElement) {
          el.parentElement.insertBefore(card, el.nextSibling);
        }
      }
    });
  }, [getCfg, pastInert, rampProgress, getContentItems, createBreakCardEl]);

  // ---- Feature: Filters (blur, grayscale) ----
  const clearFilters = useCallback(() => {
    const main = getMainElement();
    if (main) main.style.filter = '';
    document.documentElement.style.filter = '';
  }, [getMainElement]);

  const updateFilters = useCallback(() => {
    const c = getCfg();
    if (c.features.blur) {
      const main = getMainElement();
      if (main) {
        const p = rampProgress();
        main.style.filter = `blur(${(p * 1.5).toFixed(2)}px)`;
      }
    }
    if (c.features.grayscale) {
      const p = rampProgress();
      document.documentElement.style.filter = `grayscale(${(p * 100).toFixed(1)}%)`;
    }
  }, [getCfg, rampProgress, getMainElement]);

  // ---- Feature: Font Cycling ----
  const clearFontCycling = useCallback(() => {
    document.querySelectorAll('[data-scrolllab-font]').forEach(el => {
      el.style.removeProperty('font-family');
      el.querySelectorAll('span').forEach(s => s.style.removeProperty('font-family'));
      delete el.dataset.scrolllabFont;
    });
    currentFontIdxRef.current = -1;
    lastFontCycleMsRef.current = 0;
  }, []);

  const applyFontToElement = useCallback((el, idx) => {
    if (idx < 0) return;
    const font = FONTS[idx];
    if (font === null) {
      el.style.removeProperty('font-family');
      el.querySelectorAll('span').forEach(s => s.style.removeProperty('font-family'));
    } else {
      const value = `${font}, sans-serif`;
      el.style.setProperty('font-family', value, 'important');
      el.querySelectorAll('span').forEach(s => s.style.setProperty('font-family', value, 'important'));
    }
    el.dataset.scrolllabFont = String(idx);
  }, []);

  const checkFontCycle = useCallback(() => {
    const c = getCfg();
    if (!c.features.fontCycling || !pastInert()) return;
    if (getTestMode() || Date.now() - lastFontCycleMsRef.current >= 60000) {
      let idx;
      do { idx = Math.floor(Math.random() * FONTS.length); }
      while (idx === currentFontIdxRef.current && FONTS.length > 1);
      currentFontIdxRef.current = idx;
      lastFontCycleMsRef.current = Date.now();
    }
    const idx = currentFontIdxRef.current;
    if (idx < 0) return;
    getTextElements().forEach(el => {
      if (!el.dataset.scrolllabFont) applyFontToElement(el, idx);
    });
  }, [getCfg, pastInert, getTestMode, getTextElements, applyFontToElement]);

  // ---- Feature: Wave Distortion ----
  const stopWaveDistortion = useCallback(() => {
    if (waveRafRef.current) { cancelAnimationFrame(waveRafRef.current); waveRafRef.current = null; }
    document.documentElement.style.filter = '';
    if (waveSvgRef.current) { waveSvgRef.current.remove(); waveSvgRef.current = null; waveFilterRef.current = null; }
  }, []);

  const startWaveDistortion = useCallback(() => {
    if (!waveSvgRef.current) {
      const ns = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(ns, 'svg');
      svg.setAttribute('width', '0');
      svg.setAttribute('height', '0');
      svg.style.position = 'absolute';
      svg.id = 'scrolllab-wave-svg';

      const defs = document.createElementNS(ns, 'defs');
      const filter = document.createElementNS(ns, 'filter');
      filter.setAttribute('id', 'scrolllab-wave-filter');

      const turbulence = document.createElementNS(ns, 'feTurbulence');
      turbulence.setAttribute('type', 'fractalNoise');
      turbulence.setAttribute('baseFrequency', '0.01 0.005');
      turbulence.setAttribute('numOctaves', '2');
      turbulence.setAttribute('seed', '2');
      turbulence.setAttribute('result', 'turbulence');

      const displacement = document.createElementNS(ns, 'feDisplacementMap');
      displacement.setAttribute('in', 'SourceGraphic');
      displacement.setAttribute('in2', 'turbulence');
      displacement.setAttribute('scale', '0');
      displacement.setAttribute('xChannelSelector', 'R');
      displacement.setAttribute('yChannelSelector', 'G');

      filter.appendChild(turbulence);
      filter.appendChild(displacement);
      defs.appendChild(filter);
      svg.appendChild(defs);
      document.body.appendChild(svg);

      waveSvgRef.current = svg;
      waveFilterRef.current = { turbulence, displacement };
      waveStartRef.current = performance.now();
    }

    const animate = (ts) => {
      if (!getCfg().features.waveDistortion || !waveFilterRef.current) {
        if (waveRafRef.current) { cancelAnimationFrame(waveRafRef.current); waveRafRef.current = null; }
        return;
      }
      const progress = rampProgress();
      const t = (ts - waveStartRef.current) / 1000;
      const freqX = 0.008 + Math.sin(t * 0.15) * 0.004;
      const freqY = 0.004 + Math.cos(t * 0.12) * 0.002;
      waveFilterRef.current.turbulence.setAttribute('baseFrequency', `${freqX.toFixed(5)} ${freqY.toFixed(5)}`);
      const scale = progress * 5;
      waveFilterRef.current.displacement.setAttribute('scale', scale.toFixed(1));
      if (progress > 0) {
        document.documentElement.style.filter = `url(#scrolllab-wave-filter)`;
      } else {
        document.documentElement.style.filter = '';
      }
      waveRafRef.current = requestAnimationFrame(animate);
    };

    if (!waveRafRef.current) waveRafRef.current = requestAnimationFrame(animate);
  }, [getCfg, rampProgress]);

  // ---- Feature: Letter Twinkle ----
  const stopLetterTwinkle = useCallback(() => {
    if (twinkleIntervalRef.current) { clearInterval(twinkleIntervalRef.current); twinkleIntervalRef.current = null; }
    document.querySelectorAll('.scrolllab-dim').forEach(span => {
      const parent = span.parentElement;
      if (parent) {
        const textNode = document.createTextNode(span.textContent);
        parent.replaceChild(textNode, span);
        parent.normalize();
      }
    });
  }, []);

  const startLetterTwinkle = useCallback(() => {
    if (twinkleIntervalRef.current) return;

    const dimOnce = () => {
      const c = getCfg();
      if (!c.features.letterTwinkle || !pastInert()) return;
      const progress = rampProgress();
      if (progress === 0) return;

      const main = getMainElement();
      if (!main) return;

      const walker = document.createTreeWalker(
        main,
        NodeFilter.SHOW_TEXT,
        {
          acceptNode(node) {
            if (!node.textContent.trim()) return NodeFilter.FILTER_REJECT;
            const parent = node.parentElement;
            if (!parent) return NodeFilter.FILTER_REJECT;
            const tag = parent.tagName;
            if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'NOSCRIPT') return NodeFilter.FILTER_REJECT;
            if (parent.closest('nav')) return NodeFilter.FILTER_REJECT;
            const id = parent.closest('[id]')?.id || '';
            if (id.includes('scrolllab') || id.includes('guardian')) return NodeFilter.FILTER_REJECT;
            if (parent.classList?.contains('scrolllab-dim')) return NodeFilter.FILTER_REJECT;
            return NodeFilter.FILTER_ACCEPT;
          }
        }
      );
      const nodes = [];
      let n;
      while ((n = walker.nextNode()) && nodes.length < 500) nodes.push(n);
      if (nodes.length === 0) return;

      const count = Math.max(1, Math.round(progress * 12));
      for (let i = 0; i < count; i++) {
        const node = nodes[Math.floor(Math.random() * nodes.length)];
        const text = node.textContent;
        if (text.length < 3) continue;

        let offset = -1;
        for (let a = 0; a < 15; a++) {
          const idx = Math.floor(Math.random() * text.length);
          const ch = text[idx];
          if (ch !== ' ' && ch !== '\n' && ch !== '\t') { offset = idx; break; }
        }
        if (offset < 0) continue;

        const range = document.createRange();
        range.setStart(node, offset);
        range.setEnd(node, offset + 1);

        const span = document.createElement('span');
        span.className = 'scrolllab-dim';
        const r = Math.random();
        const opacity = r < 0.5 ? 0.73 : r < 0.8 ? 0.58 : 0.45;
        span.style.opacity = String(opacity);
        span.style.transition = 'opacity 0.15s ease-in';

        try {
          range.surroundContents(span);
        } catch { continue; }

        const restoreMs = 400 + Math.random() * 200;
        setTimeout(() => {
          if (!span.parentElement) return;
          span.style.transition = 'opacity 0.2s ease-out';
          span.style.opacity = '1';
          setTimeout(() => {
            if (!span.parentElement) return;
            const p = span.parentElement;
            const tn = document.createTextNode(span.textContent);
            p.replaceChild(tn, span);
            p.normalize();
          }, 220);
        }, restoreMs);
      }
    };

    twinkleIntervalRef.current = setInterval(dimOnce, 250);
  }, [getCfg, pastInert, rampProgress, getMainElement]);

  // ---- Feature: Word Count Observer ----
  const updateScrollCounter = useCallback(() => {
    // This is handled via React render
  }, []);

  const setupWordObserver = useCallback(() => {
    if (wordObserverRef.current) wordObserverRef.current.disconnect();
    wordObserverRef.current = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting && entry.boundingClientRect.bottom < 0) {
          if (!countedTextsRef.current.has(entry.target)) {
            const words = (entry.target.textContent || '')
              .trim().split(/\s+/).filter(w => w.length > 0).length;
            wordsReadRef.current += words;
            countedTextsRef.current.add(entry.target);
          }
        }
      });
    }, { threshold: 0 });
  }, []);

  const observeNewTextElements = useCallback(() => {
    if (!wordObserverRef.current) return;
    getTextElements().forEach(el => {
      if (!observedTextsRef.current.has(el)) {
        wordObserverRef.current.observe(el);
        observedTextsRef.current.add(el);
      }
    });
  }, [getTextElements]);

  // ---- Feature: Minute Tally ----
  const updateMinuteTally = useCallback(() => {
    const c = getCfg();
    if (!tallyMarksRef.current || !tallyProgressRef.current) return;
    if (!c.features.minuteTally || !sessionStartRef.current) return;

    const totalSec = Math.floor((Date.now() - sessionStartRef.current) / 1000);
    const completedMin = Math.min(Math.floor(totalSec / 60), 30);
    const secsInCurrentMin = totalSec % 60;

    while (lastCompletedMinuteRef.current < completedMin) {
      const mark = document.createElement('div');
      mark.style.cssText = 'height:2px;width:100%;background:rgba(255,255,255,0.2);border-radius:1px;flex-shrink:0;';
      tallyMarksRef.current.appendChild(mark);
      lastCompletedMinuteRef.current++;
    }

    tallyProgressRef.current.style.width = `${(secsInCurrentMin / 60) * 100}%`;
  }, [getCfg]);

  // ---- Apply config changes ----
  const applyConfigChanges = useCallback(() => {
    const c = getCfg();
    const anyFilter = c.features.blur || c.features.grayscale;
    if (!anyFilter) clearFilters();
    if (!c.features.contentPadding) clearContentPadding();
    if (!c.features.fontCycling) clearFontCycling();
    if (!c.features.breakCards) clearBreakCards();
    if (c.features.waveDistortion) startWaveDistortion();
    else stopWaveDistortion();
    if (c.features.letterTwinkle) startLetterTwinkle();
    else stopLetterTwinkle();
  }, [getCfg, clearFilters, clearContentPadding, clearFontCycling, clearBreakCards, startWaveDistortion, stopWaveDistortion, startLetterTwinkle, stopLetterTwinkle]);

  // ---- Tick function ----
  const tick = useCallback(() => {
    if (!sessionStartRef.current) return;
    updateContentPadding();
    updateFilters();
    checkFontCycle();
    updateBreakCards();
    updateMinuteTally();
    observeNewTextElements();
    rerender(); // update session display
  }, [updateContentPadding, updateFilters, checkFontCycle, updateBreakCards, updateMinuteTally, observeNewTextElements, rerender]);

  // ---- Draw ramp canvas visual ----
  const drawRampVisual = useCallback((sliderVal) => {
    const canvas = rampCanvasRef.current;
    if (!canvas) return;
    const wrap = canvas.parentElement;
    if (!wrap) return;

    const w = wrap.offsetWidth;
    const h = 12;
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);

    const thumbFrac = sliderVal / 20;
    const thumbHalf = 6;
    const thumbX = thumbHalf + thumbFrac * (w - thumbHalf * 2);

    // Gray triangle: ramp zone
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    if (thumbX > 0) {
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(thumbX, 0);
      ctx.lineTo(thumbX, h);
      ctx.closePath();
      ctx.fill();
    }

    // Gray rectangle: plateau
    if (thumbX < w) {
      ctx.fillRect(thumbX, 0, w - thumbX, h);
    }

    // Blue session progress
    const sf20 = sessionFraction20();
    const progressX = thumbHalf + sf20 * (w - thumbHalf * 2);

    ctx.fillStyle = 'rgba(29, 155, 240, 0.25)';
    if (progressX <= thumbX && thumbX > 0) {
      const progressH = (progressX / thumbX) * h;
      ctx.beginPath();
      ctx.moveTo(0, h);
      ctx.lineTo(progressX, h - progressH);
      ctx.lineTo(progressX, h);
      ctx.closePath();
      ctx.fill();
    } else {
      if (thumbX > 0) {
        ctx.beginPath();
        ctx.moveTo(0, h);
        ctx.lineTo(thumbX, 0);
        ctx.lineTo(thumbX, h);
        ctx.closePath();
        ctx.fill();
      }
      const rectEnd = Math.min(progressX, w);
      ctx.fillRect(thumbX, 0, rectEnd - thumbX, h);
    }

    // Thin vertical line at thumb
    if (thumbX > 0) {
      ctx.fillStyle = 'rgba(29, 155, 240, 0.5)';
      ctx.fillRect(Math.max(0, thumbX - 1), 0, 2, h);
    }
  }, [sessionFraction20]);

  // ---- Screensaver ----
  const renderWaveFrame = useCallback((ts) => {
    if (!screensaverElRef.current) return;
    if (ts - screensaverLastFrameRef.current < 1000 / 20) {
      screensaverRafRef.current = requestAnimationFrame(renderWaveFrame);
      return;
    }
    screensaverLastFrameRef.current = ts;
    const t = (ts - screensaverStartRef.current) / 1000;
    const cols = Math.floor(window.innerWidth / 8);
    const rows = Math.floor(window.innerHeight / 17);
    const lines = [];
    for (let y = 0; y < rows; y++) {
      let line = '';
      for (let x = 0; x < cols; x++) {
        const wave =
          Math.sin(x * 0.12 + y * 0.08 + t * 0.55) * 0.35 +
          Math.sin(x * 0.06 - y * 0.10 + t * 0.40) * 0.30 +
          Math.sin(x * 0.18 + y * 0.04 - t * 0.35) * 0.20 +
          Math.sin(x * 0.03 + y * 0.15 + t * 0.25) * 0.15;
        const idx = Math.min(Math.floor(((wave + 1) / 2) * WAVE_CHARS.length), WAVE_CHARS.length - 1);
        line += WAVE_CHARS[idx];
      }
      lines.push(line);
    }
    const pre = screensaverElRef.current.querySelector('pre');
    if (pre) pre.textContent = lines.join('\n');
    screensaverRafRef.current = requestAnimationFrame(renderWaveFrame);
  }, []);

  const activateScreensaver = useCallback(() => {
    setScreensaverActive(true);
  }, []);

  const deactivateScreensaver = useCallback(() => {
    if (screensaverRafRef.current) { cancelAnimationFrame(screensaverRafRef.current); screensaverRafRef.current = null; }
    screensaverElRef.current = null;
    setScreensaverActive(false);
  }, []);

  // Start screensaver animation when it becomes active
  useEffect(() => {
    if (screensaverActive && screensaverElRef.current) {
      screensaverStartRef.current = performance.now();
      screensaverLastFrameRef.current = 0;
      screensaverRafRef.current = requestAnimationFrame(renderWaveFrame);
    }
    return () => {
      if (screensaverRafRef.current) { cancelAnimationFrame(screensaverRafRef.current); screensaverRafRef.current = null; }
    };
  }, [screensaverActive, renderWaveFrame]);

  // ---- Reset session ----
  const resetSession = useCallback(() => {
    wordsReadRef.current = 0;
    lastFontCycleMsRef.current = 0;
    lastCompletedMinuteRef.current = 0;
    currentFontIdxRef.current = -1;
    breakCardIdxRef.current = 0;
    contentSinceLastBreakRef.current = 0;
    breakCardsInsertedRef.current = new WeakSet();
    observedTextsRef.current = new WeakSet();
    countedTextsRef.current = new WeakSet();
    paddedElementsRef.current = new Set();

    if (tallyMarksRef.current) tallyMarksRef.current.innerHTML = '';
    if (tallyProgressRef.current) tallyProgressRef.current.style.width = '0%';

    clearContentPadding();
    clearFontCycling();
    clearFilters();
    clearBreakCards();
    stopWaveDistortion();
    stopLetterTwinkle();
    deactivateScreensaver();

    sessionStartRef.current = Date.now();
    if (wordObserverRef.current) wordObserverRef.current.disconnect();
    setupWordObserver();

    rerender();
  }, [clearContentPadding, clearFontCycling, clearFilters, clearBreakCards, stopWaveDistortion, stopLetterTwinkle, deactivateScreensaver, setupWordObserver, rerender]);

  // ---- Select experiment ----
  const selectFeature = useCallback((key) => {
    updateCfg(c => {
      ALTERING_FEATURES.forEach(k => { c.features[k] = false; });
      if (key !== 'none') c.features[key] = true;
    });
    // Apply changes after config update
    setTimeout(() => applyConfigChanges(), 0);
  }, [updateCfg, applyConfigChanges]);

  // ---- Toggle passive feature ----
  const togglePassive = useCallback((key) => {
    updateCfg(c => {
      c.features[key] = !c.features[key];
    });
    setTimeout(() => applyConfigChanges(), 0);
  }, [updateCfg, applyConfigChanges]);

  // ---- Ramp slider change ----
  const handleRampChange = useCallback((val) => {
    updateCfg(c => {
      c.rampMinutes = val;
    });
    setTimeout(() => applyConfigChanges(), 0);
  }, [updateCfg, applyConfigChanges]);

  // ---- Keyboard handler (Ctrl+B) ----
  useEffect(() => {
    const handler = (e) => {
      if (e.ctrlKey && (e.key === 'b' || e.key === 'B')) {
        e.preventDefault();
        const c = getCfg();
        if (screensaverActive) {
          deactivateScreensaver();
        } else if (c.features.screensaver) {
          activateScreensaver();
        }
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [getCfg, screensaverActive, activateScreensaver, deactivateScreensaver]);

  // ---- Click outside to close panel ----
  useEffect(() => {
    if (!panelOpen) return;
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target) &&
          btnRef.current && !btnRef.current.contains(e.target)) {
        setPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handler, true);
    return () => document.removeEventListener('mousedown', handler, true);
  }, [panelOpen]);

  // ---- Inject styles on mount ----
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = SCROLLLAB_STYLES;
    style.id = 'scrolllab-injected-styles';
    document.head.appendChild(style);
    styleRef.current = style;
    return () => { if (style.parentElement) style.parentElement.removeChild(style); };
  }, []);

  // ---- Initialize session and main interval ----
  useEffect(() => {
    getCfg(); // ensure config loaded
    sessionStartRef.current = Date.now();
    setupWordObserver();
    applyConfigChanges();

    mainIntervalRef.current = setInterval(tick, 1000);

    return () => {
      if (mainIntervalRef.current) clearInterval(mainIntervalRef.current);
      if (wordObserverRef.current) wordObserverRef.current.disconnect();
      clearContentPadding();
      clearFontCycling();
      clearFilters();
      clearBreakCards();
      stopWaveDistortion();
      stopLetterTwinkle();
      deactivateScreensaver();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Draw ramp canvas when panel opens or config changes ----
  useEffect(() => {
    if (panelOpen) {
      requestAnimationFrame(() => drawRampVisual(getCfg().rampMinutes));
    }
  }, [panelOpen, drawRampVisual, getCfg]);

  // ---- Computed values for render ----
  const cfg = getCfg();
  const activeFeature = ALTERING_FEATURES.find(k => cfg.features[k]) || 'none';
  const elapsed = sessionStartRef.current ? Date.now() - sessionStartRef.current : 0;
  const durationSec = Math.floor(elapsed / 1000);
  const durationStr = `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`;
  const wordsStr = wordsReadRef.current >= 1000
    ? `${(wordsReadRef.current / 1000).toFixed(1)}k`
    : String(wordsReadRef.current);
  const rampLabel = cfg.rampMinutes === 0 ? 'Instant' : `${cfg.rampMinutes} min`;
  const pct = ((wordsReadRef.current / WAR_AND_PEACE_WORDS) * 100).toFixed(2);

  // ---- Inline styles ----
  const btnStyle = {
    position: 'fixed',
    top: 'clamp(2rem, 5vw, 4rem)',
    right: '28px',
    zIndex: 999999,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0',
    background: 'transparent',
    border: 'none',
    borderRadius: '0',
    cursor: 'pointer',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '14px',
    fontWeight: panelOpen ? 500 : 400,
    color: panelOpen ? 'var(--accent)' : 'var(--accent-muted)',
    letterSpacing: '0.01em',
    transition: 'color 0.15s',
    userSelect: 'none',
    whiteSpace: 'nowrap',
  };

  const panelStyle = {
    position: 'fixed',
    top: 'calc(clamp(2rem, 5vw, 4rem) + 28px)',
    right: '28px',
    zIndex: 999999,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg)',
    border: '0.5px solid var(--border-subtle)',
    borderRadius: '14px',
    boxShadow: 'rgba(0,0,0,0.15) 0px 8px 40px',
    overflow: 'hidden',
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: '13px',
    color: 'var(--text-primary)',
    userSelect: 'none',
    width: '280px',
    maxHeight: 'calc(100vh - 60px)',
    overflowY: 'auto',
  };

  const sectionStyle = {
    padding: '10px 14px',
    borderBottom: '1px solid var(--border-subtle)',
  };

  const sectionNoBorderStyle = {
    ...sectionStyle,
    borderBottom: 'none',
  };

  const sectionTitleStyle = {
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--text-secondary)',
    marginBottom: '8px',
  };

  const cardStyle = (isActive) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '9px',
    width: '100%',
    padding: '6px 8px',
    marginBottom: '3px',
    background: isActive ? 'var(--bg)' : 'var(--bg)',
    border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-subtle)'}`,
    borderRadius: '7px',
    cursor: 'pointer',
    textAlign: 'left',
    color: 'var(--text-primary)',
    transition: 'border-color 0.12s, background 0.12s',
    outline: 'none',
    fontFamily: 'inherit',
    fontSize: 'inherit',
  });

  const dotStyle = (isActive) => ({
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: isActive ? 'var(--accent)' : 'var(--border-subtle)',
    flexShrink: 0,
    transition: 'background 0.12s',
  });

  const toggleTrackStyle = (checked) => ({
    position: 'absolute',
    inset: 0,
    borderRadius: '18px',
    background: checked ? 'var(--accent)' : 'var(--border-subtle)',
    cursor: 'pointer',
    transition: 'background 0.18s',
  });

  const toggleKnobStyle = (checked) => ({
    content: '',
    position: 'absolute',
    top: '2px',
    left: '2px',
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: checked ? 'var(--bg)' : 'var(--text-secondary)',
    transition: 'transform 0.18s, background 0.18s',
    transform: checked ? 'translateX(14px)' : 'translateX(0)',
  });

  // ---- Tally widget styles ----
  const tallyRootStyle = {
    position: 'fixed',
    top: '80px',
    right: '14px',
    zIndex: 999998,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '6px',
    pointerEvents: 'none',
    fontFamily: "'Courier New', Courier, monospace",
  };

  const tallyStyle = {
    width: '56px',
    display: cfg.features.minuteTally ? 'flex' : 'none',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 0,
    pointerEvents: 'auto',
  };

  const scrollCounterStyle = {
    fontSize: '10px',
    lineHeight: 1.4,
    color: 'rgba(255,255,255,0.38)',
    background: 'rgba(0,0,0,0.65)',
    padding: '3px 7px',
    borderRadius: '3px',
    whiteSpace: 'normal',
    maxWidth: '120px',
    textAlign: 'right',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    letterSpacing: '0.02em',
    pointerEvents: 'auto',
    display: cfg.features.scrollCounter ? 'block' : 'none',
  };

  return (
    <>
      {/* Trigger button */}
      <button
        ref={btnRef}
        id="scrolllab-btn"
        style={btnStyle}
        onClick={() => setPanelOpen(o => !o)}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.opacity = '0.8'; }}
        onMouseLeave={(e) => {
          e.currentTarget.style.opacity = '1';
          if (!panelOpen) {
            e.currentTarget.style.color = 'var(--accent-muted)';
          }
        }}
        aria-label="UI Experiments"
      >
        UI Experiments
      </button>

      {/* Panel */}
      {panelOpen && (
        <div ref={panelRef} style={panelStyle} id="scrolllab-panel">
          {/* Feature picker */}
          <div style={{ ...sectionNoBorderStyle, paddingTop: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={sectionTitleStyle}>Pick an experiment</span>
              <button
                onClick={() => setPanelOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', padding: '2px 4px', borderRadius: '4px', lineHeight: 1 }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {'\u2715'}
              </button>
            </div>
            {PANEL_FEATURES.map(f => {
              const isActive = f.key === activeFeature;
              return (
                <button
                  key={f.key}
                  style={cardStyle(isActive)}
                  onClick={() => {
                    const wasActive = f.key === activeFeature;
                    selectFeature(wasActive ? 'none' : f.key);
                  }}
                  onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--accent-muted)'; } }}
                  onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border-subtle)'; } }}
                >
                  <span style={dotStyle(isActive)} />
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontSize: '12px', fontWeight: 500, lineHeight: 1.3 }}>{f.name}</span>
                    <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>{f.hint}</span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time to full effect */}
          <div style={sectionNoBorderStyle}>
            <div style={sectionTitleStyle}>Time to full effect</div>
            <div style={{ position: 'relative', height: '28px', margin: '8px 0 2px' }}>
              <canvas
                ref={rampCanvasRef}
                height={12}
                style={{ position: 'absolute', bottom: '8px', left: 0, width: '100%', height: '12px', pointerEvents: 'none', borderRadius: '2px' }}
              />
              <input
                type="range"
                min={0}
                max={20}
                step={1}
                defaultValue={cfg.rampMinutes}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  handleRampChange(val);
                }}
                onInput={(e) => {
                  drawRampVisual(parseInt(e.target.value, 10));
                }}
                style={{
                  position: 'absolute', width: '100%', top: 0, left: 0,
                  appearance: 'none', WebkitAppearance: 'none',
                  background: 'transparent', zIndex: 2, height: '28px',
                  margin: 0, padding: 0, cursor: 'pointer', outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>0 min</span>
              <span style={{ fontSize: '10px', color: 'var(--text-primary)' }}>{rampLabel}</span>
              <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>20 min</span>
            </div>
          </div>

          {/* Session */}
          <div style={{ ...sectionStyle, borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Session</span>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{durationStr}</span>
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px' }}>Words</span>
                <span style={{ display: 'block', fontSize: '13px', fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{wordsStr}</span>
              </div>
              <button
                onClick={resetSession}
                title="Reset session"
                style={{
                  padding: '4px 8px', background: 'transparent',
                  border: '1px solid var(--border-subtle)', borderRadius: '50%',
                  color: 'var(--text-secondary)', fontSize: '16px', cursor: 'pointer', lineHeight: 1,
                  transition: 'background 0.12s, border-color 0.12s, color 0.12s',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--accent-muted)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
              >
                {'\u21BA'}
              </button>
            </div>

            {/* Passive features collapsible */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '10px', paddingTop: '10px' }}>
              <div
                onClick={() => setPassiveOpen(o => !o)}
                style={{ ...sectionTitleStyle, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: 0 }}
              >
                Passive features
                <span style={{ fontSize: '8px', transition: 'transform 0.2s', display: 'inline-block', transform: passiveOpen ? 'rotate(90deg)' : 'rotate(0deg)' }}>{'\u25B6'}</span>
              </div>
              {passiveOpen && (
                <div style={{ marginTop: '8px' }}>
                  {/* Session Time */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span style={{ fontSize: '12px' }}>Session Time</span>
                    <label style={{ position: 'relative', width: '32px', height: '18px', flexShrink: 0, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={cfg.features.minuteTally}
                        onChange={() => togglePassive('minuteTally')}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                      <span style={toggleTrackStyle(cfg.features.minuteTally)}>
                        <span style={toggleKnobStyle(cfg.features.minuteTally)} />
                      </span>
                    </label>
                  </div>

                  {/* Take a Break */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', marginTop: '4px' }}>
                    <div>
                      <span style={{ fontSize: '12px', display: 'block' }}>Take a Break</span>
                      <span style={{ fontSize: '10px', color: 'var(--text-secondary)', display: 'block' }}>Ctrl+B - water animation</span>
                    </div>
                    <label style={{ position: 'relative', width: '32px', height: '18px', flexShrink: 0, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={cfg.features.screensaver}
                        onChange={() => togglePassive('screensaver')}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                      <span style={toggleTrackStyle(cfg.features.screensaver)}>
                        <span style={toggleKnobStyle(cfg.features.screensaver)} />
                      </span>
                    </label>
                  </div>

                  {/* Reading Distance */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '4px 0', marginTop: '4px' }}>
                    <span style={{ fontSize: '12px' }}>Reading Distance</span>
                    <label style={{ position: 'relative', width: '32px', height: '18px', flexShrink: 0, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={cfg.features.scrollCounter}
                        onChange={() => togglePassive('scrollCounter')}
                        style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
                      />
                      <span style={toggleTrackStyle(cfg.features.scrollCounter)}>
                        <span style={toggleKnobStyle(cfg.features.scrollCounter)} />
                      </span>
                    </label>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tally + Scroll Counter widget */}
      <div style={tallyRootStyle} id="scrolllab-widgets">
        <div style={scrollCounterStyle}>
          Reading distance:<br />{pct}% of War &amp; Peace
        </div>
        <div style={tallyStyle}>
          <div ref={tallyMarksRef} style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '4px' }} />
          <div
            ref={tallyProgressRef}
            style={{ height: '2px', width: '0%', background: 'rgba(255,255,255,0.2)', borderRadius: '1px', transition: 'width 0.8s linear' }}
          />
        </div>
      </div>

      {/* Screensaver overlay */}
      {screensaverActive && (
        <div
          id="scrolllab-screensaver"
          ref={(el) => { screensaverElRef.current = el; }}
          onClick={deactivateScreensaver}
        >
          <pre />
        </div>
      )}

      {/* Responsive + slider styling */}
      <style>{`
        @media (max-width: 960px) {
          #scrolllab-btn {
            position: fixed !important;
            top: calc(52px + clamp(1rem, 3.5vw, 2.25rem)) !important;
            right: 24px !important;
            font-size: 12px !important;
            border: 0.5px solid var(--border-subtle) !important;
            border-radius: 999px !important;
            padding: 4px 12px !important;
          }
          #scrolllab-panel {
            top: calc(52px + clamp(1rem, 3.5vw, 2.25rem) + 32px) !important;
            right: 24px !important;
            width: 260px !important;
          }
        }
        #scrolllab-panel input[type="range"]::-webkit-slider-runnable-track {
          height: 28px;
          background: transparent;
          cursor: pointer;
        }
        #scrolllab-panel input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 12px;
          height: 20px;
          background: var(--accent, #1d9bf0);
          border-radius: 3px;
          cursor: pointer;
          margin-top: 0;
        }
        #scrolllab-panel input[type="range"]::-moz-range-track {
          height: 28px;
          background: transparent;
          cursor: pointer;
        }
        #scrolllab-panel input[type="range"]::-moz-range-thumb {
          width: 12px;
          height: 20px;
          background: var(--accent, #1d9bf0);
          border-radius: 3px;
          cursor: pointer;
          border: none;
        }
        #scrolllab-panel button:last-child {
          margin-bottom: 0;
        }
      `}</style>
    </>
  );
}
