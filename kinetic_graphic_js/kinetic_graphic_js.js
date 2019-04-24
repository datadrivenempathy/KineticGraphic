/**
 * Tiny P5 micro-library for graphics that need location seeking movement.
 *
 * Copyright (c) 2019 Data Driven Empathy LLC
 * Copyright (c) 2015-2018 Sam Pottinger
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
 */


/**
 * The graphic template provided by this library.
 */
class KineticGraphic {

    /**
     * Create a new kinetic graphic.
     *
     * @param newPos The starting position of this graphic.
     * @param newDrawStrategy The strategy to use to draw this graphic.
     * @param p5Instance The p5 instance to use. Optional parameter defaults to null. If null, will
     *      use globals.
     */
    constructor(newPos, newDrawStrategy, p5Instance) {
        var self = this;

        if (p5Instance === undefined || p5Instance === null) {
            p5Instance = new FakeP5();
        } else {
            p5Instance = new DecoratedP5(p5Instance);
        }

        self.__p5Instance = p5Instance;

        self.setPos(newPos);

        self.__targetPos = newPos;
        self.__idling = true;
        self.__speed = 0;
        self.__startedMovingToPos = false;
        self.__lastMillis = self.__p5Instance.millis();
        self.__hovering = false;

        self.__minSpeed = 10;
        self.__maxSpeed = 1000;
        self.__acceleration = 700;
        self.__slowDownRadius = 120;

        self.__idlingStrategy = null;
        self.__hoverListener = null;
        self.__hoverDetector = null;
        self.__drawStrategy = newDrawStrategy;
    }

    /**
     * Set the minimum speed at which this graphic can travel.
     *
     * @param newMinSpeed The minium _speed for this graphic pixels per second.
     */
    setMinSpeed(newMinSpeed) {
        var self = this;
        self.__minSpeed = newMinSpeed;
    }

    /**
     * Set the maximum speed at which this graphic can travel.
     *
     * @param newMaxSpeed The max speed in pixels per second.
     */
    setMaxSpeed(newMaxSpeed) {
        var self = this;
        self.__maxSpeed = newMaxSpeed;
    }

    /**
     * Set the maximum acceleration at which this graphic can travel.
     *
     * @param newAcceleration The max acceleration in pixels per second squared.
     */
    setAcceleration(newAcceleration) {
        var self = this;
        self.__acceleration = newAcceleration;
    }

    /**
     * Indicate at how many pixels away from the target the graphic should start deaccelerating.
     *
     * @param newSlowDownRadius The distance at which the graphic should start deaccelerating.
     */
    setSlowDownRadius(newSlowDownRadius) {
        var self = this;
        self.__slowDownRadius = newSlowDownRadius;
    }

    /**
     * Set the strategy to manipulate this graphic while it is not in transit.
     *
     * @param newIdlingStrategy The idling strategy to use for the "wait cycle" animation or null
     *    if no self.__idling strategy should be used.
     */
    setIdlingStrategy(newIdlingStrategy) {
        var self = this;
        self.__idlingStrategy = newIdlingStrategy;
    }

    /**
     * Indicate that no self.__idling strategy should be used.
     */
    clearIdlingStrategy() {
        var self = this;
        self.setIdlingStrategy(null);
    }

    /**
     * Set the hover listener.
     *
     * Set the hover listener which is a strategy that will be informed when the user's cursor is
     * hovering over this graphic. Note that this will clear any prior provided hover listeners and
     * requires that a hoverDetector also be provided.
     *
     * @param newHoverListener Listener to inform when the user's cursor is hovering over this
     *    graphic. Pass null if no listener should be informed.
     */
    setHoverListener(newHoverListener) {
        var self = this;
        self.__hoverListener = newHoverListener;
    }

    /**
     * Indicate that no hover listener should be used.
     */
    clearHoverListener() {
        var self = this;
        self.setHoverListener(null);
    }

    /**
     * Set this graphic's {HoverDetector}.
     *
     * @param newHoverDetector The strategy to use to determine if the user is hovering over this
     *    graphic. Pass null if hover events should not be detected. Note that, if null, no
     *    {HoverListener}s will be informed of hovers.
     */
    setHoverDetector(newHoverDetector) {
        var self = this;
        self.__hoverDetector = newHoverDetector;
        if (newHoverDetector === null) {
            self.__hovering = false;
        }
    }

    /**
     * Indicate that no hover events should be emitted.
     *
     * Indicate that no hover events should be emitted, meaning no calls to onHover will be
     * invoked even if a {HoverListener} is provided.
     */
    clearHoverDetector() {
        var self = this;
        self.setHoverDetector(null);
    }

