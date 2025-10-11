/**
 * Candlestick Chart Lifecycle Manager
 * Manages chart state transitions: CREATED → INITIALIZED → RENDERED → DESTROYED
 */

import { logger } from './candlestick-logger.js';

/**
 * Chart lifecycle states
 */
export const ChartState = {
    CREATED: 'created',           // Constructor called
    INITIALIZING: 'initializing', // Initialize() called
    INITIALIZED: 'initialized',   // Data loaded, validated
    RENDERING: 'rendering',       // Render in progress
    RENDERED: 'rendered',         // Chart displayed
    UPDATING: 'updating',         // Update in progress
    DESTROYING: 'destroying',     // Cleanup in progress
    DESTROYED: 'destroyed',       // Chart removed
    ERROR: 'error'                // Something went wrong
};

/**
 * Valid state transitions
 */
const VALID_TRANSITIONS = {
    [ChartState.CREATED]: [ChartState.INITIALIZING, ChartState.DESTROYED],
    [ChartState.INITIALIZING]: [ChartState.INITIALIZED, ChartState.ERROR, ChartState.DESTROYED],
    [ChartState.INITIALIZED]: [ChartState.RENDERING, ChartState.INITIALIZING, ChartState.DESTROYED],
    [ChartState.RENDERING]: [ChartState.RENDERED, ChartState.ERROR, ChartState.DESTROYED],
    [ChartState.RENDERED]: [ChartState.UPDATING, ChartState.DESTROYING, ChartState.INITIALIZING],
    [ChartState.UPDATING]: [ChartState.RENDERED, ChartState.ERROR],
    [ChartState.DESTROYING]: [ChartState.DESTROYED],
    [ChartState.DESTROYED]: [ChartState.INITIALIZING], // Can be re-initialized
    [ChartState.ERROR]: [ChartState.INITIALIZING, ChartState.DESTROYING, ChartState.DESTROYED]
};

/**
 * Lifecycle Manager Class
 * Generic lifecycle manager - NO DOM dependencies
 */
export class LifecycleManager {
    constructor(componentId = 'Chart') {
        this.componentId = componentId;  // Generic identifier (not DOM-specific)
        this.state = ChartState.CREATED;
        this.stateHistory = [ChartState.CREATED];
        this.errorMessage = null;
        this.initializationTime = null;
        this.renderTime = null;
        this.eventHooks = new Map(); // For performance monitoring
    }

    /**
     * Get current state
     */
    getState() {
        return this.state;
    }

    /**
     * Check if state is valid for an action
     */
    isState(state) {
        return this.state === state;
    }

    /**
     * Check if chart is ready to render
     */
    isReadyToRender() {
        return this.state === ChartState.INITIALIZED || this.state === ChartState.RENDERED;
    }

    /**
     * Check if chart is rendered
     */
    isRendered() {
        return this.state === ChartState.RENDERED;
    }

    /**
     * Check if chart is in error state
     */
    hasError() {
        return this.state === ChartState.ERROR;
    }

    /**
     * Check if chart is destroyed
     */
    isDestroyed() {
        return this.state === ChartState.DESTROYED;
    }

    /**
     * Transition to a new state with validation
     */
    transitionTo(newState, context = null) {
        const validTransitions = VALID_TRANSITIONS[this.state] || [];

        if (!validTransitions.includes(newState)) {
            logger.error(`Invalid state transition: ${this.state} → ${newState}`, {
                componentId: this.componentId,
                validTransitions,
                context
            });
            this.transitionTo(ChartState.ERROR, {
                reason: 'Invalid state transition',
                from: this.state,
                to: newState
            });
            return false;
        }

        const oldState = this.state;
        this.state = newState;
        this.stateHistory.push(newState);

        logger.lifecycle(`State transition: ${oldState} → ${newState}`, {
            componentId: this.componentId,
            context
        });

        // Emit transition event
        this._emit(`transition:${newState}`, {
            from: oldState,
            to: newState,
            context
        });

        // Track timing
        if (newState === ChartState.INITIALIZED) {
            this.initializationTime = Date.now();
            this._emit('init:complete', this.initializationTime);
            
        } else if (newState === ChartState.RENDERED) {
            this.renderTime = Date.now();
            
            if (this.initializationTime) {
                const duration = this.renderTime - this.initializationTime;
                logger.performance('Chart initialization → render', duration);
                
                // Emit render complete with duration
                this._emit('render:complete', duration);
            }
        } else if (newState === ChartState.DESTROYED) {
            this._emit('destroy:complete', Date.now());
        }

        return true;
    }

    /**
     * Set error state with message
     */
    setError(errorMessage, error = null) {
        this.errorMessage = errorMessage;
        
        logger.error(`Chart entered error state: ${errorMessage}`, {
            componentId: this.componentId,
            currentState: this.state,
            error
        });

        this.transitionTo(ChartState.ERROR, {
            message: errorMessage,
            error
        });
        
        // Emit error event
        this._emit('error', { message: errorMessage, error });
    }

    /**
     * Get error message
     */
    getErrorMessage() {
        return this.errorMessage;
    }

    /**
     * Clear error and allow retry
     */
    clearError() {
        if (this.state === ChartState.ERROR) {
            this.errorMessage = null;
            logger.info('Error cleared, ready for retry', {
                componentId: this.componentId
            });
        }
    }

    /**
     * Register an event hook for lifecycle events
     * @param {string} eventName - Event name (e.g., 'render:complete', 'init:start')
     * @param {Function} callback - Callback function
     * 
     * Example:
     *   lifecycle.on('render:complete', (duration) => {
     *       metricsCollector.record('candlestick_render_time', duration);
     *   });
     */
    on(eventName, callback) {
        if (!this.eventHooks.has(eventName)) {
            this.eventHooks.set(eventName, []);
        }
        this.eventHooks.get(eventName).push(callback);
    }

    /**
     * Emit an event to all registered hooks
     * @private
     */
    _emit(eventName, data = null) {
        const hooks = this.eventHooks.get(eventName);
        if (hooks) {
            hooks.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    logger.error(`Hook error for ${eventName}`, error);
                }
            });
        }
    }

    /**
     * Get lifecycle summary (for debugging)
     */
    getSummary() {
        const totalDuration = this.renderTime && this.initializationTime 
            ? this.renderTime - this.initializationTime 
            : null;

        return {
            componentId: this.componentId,
            currentState: this.state,
            stateHistory: this.stateHistory,
            errorMessage: this.errorMessage,
            initializationTime: this.initializationTime,
            renderTime: this.renderTime,
            totalDuration,
            totalStates: this.stateHistory.length,
            hasHooks: this.eventHooks.size > 0
        };
    }

    /**
     * Reset lifecycle to initial state
     */
    reset() {
        logger.lifecycle('Lifecycle reset', { componentId: this.componentId });
        
        this.state = ChartState.CREATED;
        this.stateHistory = [ChartState.CREATED];
        this.errorMessage = null;
        this.initializationTime = null;
        this.renderTime = null;
        // Keep event hooks registered
    }
}

