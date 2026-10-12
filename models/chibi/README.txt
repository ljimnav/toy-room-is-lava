ChibiHero - Pastel Anime Hero (Simple Game-Ready Character)
============================================================

A cute low-poly chibi hero in a soft pastel style, ready for simple 2.5D/3D games.
Rigged and animated with a looping idle. Drop-in ready for Unity, Godot, and more.

CONTENTS
--------
  ChibiHero.blend  - Editable Blender source (Blender 5.x)
  ChibiHero.glb    - glTF binary (recommended for Godot, web, Unity glTF)
  ChibiHero.fbx    - FBX with rig + animation (Unity, Unreal, Maya, etc.)
  preview_front.png / _threequarter.png / _side.png / _back.png - store previews

TECH SPECS
----------
  Meshes        : 6 parts (Head, Torso, 2 Arms, 2 Legs)
  Vertices      : ~3530
  Triangles     : ~6960
  Materials     : 10 solid pastel colors (Blush, EyeDark, EyeWhite, Hair, Material, Pants, Shirt, Shoes, Skin, Sparkle)
  Textures      : none (flat vertex/material colors - tiny footprint)
  Rig / Bones   : 7 bones (Root, Spine, Head, Arm_L, Arm_R, Leg_L, Leg_R)
  Animation     : 1 loop - "Idle" (48 frames @ 24 fps, gentle breathing)
  Scale         : ~2 m tall, real-world scale, +Z up, faces -Y (Blender default)

ANIMATIONS (5 clips, all exported to .glb and .fbx)
--------------------------------------------------
  Idle  - 48f, loop   : gentle breathing / weight shift
  Walk  - 24f, loop   : full walk cycle, arm counter-swing
  Run   - 16f, loop   : faster stride, forward lean
  Jump  - 44f, one-shot: crouch > launch > airborne > land > recover
  Wave  - 48f, loop   : friendly greeting with right arm

  In Unity/Godot each clip imports as a separate animation.
  Set Idle/Walk/Run/Wave to Loop; leave Jump as one-shot.

HOW TO USE
----------
  Godot 4 : Drag ChibiHero.glb into your project. The AnimationPlayer node
            will contain the "Idle" clip. Loop it on ready.
  Unity   : Import ChibiHero.fbx (or .glb via glTFast). Set Rig -> Humanoid or
            Generic. The Idle clip is on the imported clip list; set to Loop.
  Blender : Open ChibiHero.blend to edit colors, mesh, or add animations.

CUSTOMIZING COLORS
------------------
  Each body part uses its own material (Skin, Hair, Shirt, Pants, Shoes...).
  Change the Base Color in the Shading tab to reskin the character instantly.


EDITING IN BLENDER (for buyers)
-------------------------------
Open ChibiHero.blend in Blender (4.x / 5.x). Everything is named and tidy.

  Change colors : Click a part > Material tab > change Base Color.
  Reshape parts : Select a part (Head, Torso, Arm_L...) > Edit Mode (Tab).
  The rig       : "ChibiHero_Rig" armature, 7 bones (Root, Spine, Head,
                  Arm_L/R, Leg_L/R). Parts follow bones rigidly (clean,
                  no weight-painting needed).

ADD YOUR OWN ANIMATION
  1. Select ChibiHero_Rig > enter Pose Mode.
  2. Open the Animation workspace (top tabs) > in the Action Editor click
     "New" to make a new Action and name it (e.g. "Attack").
  3. Rotate/move bones (R / G) and press I to insert keyframes at each frame.
  4. That's it - your new Action exports automatically to .glb / .fbx.
  The 5 included clips (Idle/Walk/Run/Jump/Wave) are great starting templates:
  duplicate one and tweak it.

LICENSE
-------
You MAY:
  - Use this asset in personal AND commercial projects (games, videos, apps).
  - Modify, recolor, re-rig, or animate it however you like.

You MAY NOT:
  - Resell or redistribute the asset itself (the model / source files),
    as-is or as part of an asset pack.

Attribution is NOT required, but appreciated ("ChibiHero character asset").

(c) 2026 Mhd - all rights reserved except as stated above.

Created in Blender. Enjoy! :)
