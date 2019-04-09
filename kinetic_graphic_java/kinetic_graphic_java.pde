/**
 * Tiny Processing micro-library for graphics that need location seeking movement.
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
    private final float DEFAULT_MIN_SPEED = 10;
    private final float DEFAULT_MAX_SPEED = 1000;
    private final float DEFAULT_ACCELERATION = 700;
    private final float DEFAULT_SLOW_DOWN_RADIUS = 120;

    private PVector pos;
    private PVector targetPos;
    private boolean idling;
    private float speed;
    private boolean startedMovingToPos;
    private int lastMillis;
    private boolean hovering;

    private IdlingStrategy idlingStrategy;
    private DrawStrategy drawStrategy;
    private HoverListener hoverListener;
    private HoverDetector hoverDetector;

    private float minSpeed;
    private float maxSpeed;
    private float acceleration;
    private float slowDownRadius;

    /**
     * Create a new kinetic graphic.
     *
     * @param newPos The starting position of this graphic.
     * @param newDrawStrategy The strategy to use to draw this graphic.
     */
    KineticGraphic(PVector newPos, DrawStrategy newDrawStrategy) {
        setPos(newPos);

        targetPos = newPos;
        idling = true;
        speed = 0;
        startedMovingToPos = false;
        lastMillis = millis();
        hovering = false;

        minSpeed = DEFAULT_MIN_SPEED;
        maxSpeed = DEFAULT_MAX_SPEED;
        acceleration = DEFAULT_ACCELERATION;
        slowDownRadius = DEFAULT_SLOW_DOWN_RADIUS;

        idlingStrategy = null;
        hoverListener = null;
        hoverDetector = null;
        drawStrategy = newDrawStrategy;
    }

    /**
     * Set the minimum speed at which this graphic can travel.
     *
     * @param newMinSpeed The minium speed for this graphic pixels per second.
     */
    public void setMinSpeed(float newMinSpeed) {
        minSpeed = newMinSpeed;
    }

    /**
     * Set the maximum speed at which this graphic can travel.
     *
     * @param newMaxSpeed The max speed in pixels per second.
     */
    public void setMaxSpeed(float newMaxSpeed) {
        maxSpeed = newMaxSpeed;
    }

    /**
     * Set the maximum acceleration at which this graphic can travel.
     *
     * @param newAcceleration The max acceleration in pixels per second squared.
     */
    public void setAcceleration(float newAcceleration) {
        acceleration = newAcceleration;
    }

    /**
     * Indicate at how many pixels away from the target the graphic should start deaccelerating.
     *
     * @param newSlowDownRadius The distance at which the graphic should start deaccelerating.
     */
    public void setSlowDownRadius(float newSlowDownRadius) {
        slowDownRadius = newSlowDownRadius;
    }

    /**
     * Set the strategy to manipulate this graphic while it is not in transit.
     *
     * @param newIdlingStrategy The idling strategy to use for the "wait cycle" animation or null
     *    if no idling strategy should be used.
     */
    public void setIdlingStrategy(IdlingStrategy newIdlingStrategy) {
        idlingStrategy = newIdlingStrategy;
    }

    /**
     * Indicate that no idling strategy should be used.
     */
    public void clearIdlingStrategy() {
        setIdlingStrategy(null);
    }

    /**
     * Set the hover listener.
     *
     * Set the hover listener which is a strategy that will be informed when the user's cursor is
     * hovering over this graphic. Note that this will clear any prior provided hover listeners and
     * requires that a HoverDetector also be provided.
     *
     * @param newHoverListener Listener to inform when the user's cursor is hovering over this
     *    graphic. Pass null if no listener should be informed.
     */
    public void setHoverListener(HoverListener newHoverListener) {
        hoverListener = newHoverListener;
    }

    /**
     * Indicate that no hover listener should be used.
     */
    public void clearHoverListener() {
        setHoverListener(null);
    }

    /**
     * Set this graphic's {HoverDetector}.
     *
     * @param newHoverDetector The strategy to use to determine if the user is hovering over this
     *    graphic. Pass null if hover events should not be detected. Note that, if null, no
     *    {HoverListener}s will be informed of hovers.
     */
    public void setHoverDetector(HoverDetector newHoverDetector) {
        hoverDetector = newHoverDetector;
        if (newHoverDetector == null) {
            hovering = false;
        }
    }

    /**
     * Indicate that no hover events should be emitted.
     *
     * Indicate that no hover events should be emitted, meaning no calls to onHover will be
     * invoked even if a {HoverListener} is provided.
     */
    public void clearHoverDetector() {
        setHoverDetector(null);
    }

    /**
     * Set the current position of this graphic.
     *
     * @param newPos The new x, y position for this graphic.
     */
    public void setPos(PVector newPos) {
        pos = new PVector(newPos.x, newPos.y);
    }

    /**
     * Get the current position of this graphic.
     *
     * @return The x, y position of this graphic.
     */
    public PVector getPos() {
        return new PVector(pos.x, pos.y);
    }

    /**
     * Get the position to which this graphic should travel.
     *
     * @return The currently provided target position.
     */
    public PVector getTargetPos() {
        return targetPos;
    }

    /**
     * Specifiy to where this graphic should navigate.
     *
     * @param newPos The new x, y position to which this graphic should navigate.
     */
    public void goTo(PVector newPos) {
        idling = false;
        targetPos = newPos;
        startedMovingToPos = false;
    }

    /**
     * Have this graphic stop navigating, starting the idle loop if given.
     */
    public void stop() {
        goTo(getPos());
    }

    /**
     * Determine if the cursor is hovering over this graphic.
     *
     * @return True if the user's cursor is detected to be hovering over this graphic. False
     *    otherwise. This value's behavior is not defined if no {HoverDetector} has been provided.
     */
    public boolean getIsHovering() {
        return hovering;
    }

    /**
     * Update this graphic's position and internal state.
     *
     * Update this graphic's position and internal state, moving it closer to its target position
     * if it is in transit, determining if the user is hovering over the graphic if given a
     * {HoverDetector}, and updating this graphic if given an {IdlingStrategy}.
     */
    public void update() {
        update(mouseX - pos.x, mouseY - pos.y);
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
    public void update(float localMouseX, float localMouseY) {
        if (idlingStrategy != null && idling) {
            idlingStrategy.update(this);
        }

        if (!idling) {
            moveToTargetPos();
        }

        if (hoverDetector != null) {
          hovering = hoverDetector.isHovering(this, localMouseX, localMouseY);
          if (hovering && hoverListener != null) {
              hoverListener.onHover(this);
          }
        }
    }

    /**
     * Draw this graphic at its current position.
     */
    public void draw() {
        pushStyle();
        pushMatrix();

        translate(pos.x, pos.y);
        drawStrategy.draw(this);

        popStyle();
        popMatrix();
    }

    /**
     * Move towards the target position, changing speed if needed.
     */
    private void moveToTargetPos() {
        if (!startedMovingToPos) {
            startedMovingToPos = true;
            lastMillis = millis();
        }

        PVector diff = new PVector(targetPos.x, targetPos.y);
        diff.sub(pos);
        if (diff.mag() < 1) {
            idling = true;
            setPos(targetPos);
        }

        float secDiff = (millis() - lastMillis) / 1000.0;
        lastMillis = millis();

        speed += secDiff * acceleration;
        if (speed > maxSpeed) {
            speed = maxSpeed;
        }

        if (diff.mag() < 120) {
            speed = min(
                map(diff.mag(), slowDownRadius, 0, maxSpeed, minSpeed),
                speed
            );
        }

        float origMult = diff.mag();
        diff.normalize();
        diff.mult(min(speed * secDiff, origMult));
        pos.add(diff);
    }

};


