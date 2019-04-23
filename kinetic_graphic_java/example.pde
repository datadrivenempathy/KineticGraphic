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
            fill(target.getIsHovering() ? #6BE24B : #63B3F5);
            ellipse(0, 0, 10, 10);
        }
    );

    example.setHoverDetector((KineticGraphic target, float mouseXRel, float mouseYRel) -> {
        PVector distanceVec = new PVector(mouseXRel, mouseYRel);
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
