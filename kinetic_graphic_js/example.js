/**
 * Example of using KineticGraphic in Processing 4.
 *
 * <p><pre>
 * Copyright (c) 2019 Data Driven Empathy LLC
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 * </pre></p>
 */


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
            fill(target.getIsHovering() ? "#1A6093" : "#1A6093");
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
