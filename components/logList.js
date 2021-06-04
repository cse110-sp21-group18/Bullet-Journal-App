// eslint-disable-next-line import/newline-after-import
import { router } from '../scripts/router.js';
import {
    saveEntryToStorage,
    getEntryFromStorage,
    getAllKeys,
} from '../scripts/indexdb.js';

const { setState } = router;

// <journal-entry> custom web component
class LogList extends HTMLElement {
    constructor() {
        super();

        const template = document.createElement('template');

        template.innerHTML = `
        <style>
            .log-list-comp {
                width: 24vw;
                height: 33vh;
                background-color: #9DBEB9;
                border-radius: 25px;
                border-width: 3px;
                border-color: black;
                text-align: center;
                margin-left: 5px;
                margin-right: 5px;
                float: left;
            }

            .log-title {
                padding-top: 10px;
                margin-bottom: 5px;
                font-size: 30px;
                font-family: 'Lato', sans-serif;
                font-weight: bold;
                text-align: center;
            }

            .most-recent {
                font-size: 13px;
                font-family: 'Lato', sans-serif;
                font-weight: bold;
                background-color: white;
                border-color: transparent;
                border-radius: 30px;
                box-shadow: 0px 0px 10px 0px white;
                text-align: center;
                margin-bottom: 10px;
                cursor: pointer;
            }
            
            .most-recent:hover {
                background-color: lightgray;
            }

            .logs-list {
                min-height: 50%;
                max-height: 60%;
                list-style: none;
                padding-top: 10px;
                padding-bottom: 10px;
                margin-left: 0;
                padding-left: 0;
                font-family: 'Lato', sans-serif;
                font-weight: bold;
                font-size: 24px;
                width: 80%;
                margin: 0 auto;
                background-color: white;
                border-radius: 11px;
                text-align: center;
                overflow-y: scroll;
            }

            .logs-list li:hover {
                color: gray;
                text-decoration: underline;
            }
        </style>

        <div class="log-list-comp">
            <h1 class="log-title">DAILY LOG</h2>
            <button class="most-recent" id="most-recent" type="button">MOST RECENT</button>
            <button class="most-recent" id="create-new" type="button">CREATE NEW</button>
            <ul class="logs-list">
            </ul>
        </div>
        `;

        this.attachShadow({ mode: 'open' });
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // For switching themes
        const logList = this.shadowRoot.querySelector('.log-list-comp'); // get <log-list>
        const logo = document.querySelector('#flamingo-logo'); // get falmingo logo and title img
        const color = JSON.parse(localStorage.getItem('color')); // get the color theme from local storage

        // when reloading choose theme based on local stoage theme
        switch (color) {
            // use dark mode
            case 'dark': {
                logList.style.backgroundColor = '#7C7C7C';
                break;
            }
            // use default
            case 'normal': {
                logList.style.backgroundColor = '#9DBEB9';
                break;
            }
            // use light mode
            case 'light': {
                logList.style.backgroundColor = '#FFC2B4';
                break;
            }
            default: {
                break;
            }
        }

        // whenever the user goes to home page after changing theme
        logo.addEventListener('click', () => {
            const colors = JSON.parse(localStorage.getItem('color')); // get the color theme from local storage

            switch (colors) {
                // use dark mode
                case 'dark': {
                    logList.style.backgroundColor = '#7C7C7C';
                    break;
                }
                // use default
                case 'normal': {
                    logList.style.backgroundColor = '#9DBEB9';
                    break;
                }
                // use light mode
                case 'light': {
                    logList.style.backgroundColor = '#FFC2B4';
                    break;
                }
                default: {
                    break;
                }
            }
        });
    }