    /**
     * Set the current position of this graphic.
     *
     * @param newPos The new x, y position for this graphic.
     */
    setPos(newPos) {
        var self = this;
        self.__pos = self.__p5Instance.createVector(newPos.x, newPos.y);
    }

    /**
     * Get the current position of this graphic.
     *
     * @return The x, y position of this graphic.
     */
    getPos() {
        var self = this;
        return self.__p5Instance.createVector(self.__pos.x, self.__pos.y);
    }

    /**
     * Get the position to which this graphic should travel.
     *
     * @return The currently provided target position.
     */
    getTargetPos() {
        var self = this;
        return self.__targetPos;
    }

    /**
     * Specifiy to where this graphic should navigate.
     *
     * @param newPos The new x, y position to which this graphic should navigate.
     */
    goTo(newPos) {
        var self = this;
        self.__idling = false;
        self.__targetPos = newPos;
        self.__startedMovingToPos = false;
    }

    /**
     * Have this graphic stop navigating, starting the idle loop if given.
     */
    stop() {
        var self = this;
        goTo(getPos());
    }

    /**
     * Determine if the cursor is hovering over this graphic.
     *
     * @return True if the user's cursor is detected to be hovering over this graphic. False
     *    otherwise. This value's behavior is not defined if no {HoverDetector} has been provided.
     */
    getIsHovering() {
        var self = this;
        return self.__hovering;
    }

    /**
     * Determine if this graphic is "idling".
     *
     * @return True if idling (not currently in transit to a new location) and false otherwise (
     *      in transit to a new location).
     */
    getIsIdling() {
        var self = this;
        return self.__idling;
    }

    /**
     * Update this graphic's position and internal state.
     *
     * Update this graphic's position and internal state, moving it closer to its target position
     * if it is in transit, determining if the user is hovering over the graphic if given a
     * {HoverDetector}, and updating this graphic if given an {IdlingStrategy}.
     */
    update() {
        var self = this;
        this.updateWithMousePos(
            self.__p5Instance.getMouseX() - self.__pos.x,
            self.__p5Instance.getMouseY() - self.__pos.y
        );
    }

    /**
     * Update this graphic's position and internal state.
     *
     * Update this graphic's position and internal state, moving it closer to its target position
     * if it is in transit, determining if the user is hovering over the graphic if given a
     * {HoverDetector}, and updating this graphic if given an {IdlingStrategy}.
     *
     * @param localMouseX The position of the user's cursor relative to this graphic's current
     *    x position.
     * @param localMouseX The position of the user's cursor relative to this graphic's current
     *    y position.
     */
    updateWithMousePos(localMouseX, localMouseY) {
        var self = this;

        if (self.__idlingStrategy !== null && self.__idling) {
            self.__idlingStrategy(self);
        }

        if (!self.__idling) {
            self.moveToTargetPos();
        }

        if (self.__hoverDector !== null) {
            self.__hovering = self.__hoverDetector(this, localMouseX, localMouseY);
            if (self.__hovering && self.__hoverListener != null) {
                self.__hoverListener(self);
            }
        }
    }

    /**
     * Draw this graphic at its current position.
     */
    draw() {
        var self = this;
        self.__p5Instance.push();

        self.__p5Instance.translate(self.__pos.x, self.__pos.y);
        self.__drawStrategy(self);

        self.__p5Instance.pop();
    }

    /**
     * Move towards the target position, changing speed if needed.
     */
    moveToTargetPos() {
        var self = this;

        if (!self.__startedMovingToPos) {
            self.__startedMovingToPos = true;
            self.__lastMillis = self.__p5Instance.millis();
        }

        var diff = self.__p5Instance.createVector(self.__targetPos.x, self.__targetPos.y);
        diff.sub(self.__pos);
        if (diff.mag() < 1) {
            self.__idling = true;
            self.setPos(self.__targetPos);
        }

        var secDiff = (self.__p5Instance.millis() - self.__lastMillis) / 1000.0;
        self.__lastMillis = self.__p5Instance.millis();

        self.__speed += secDiff * self.__acceleration;
        if (self.__speed > self.__maxSpeed) {
            self.__speed = self.__maxSpeed;
        }

        if (diff.mag() < 120) {
            self.__speed = self.__p5Instance.min(
                self.__p5Instance.map(
                    diff.mag(),
                    self.__slowDownRadius,
                    0,
                    self.__maxSpeed,
                    self.__minSpeed
                ),
                self.__speed
            );
        }

        var origMult = diff.mag();
        diff.normalize();
        diff.mult(self.__p5Instance.min(self.__speed * secDiff, origMult));
        self.__pos.add(diff);
    }

}


/**
 * Fake p5 isntance that relays calls to global.
 */
class FakeP5 {

    /**
     * Get the milliseconds since sketch start.
     *
     * @return Milliseconds since sketch start.
     */
    millis() {
        return millis();
    }

