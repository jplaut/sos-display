# Sanctuary of Self Display UI

### Installation Steps

1. `git clone https://github.com/timkettering/sos-display.git` to the directory of your choice.
1. cd into cloned project
1. `npm install` to pull down deps
1. `npm start` to run instance. (usually at `http://localhost:8000`, but see console output)

### Development / Production Rotation Toggle

The toggle rotates the `<canvas>` 90-degrees for correct display when used in production with the LED wall.  

When programming with coordinates, assume that 0,0 on X,Y axis are at top left corner of a 192x320 rectangle.  X/Y does not change when the rotation is applied (it is now at bottom left corner with X going up vertically, and Y going horizionally).  But rather than concern yourself with rotation nuances, just don't worry about production mode.  If you code for dev, it'll work in prod orientation.

### angular-seed — the seed for AngularJS apps

This project is built on top of angular-seed.  Refer to their [page](https://github.com/angular/angular-seed) for more information about using it.
