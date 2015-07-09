# Sanctuary of Self Display UI

### Installation Steps

1. `git clone https://github.com/timkettering/sos-display.git` to the directory of your choice.
1. cd into cloned project
1. `npm install` to pull down deps
1. `npm start` to run instance. (usually at `http://localhost:8000`, but see console output)

### Development / Production Rotation Toggle

The toggle rotates the `<canvas>` 90-degrees for correct display when used in production with the LED wall.  

When programming with coordinates, assume that 0,0 on X,Y axis are at top left corner of a 192x320 rectangle.  X/Y does not change when the rotation is applied (it is now at bottom left corner with X going up vertically, and Y going horizionally).  But rather than concern yourself with rotation nuances, just don't worry about production mode.  If you code for dev, it'll work in prod orientation.

### LED Wall Technical Details.

LED wall is composed of (30) 64x32 LED matrices.  They are laid out long-side going vertical.  So there are (6) panels horiziontal and (5) panels vertical.  There are 61,440 individual LEDs.  

Full RGB color.  When plugged in to a computer via HDMI, it will not display the entire screen, but rather it will display a 320x192 sub-section of the HDMI output.

#### The Confusing Part  (Nitty Gritty Details)

320x192 you ask?  Isn't it 192x320?   This is the confusing part, mostly dictated by hardware limitations.  The hardware controller can only support up to 8 channels, and the primary design of those LED matrices are to build large widescreen displays.  We have built a tall but narrow display.   If we were to lay out the panels in correct orientation (long side going left to right), we would have needed to do 10 panels high, 3 panels wide, but we could only go up to 8 channels due to the hardware card.  So the display is rotated 90 degrees, with 6 channels (lines) going from the top to bottom.

So on the source display for the HDMI, it is capturing a 320x192 section, and then displaying it rotated 90 degrees on the LED wall.  So when doing development on the `<canvas>` in dev mode, it is shown in a vertical manner which makes it easier to see how it "should" appear on the LED wall.  Then when actually hooked up to the wall, the source is rotated -90 degrees and then again rotated back 90 degrees in the translation to the wall.

### Other Hardware Details

* Panels are 64x32 SMD RGB panels with 6mm pixel pitch, easily sourced from Adafruit, or with a bit more trouble, can be sourced from China via Alibaba.  This is far more economical with large orders, panels can be up to 3x cheaper, but shipping is not cheap.

* Linsn Hardware controller with HDMI input.

* With an estimated max draw of 36W per panel, the entire display in theory would draw at most 1080 watts when displaying full-white at 100% brightness.  (Add in Kill-a-Watt analysis after Saturday)

### angular-seed — the seed for AngularJS apps

This project is built on top of angular-seed.  Refer to their [page](https://github.com/angular/angular-seed) for more information about using it.
