/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import { LitElement, html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';


export type Interval = {
    name: string;
    interval: string;
}

export type IntervalTemplate = {
    name: string;
    intervals: Interval[];
}

/**
 * An example element.
 *
 * @fires count-changed - Indicates when the count changes
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('jshsj-timer')
export class JSHSJTimer extends LitElement {
    static override styles = css`
      :host {
        --jshsj-color-text-1-default: #343a40;
        --jshsj-color-text-2-default: #495057;
        --jshsj-color-accent-default: #e64980;
        --jshsj-color-surface-1-default: #f8f9fa;
        --jshsj-color-surface-2-default: #dee2e6;
        
        
        --jshsj-button-size-default: 2.5em;
        --jshsj-element-padding-inline-default: 1em;
        --jshsj-element-padding-block-default: 0.25em;
        
        
        color: var(--jshsj-color-text-1, var(--jshsj-color-text-1-default));
        background: var(--jshsj-color-surface-1, var(--jshsj-color-surface-1-default));
        display: grid;
        grid-template:  
            "header header header" auto
            "timer timer timer" auto
            ". . notification" auto / 1fr 1fr auto;
        gap: calc(var(--jshsj-element-padding-block, var(--jshsj-element-padding-block-default)) * 4);
      }
      
      button {
        min-height: var(--jshsj-button-size, var(--jshsj-button-size-default));
        padding-inline: var(--jshsj-element-padding-inline, var(--jshsj-element-padding-inline-default));
        color: var(--jshsj-color-text-1, var(--jshsj-color-text-1-default));
        user-select: none;
        background: var(--jshsj-color-surface-2, var(--jshsj-color-surface-2-default));
        border: 1px solid var(--jshsj-color-text-2, var(--jshsj-color-text-2-default));
        display: flex;
        gap: calc(var(--jshsj-element-padding-inline, var(--jshsj-element-padding-inline-default)) / 2);
        align-items: center;
        justify-content: center;
        font-size: 1rem;
      }
      
      svg {
        width: 2em;
        height: 2em;
        display: block;
        color: var(--jshsj-color-text-1, var(--jshsj-color-text-1-default));
      }
      
      fieldset {
        display: grid;
        border: none;
        grid-area: header;
        padding: 0;
      }
      
      fieldset > div {
        display: flex;
        flex-direction: column;
        gap: var(--jshsj-element-padding-block, var(--jshsj-element-padding-block-default));
      }
      
      [part="timer"] {
        grid-area: timer;
        display: grid;
        grid-template: 
           "headline" auto
            "time" 3rem
            "action" auto / 1fr;
        gap: var(--jshsj-element-padding-inline, var(--jshsj-element-padding-inline-default));
      }
      
      [part="timer"] > h2 {
        grid-area: headline;
        place-self: center;
        margin: 0;
      }

      [part="main-button"] {
        grid-area: action;
      }
      
      time  { 
        grid-area: time;
        place-self: center;
        font-size: 3rem;
        font-family: monospace;
      }
      
      time > span{
        padding: calc(var(--jshsj-element-padding-inline, var(--jshsj-element-padding-inline-default)) / 8) 
        calc(var(--jshsj-element-padding-inline, var(--jshsj-element-padding-inline-default)) / 4);
      }
      
      [part="notification-button"] {
        grid-area: notification;
      }
      
    `;

    /**
     * The number of minutes remaining
     */
    @property({type: Number})
    minutes = 5;

    /**
     * The number of seconds remaining
     */
    @property({type: Number})
    seconds = 0;

    /**
     * Internal minutes count.
     * @private
     */
    @state()
    private _minutes = 0;

    /**
     * Internal seconds count.
     * @private
     */
    @state()
    private _seconds = 0;

    /**
     * Internal timer handle.
     * @private
     */
    @state()
    private _timer: number | undefined = undefined;

    /**
     * Is timer paused.
     * @private
     */
    @state()
    private _isTimerPaused = true;

    @property({type: Boolean, reflect: false})
    get _isTimerDone() {
        return this._seconds === 0 && this._minutes === 0;
    }

    @property({type: Boolean, reflect: false})
    get _isTemplateDone() {
        return this._isTimerDone && !this._hasMoreIntervals;
    }

    @property({type: Number, reflect: false})
    get _isTimerInitial() {
        return this._seconds === this.seconds
            && this._minutes === this.minutes
            && this._isTimerPaused
    }


    @property({type: String, reflect: false})
    get _timerButtonText() {
        if (this._isTimerInitial) {
            return "Start";
        }

        // Timer done
        if (this._isTimerDone) {
            return "Restart Template"
        }

        // Timer is running or paused
        if (this._isTimerPaused) {
            return "Resume"
        }

        return "Pause";
    }

    @property({type: Array})
    availableTemplates: IntervalTemplate[] = [
        {
            name: "52 / 17",
            intervals: [
                {
                    name: "Work for 52 minutes",
                    interval: "52:00"
                },
                {
                    name: "Pause for 17 minutes",
                    interval: "17:00"
                }
            ]
        },
        {
            name: "Pomodoro",
            intervals: [
                {
                    name: "Work for 25 minutes",
                    interval: "25:00"
                },
                {
                    name: "Pause for 5 minutes",
                    interval: "5:00"
                }
            ]
        },
        // {
        //     name: "Quick test",
        //     intervals: [
        //         {
        //             name: "Work for 8 seconds",
        //             interval: "00:08"
        //         },
        //         {
        //             name: "Pause for 5 seconds",
        //             interval: "00:05"
        //         }
        //     ]
        // }
    ]

    @state()
    currentIntervalIndex = 0;

    @state()
    selectedTemplate: IntervalTemplate | undefined = undefined;

    @property({type: Object, reflect: false})
    get _currentInverval() { return this.selectedTemplate?.intervals[this.currentIntervalIndex] }

    @property({type: Boolean, reflect: false})
    get _hasMoreIntervals() { return this.selectedTemplate!.intervals?.length > this.currentIntervalIndex + 1 }

    override connectedCallback() {
        super.connectedCallback();
        this._setup()
    }

    private _setup() {
        //@todo: maybe change this.
        this.selectedTemplate = this.availableTemplates[0];
        this._activateInterval()
    }

    private _activateInterval() {
        const interval = this._currentInverval;
        if (interval) {
            const [minutes, seconds] = interval.interval.split(":").map(Number);
            this.minutes = minutes;
            this.seconds = seconds;
            this._resetTimer();
        }
    }

    private _onTemplateSelection(newTemplateName: string) {
        this.selectedTemplate = this.availableTemplates.find(t => t.name === newTemplateName);
        this.currentIntervalIndex = 0;
        this._activateInterval()
    }

    override render() {
        return html`
            <fieldset>
                <div>
                    <label for="jshshj-timer-select">Templates</label>
                    <select 
                            id="jshshj-timer-select"
                            autocomplete="off"
                            @change=${(e: Event) => {
                                this._onTemplateSelection((e.target as HTMLSelectElement).value)
                            }}
                    >
                        ${this.availableTemplates.map(template => html`
                            <option 
                                    value="${template.name}" 
                                    ?selected=${this.selectedTemplate?.name === template.name}
                            >
                                ${template.name}
                            </option>
                            `)}
                    </select>
                </div>
            </fieldset>
            <div part="timer">
                <h2>Current: ${this._currentInverval?.name}</h2>
            <time part="time"><span>${this._minutes.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
            })}</span>:<span>${this._seconds.toLocaleString('en-US', {
                minimumIntegerDigits: 2,
                useGrouping: false,
            })}</span></time>
            <button @click=${this._onClick} part="main-button">
                ${this._timerButtonText}
            </button>
                </div>
            <button 
                @click=${this._requestPermissionsForNotifications} 
                part="notification-button"
                aria-label="Get a notification when the timer is done"
            >
                <svg fill="none" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g clip-path="url(#a)"><path d="M10.59 67.226s-7.208-6.14-6.44-18.201c.767-12.061 8.029-16.57 8.029-16.57" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M15.317 60.18s-4.96-4.176-4.326-12.505c.634-8.33 5.719-11.5 5.719-11.5M88.806 66.627s7.209-6.14 6.441-18.201c-.767-12.061-8.03-16.57-8.03-16.57" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M84.08 59.582s4.959-4.177 4.325-12.506c-.633-8.33-5.718-11.5-5.718-11.5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path fill-rule="evenodd" clip-rule="evenodd" d="M52.019 13.743A2.982 2.982 0 0 0 49.139 10a2.978 2.978 0 0 0-2.814 3.953c-13.522 3.03-23.987 23.837-23.987 49.054 0 3.697.225 7.299.652 10.764C17.396 75.98 14 78.884 14 82.066c0 .2.013.398.04.596h71.39a4.49 4.49 0 0 0 .04-.596c0-3.182-3.396-6.087-8.989-8.295.427-3.465.651-7.067.651-10.764 0-25.914-11.05-47.17-25.114-49.264Zm-10.59 70.11c-.02.196-.031.395-.031.595 0 3.619 3.466 6.552 7.742 6.552s7.743-2.933 7.743-6.552c0-.2-.01-.399-.032-.595H41.43Z" fill="currentColor"/></g><defs><clipPath id="a"><path fill="#fff" d="M0 0h100v100H0z"/></clipPath></defs></svg>
                Get notified!
            </button>
        `;
    }

    private _requestPermissionsForNotifications() {
        if (!('Notification' in window)) {
            console.log('Notifications are not available in this environment');
            return;
        }

        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
            } else {
                console.log('Unable to get permission to notify.');
            }
        });
    }



    private _goToNextInterval() {
        this.currentIntervalIndex++;
    }


    private _onClick() {
        if (this._isTimerInitial) {
            this._startTimer()
            return;
        }

        // Timer done
        if (this._isTemplateDone) {
            this._onTemplateSelection(this.selectedTemplate!.name)
            return;
        }

        // Timer is running or paused
        if (this._isTimerPaused) {
            this._resumeTimer()
            return
        }

        this._pauseTimer()
    }


    private _startTimer() {
        this._resetTimer()
        this._isTimerPaused = false;
        this._countDown(Date.now())
        this.dispatchEvent(new CustomEvent('countdown-started'));
    }

    private _resumeTimer() {
        this._isTimerPaused = false;
        this.dispatchEvent(new CustomEvent('timer-resumed'));
    }

    private _pauseTimer() {
        this._isTimerPaused = true;
        this.dispatchEvent(new CustomEvent('timer-paused'));
    }

    _countDown = (previousTime: number) => {
        //@todo: figure out multiple timers

        if (this._isTimerDone && this._timer) {
            // Stop the timer

            new Notification(`Time's up for ${this._currentInverval?.name}!`, {
                body: "Your time of " + this.minutes + " minutes and " + this.seconds + " seconds is up!",
            });

            // if another inverval is available, go to the next one and start the timer
            // else do whatever finishing will be
            if (this._hasMoreIntervals) {
                this._goToNextInterval()
                this._activateInterval()
                this._startTimer()
            } else {
                this._isTimerPaused = true;
                window.cancelAnimationFrame(this._timer);
            }

            return;
        }



        const now = Date.now();

        if (this._isTimerPaused) {
            this._timer = requestAnimationFrame(() => this._countDown(
                now
            ));
            return
        }

        const elapsed = now - previousTime


        // update every second
        if (elapsed > 1000) {
            if (this._seconds === 0) {
                this._minutes--;
                this._seconds = 59;
            } else {
                this._seconds--;
            }
            // rerun
            this._timer = requestAnimationFrame(() => this._countDown(
                now
            ));
            return;
        }

        // Else rerun with old variables
        this._timer = requestAnimationFrame(() => this._countDown(
            previousTime
        ));
    };

    private _resetTimer() {
        if (this._timer) {
          window.cancelAnimationFrame(this._timer);
        }
        this._minutes = this.minutes;
        this._seconds = this.seconds;
        this.dispatchEvent(new CustomEvent('timer-reset'));
    }

}

declare global {
    interface HTMLElementTagNameMap {
        'jshsj-timer': JSHSJTimer;
    }
}