    /**
     * Create a new p5.Vector.
     *
     * @param x Horizontal coordinate in pixels.
     * @param y Vertical coordinate in pixels.
     * @return Newly created vector.
     */
    createVector(x, y) {
        return createVector(x, y);
    }

    /**
     * Get the x position of the cursor.
     *
     * @return Horizontal position of the cursor in pixels.
     */
    getMouseX() {
        return mouseX;
    }

    /**
     * Get the y position of the cursor.
     *
     * @return Vertical position of the cursor in pixels.
     */
    getMouseY() {
        return mouseY;
    }

    /**
     * Save the current style and matrix to the stack.
     */
    push() {
        push();
    }

    /**
     * Pop to the next previously saved style / matrix on the stack.
     */
    pop() {
        pop();
    }

    /**
     * Update the positional matrix.
     *
     * @param x The amount of pixels to offset in the horizontal direction.
     * @param y The amount of pixels to offset in the vertical direction.
     */
    translate(x, y) {
        translate(x, y);
    }

    /**
     * Return the minimum of two numbers.
     *
     * @param value1 The first value to include in the min operation.
     * @param value2 The second value to include in the min operation.
     * @return The miniumum of value1 and value2.
     */
    min(value1, value2) {
        return min(value1, value2);
    }

    /**
     * Linearly interpolate a value.
     *
     * @param value The input into the linear interpolation.
     * @param domainMin The miniumum value allowed into the linear interpolation.
     * @param domainMax The maxiumum value allowed into the linear interpolation.
     * @param rangeMin The minimum value allowed out of the linear interpolation.
     * @param rangeMax The maximum value allowed out of the linear interpolation.
     * @return The value after interpolation.
     */
    map(value, domainMin, domainMax, rangeMin, rangeMax) {
        return map(value, domainMin, domainMax, rangeMin, rangeMax);
    }

    /**
     * Get the horizatonal position of the cursor.
     *
     * @return The x coordiante of the cursor.
     */
    getMouseX() {
        return mouseX;
    }

    /**
     * Get the vertical position of the cursor.
     *
     * @return The y coordinate of the cursor.
     */
    getMouseY() {
        return mouseY;
    }

}


/**
 * Decorator around p5 when running in instance mode.
 */
class DecoratedP5 {

    constructor(innerP5) {
        var self = this;
        self.__innerP5 = innerP5;
    }

    /**
     * Get the milliseconds since sketch start.
     *
     * @return Milliseconds since sketch start.
     */
    millis() {
        var self = this;
        return self.__innerP5.millis();
    }

    /**
     * Create a new p5.Vector.
     *
     * @param x Horizontal coordinate in pixels.
     * @param y Vertical coordinate in pixels.
     * @return Newly created vector.
     */
    createVector(x, y) {
        var self = this;
        return self.__innerP5.createVector(x, y);
    }

    /**
     * Get the x position of the cursor.
     *
     * @return Horizontal position of the cursor in pixels.
     */
    getMouseX() {
        var self = this;
        return self.__innerP5.mouseX;
    }

    /**
     * Get the y position of the cursor.
     *
     * @return Vertical position of the cursor in pixels.
     */
    getMouseY() {
        var self = this;
        return self.__innerP5.mouseY;
    }

    /**
     * Save the current style and matrix to the stack.
     */
    push() {
        var self = this;
        self.__innerP5.push();
    }

    /**
     * Pop to the next previously saved style / matrix on the stack.
     */
    pop() {
        var self = this;
        self.__innerP5.pop();
    }

    /**
     * Update the positional matrix.
     *
     * @param x The amount of pixels to offset in the horizontal direction.
     * @param y The amount of pixels to offset in the vertical direction.
     */
    translate(x, y) {
        var self = this;
        self.__innerP5.translate(x, y);
    }

    /**
     * Return the minimum of two numbers.
     *
     * @param value1 The first value to include in the min operation.
     * @param value2 The second value to include in the min operation.
     * @return The miniumum of value1 and value2.
     */
    min(value1, value2) {
        var self = this;
        return self.__innerP5.min(value1, value2);
    }

    /**
     * Linearly interpolate a value.
     *
     * @param value The input into the linear interpolation.
     * @param domainMin The miniumum value allowed into the linear interpolation.
     * @param domainMax The maxiumum value allowed into the linear interpolation.
     * @param rangeMin The minimum value allowed out of the linear interpolation.
     * @param rangeMax The maximum value allowed out of the linear interpolation.
     * @return The value after interpolation.
     */
    map(value, domainMin, domainMax, rangeMin, rangeMax) {
        var self = this;
        return self.__innerP5.map(value, domainMin, domainMax, rangeMin, rangeMax);
    }

}