    /**
     * `set` binds an object property to a function to be called when there is an attempt to set that property.
     * Change log details based on log type given.
     * {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/set}
     * @todo Retrieve logs from database and populate entries
     * @todo Make the most recent button switch to the appropriate most recent log
     */
    set type(logType) {
        const logTitle = this.shadowRoot.querySelector('.log-title');
        const mostRecentButton = this.shadowRoot.querySelector('.most-recent');
        const createNewButton = this.shadowRoot.querySelector('#create-new');
        const logsList = this.shadowRoot.querySelector('.logs-list');
        logTitle.textContent = `${logType.toUpperCase()} LOG`;

        // get rid of old entries if there are any
        while (logsList.firstElementChild) {
            logsList.removeChild(logsList.firstElementChild);
        }

        // fill entry list
        getAllKeys(logType, (keysArray) => {
            for (let i = 0; i < keysArray.length; i += 1) {
                const listEntry = document.createElement('li');
                listEntry.textContent = keysArray[i];
                let state;
                if (logType === 'future') {
                    let half;
                    // If the key is January, pass half 1 into whichHalf
                    // else, pass half 2 into whichHalf
                    if (keysArray[i].substring(0, 2) === 'Ja') {
                        half = 1;
                    } else {
                        half = 2;
                    }
                    state = {
                        page: logType,
                        date: keysArray[i],
                        whichHalf: half,
                    };
                } else {
                    state = { page: logType, date: keysArray[i] };
                }

                listEntry.addEventListener('click', () => {
                    setState(state);
                });
                logsList.appendChild(listEntry);
            }
        });

        createNewButton.addEventListener('click', () => {
            switch (logType) {
                case 'daily': {
                    const today = new Date().toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    });
                    getEntryFromStorage(logType, today, (entryData) => {
                        if (!entryData) {
                            const blankEntry = { 1: [''] };
                            saveEntryToStorage(
                                logType,
                                today,
                                blankEntry,
                                'undefined'
                            );
                            const state = { page: logType, date: today };
                            setState(state);
                        } else {
                            const state = { page: logType, date: today };
                            setState(state);
                        }
                    });
                    break;
                }
                case 'weekly': {
                    // Get the date, and format it to the storage template
                    const day = new Date().getDate();
                    const week = parseInt(day / 7, 10) + 1;
                    const month = new Date().getMonth();
                    const year = new Date().getFullYear();
                    const monthNames = [
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                    ];

                    const today = `Week ${week}, ${monthNames[month]} ${year}`;
                    getEntryFromStorage(logType, today, (entryData) => {
                        if (!entryData) {
                            const blankEntry = {
                                1: [''],
                                2: [''],
                                3: [''],
                                4: [''],
                                5: [''],
                                6: [''],
                                7: [''],
                            };
                            saveEntryToStorage(
                                logType,
                                today,
                                blankEntry,
                                'undefined'
                            );
                            const state = { page: logType, date: today };
                            setState(state);
                        } else {
                            const state = { page: logType, date: today };
                            setState(state);
                        }
                    });
                    break;
                }
                case 'monthly': {
                    // Get the date, and format it to the storage template
                    const month = new Date().getMonth();
                    const year = new Date().getFullYear();
                    const monthNames = [
                        'January',
                        'February',
                        'March',
                        'April',
                        'May',
                        'June',
                        'July',
                        'August',
                        'September',
                        'October',
                        'November',
                        'December',
                    ];

                    const today = `${monthNames[month]} ${year}`;
                    getEntryFromStorage(logType, today, (entryData) => {
                        if (!entryData) {
                            const blankEntry = {
                                1: [''],
                                2: [''],
                                3: [''],
                                4: [''],
                                5: [''],
                            };
                            saveEntryToStorage(
                                logType,
                                today,
                                blankEntry,
                                'undefined'
                            );
                            const state = { page: logType, date: today };
                            setState(state);
                        } else {
                            const state = { page: logType, date: today };
                            setState(state);
                        }
                    });
                    break;
                }
                case 'future': {
                    const month = new Date().getMonth();
                    const half = parseInt(month / 6, 10) + 1;
                    const year = new Date().getFullYear();
                    let today;
                    if (half === 1) {
                        today = `January - June, ${year}`;
                    } else {
                        today = `July - December, ${year}`;
                    }
                    getEntryFromStorage(logType, today, (entryData) => {
                        if (!entryData) {
                            const blankEntry = {
                                1: [''],
                                2: [''],
                                3: [''],
                                4: [''],
                                5: [''],
                                6: [''],
                            };
                            saveEntryToStorage(
                                logType,
                                today,
                                blankEntry,
                                'undefined'
                            );
                            const state = {
                                page: logType,
                                date: today,
                                whichHalf: half,
                            };
                            setState(state);
                        } else {
                            const state = {
                                page: logType,
                                date: today,
                                whichHalf: half,
                            };
                            setState(state);
                        }
                    });
                    break;
                }
                default: {
                    break;
                }
            }
        });
        mostRecentButton.addEventListener('click', () => {});
    }
}

customElements.define('log-list', LogList);
