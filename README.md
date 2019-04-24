KineticGraphic
====================================================================================================
Tiny Processing / P5.js micro-library for graphics that need location seeking. See it in action at https://editor.p5js.org/sampottinger/sketches/-xudjJQuF.

<br>
<br>

Purpose
----------------------------------------------------------------------------------------------------
Find yourself often needing to implement a graphic moving from one position to another in
Processing and P5? I sure do. KineticGraphic can help!

Derived from [Podcast Anthropology](https://www.podcastanthropology.com), this provides "commonly
needed" animation functionality as a micro-library, helping run graphics that have "kinetic"
movement. This allows one to have graphics that move from one location on the screen to another with
a nice quadratic movement pattern that feels natural along with an optional "idle" animation that
allows one to have the graphic do some small movements while not in transit to a new location.

More specifically, this micro-library aims to provide a pretty OK standard implementation of a
newtonian position seeking graphic for use in data visualization or other graphical application
development where one needs to have "things" move from one location on the screen to another in a 2D
space as demonstrated with the [Podcast Anthropology](https://www.podcastanthropology.com) project,
providing mouse hover support as well.

<br>
<br>

Usage
----------------------------------------------------------------------------------------------------
This is not a full library so simply provides a ".pde" (or ".js") file to be included in your
project. Note that this requires that the sketch be used in non-static mode (i.e. requires you to
have a "setup" and / or "draw" function defined in your sketch.

To get started, simply copy `kinetic_graphic_java/kinetic_graphic_java.pde` or
`kinetic_graphic_js/kinetic_graphic_js.js` into your sketch and start using the KineticGraphic
class. Note that This micro-library is a bit easier to use with Processing 4 since it introduces
lambda support. What is a lambda? Just like one can assign primitives like integers or instances of
a class to a variable, one can assign a function to a variable starting in Processing 4. Either way,
example code is available in the README.</p>

<br>
<br>

Examples
----------------------------------------------------------------------------------------------------
Below, we provide both an example in Processing 3 and Processing 4.

<br>

**Processing 3:** Processing 3 does not provide lambda support so requires creation of some classes
the "manual" way.

```
KineticGraphic example;


// Example implementation of DrawStrategy which renders a circle for our graphic
class CircleDrawStrategy implements DrawStrategy {

    void draw(KineticGraphic target) {
        ellipseMode(RADIUS);
        noStroke();
        fill(target.getIsHovering() ? #CC1A6093 : #551A6093);
        ellipse(0, 0, 10, 10);
    }

}


// Example implementation of a hover detector that checks for cursor being close to our graphic
class RadialHoverDetector implements HoverDetector {

    boolean isHovering(KineticGraphic target, float mouseXRelative, float mouseYRelative) {
        PVector distanceVec = new PVector(mouseXRelative, mouseYRelative);
        return distanceVec.mag() < 10;
    }

}


// Simple idling strategy that has the graphic "bounce" while not in transit
class BounceIdleStrategy implements IdlingStrategy {

    void update(KineticGraphic target) {
        PVector originalPos = target.getTargetPos();
        float offsetY = sin(millis()/200.0) * 10;
        PVector newPos = new PVector(originalPos.x, originalPos.y - offsetY);
        target.setPos(newPos);
    }

}


// Create the example graphic and setup the sketch
void setup() {
    smooth();
    size(200, 200, FX2D);

    example = new KineticGraphic(
        new PVector(0, 0),
        new CircleDrawStrategy()
    );
    example.setHoverDetector(new RadialHoverDetector());
    example.setIdlingStrategy(new BounceIdleStrategy());

    example.goTo(new PVector(100, 100));
}


// Draw the sketch
void draw() {
    background(#FFFFFF);
    example.update();
    example.draw();
}
```

<br>

**Processing 4:** Processing 4 does provide lambda support so is a bit more concise.

```
KineticGraphic example;

// Create the example graphic and setup the sketch
void setup() {
    smooth();
    size(200, 200, FX2D);

    example = new KineticGraphic(
        new PVector(0, 0),
        (target) -> {
            ellipseMode(RADIUS);
            noStroke();
            fill(target.getIsHovering() ? #CC1A6093 : #551A6093);
            ellipse(0, 0, 10, 10);
        }
    );

    example.setHoverDetector((KineticGraphic target, float mouseXRelative, float mouseYRelative) -> {
        PVector distanceVec = new PVector(mouseXRelative, mouseYRelative);
        return distanceVec.mag() < 10;
    });

    example.setIdlingStrategy((target) -> {
        PVector originalPos = target.getTargetPos();
        float offsetY = sin(millis()/200.0) * 10;
        PVector newPos = new PVector(originalPos.x, originalPos.y - offsetY);
        target.setPos(newPos);
    });

    example.goTo(new PVector(100, 100));
}


// Draw the sketch
void draw() {
    background(#FFFFFF);
    example.update();
    example.draw();
}
```

<br>

**P5.js:** This microlibrary is also available for P5 as demonstrated below:

```
var example;


// Create the example graphic and setup the sketch
function setup() {
    smooth();
    createCanvas(200, 200);

    example = new KineticGraphic(
        createVector(0, 0),
        function (target) {
            ellipseMode(RADIUS);
            noStroke();
            fill(target.getIsHovering() ? "#CC1A6093" : "#551A6093");
            ellipse(0, 0, 10, 10);
        }
    );

    example.setHoverDetector(function(target, mouseXRel, mouseYRel) {
        var distanceVec = createVector(mouseXRel, mouseYRel);
        return distanceVec.mag() < 10;
    });

    example.setIdlingStrategy(function(target) {
        var originalPos = target.getTargetPos();
        var offsetY = sin(millis()/200.0) * 10;
        var newPos = createVector(originalPos.x, originalPos.y - offsetY);
        target.setPos(newPos);
    });

    example.goTo(createVector(100, 100));
}


// Draw the sketch
function draw() {
    background("#FFFFFF");
    example.update();
    example.draw();
}
```

This P5 sketch is also at https://editor.p5js.org/sampottinger/sketches/-xudjJQuF. Note that, if using instance mode, one can provide the instance to the KineticGraphic constructor like so:

```
var example = new KineticGraphic(
    createVector(0, 0),
    function (target) {
        ellipseMode(RADIUS);
        noStroke();
        fill(target.getIsHovering() ? "#CC1A6093" : "#551A6093");
        ellipse(0, 0, 10, 10);
    },
    p5Instance
);
```

<br>
<br>

License
----------------------------------------------------------------------------------------------------
This was originally derived from <a href="https://www.podcastanthropology.com">Podcast
Anthropology</a> and is re-released under the MIT License.

```
Copyright (c) 2019 Data Driven Empathy LLC
Copyright (c) 2015-2018 Sam Pottinger

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