/**
 * Strategy to update an "idling" {KineticGraphic}.
 *
 * <p>
 * Strategy to update a {KineticGraphic} while that graphic is not moving ("idling") to a target.
 * This can be used to implement a wait cycle animation for example. This can be provided to a
 * {KineticGraphic} by calling setIdlingStrategy.
 * </p>
 */
interface IdlingStrategy {

    /**
     * Update a graphic as part of the idling loop.
     *
     * @param target The graphic to update.
     */
    void update(KineticGraphic target);

}


/**
 * Strategy to call to draw the graphic.
 *
 * <p>
 * Strategy which actually draws the graphic and must be provided to {KineticGraphic}
 * at time of construction.
 * </p>
 */
interface DrawStrategy {

    /**
     * Draw this graphic.
     *
     * <p>
     * Draw this graphic with the understanding that translate(target.getPos().x, target.getPos.y)
     * will have been called prior to invoking this draw method. Note that pushStyle and pushMatrix
     * will be called prior to invoking this draw method. Also understand that popStyle and
     * popMatrix will be called after invoking this draw method.
     * </p>
     *
     * @param target The graphic to draw.
     */
    void draw(KineticGraphic target);

}


/**
 * Strategy that determines if the user is hovering over a {KineticGraphic}
 *
 * <p>
 * Strategy that determines if the user is hovering over a {KineticGraphic} that can be provided via
 * setHoverDetector.
 * </p>
 */
interface HoverDetector {

    /**
     * Determine if the user is hovering over this graphic.
     *
     * @param target The graphic to check.
     * @param mouseXRelative The cursor x coordinate relative to target's x position.
     * @param mouseXRelative The cursor x coordinate relative to target's y position.
     * @return True if the cursor is hovering over the graphic. False otherwise.
     */
    boolean isHovering(KineticGraphic target, float mouseXRelative,
        float mouseYRelative);

}


/**
 * Listener to call when the cursor is detected to be hovering over a graphic.
 *
 * <p>
 * Using a {HoverDetector}, listener to call when the cursor is detected to be hovering over a
 * graphic. This can be provided to a {KineticGraphic} by calling setHoverListener.
 * </p>
 */
interface HoverListener {

    /**
     * Method to call on hover detection.
     *
     * @param target The graphic on which the hover was detected.
     */
    void onHover(KineticGraphic target);

}
