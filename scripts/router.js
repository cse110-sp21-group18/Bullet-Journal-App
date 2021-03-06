import { saveEntryToStorage } from './indexdb.js';

export const router = {};

/**
 *  Function to handle SPA functionality. Used to switch pages and update components accordingly
 * @param {*} state An object that has data about the caller and will
 *                  switch pages based on that information
 */

router.setState = function switchState(state) {
    const body = document.querySelector('body');
    const title = document.querySelector('.title');
    const allBulletEntries = document.querySelectorAll('bullet-entries');

    // If there are instances of bullet-entry in the dom, delete them.
    // eslint-disable-next-line no-restricted-syntax
    for (const entry of allBulletEntries) {
        entry.remove();
    }
    // If you are switching to a log, update mostRecent Store
    // with the log being switched to
    if (state.page !== 'home') {
        saveEntryToStorage('mostRecent', state.page, state.date, 'undefined');
    }

    switch (state.page) {
        // Dynamically 'create' logList when switching to home page
        case 'home': {
            body.id = 'home';
            const logLists = document.querySelectorAll('log-list');
            logLists[0].type = 'daily';
            logLists[1].type = 'weekly';
            logLists[2].type = 'monthly';
            logLists[3].type = 'future';
            break;
        }
        case 'daily': {
            body.id = 'daily-log';
            title.textContent = state.date;

            const singlePage = document.querySelector('.single-page');
            const newPage = document.createElement('bullet-entries');
            newPage.logtype = 'daily';
            newPage.date = state.date;
            newPage.position = 1;
            singlePage.appendChild(newPage);
            break;
        }
        case 'weekly': {
            body.id = 'weekly-log';
            title.textContent = state.date;

            const leftPage = document.querySelector('.weekly-log-left-grid');

            let counter = 1;

            // Create bulletEntry instances for each day of the week
            // on the left side of the page
            // eslint-disable-next-line no-restricted-syntax
            for (const day of leftPage.children) {
                const newPage = document.createElement('bullet-entries');
                newPage.logtype = 'weekly';
                newPage.date = state.date;
                newPage.position = counter;
                day.appendChild(newPage);

                counter += 1;
            }

            const rightPage = document.querySelector('.weekly-log-right-grid');
            // Create bulletEntry instances for each day of the week
            // on the right side of the page
            // eslint-disable-next-line no-restricted-syntax
            for (const day of rightPage.children) {
                const newPage = document.createElement('bullet-entries');
                newPage.logtype = 'weekly';
                newPage.date = state.date;
                newPage.position = counter;
                day.appendChild(newPage);

                counter += 1;
            }

            break;
        }
        case 'monthly': {
            body.id = 'monthly-log';
            title.textContent = state.date;

            const leftPage = document.querySelector('.monthly-left');
            // counter will hold the value of position for saveEntryToStorage
            let counter = 1;

            // Create bulletEntry instances for each week of the month
            // on the left side of the page
            // eslint-disable-next-line no-restricted-syntax
            for (const week of leftPage.children) {
                const newPage = document.createElement('bullet-entries');
                newPage.logtype = 'monthly';
                newPage.date = state.date;
                newPage.position = counter;
                week.appendChild(newPage);

                counter += 1;
            }

            const rightPage = document.querySelector('.monthly-right');

            // Create bulletEntry instances for each week of the month
            // on the right side of the page
            // eslint-disable-next-line no-restricted-syntax
            for (const week of rightPage.children) {
                const newPage = document.createElement('bullet-entries');
                newPage.logtype = 'monthly';
                newPage.date = state.date;
                newPage.position = counter;
                week.appendChild(newPage);

                counter += 1;
            }

            break;
        }
        case 'future': {
            body.id = 'future-log';
            title.textContent = state.date;

            const mainPage = document.querySelector(
                '.future-log-grid-container'
            );
            const monthNamesFirstHalf = [
                'JAN',
                'FEB',
                'MAR',
                'APR',
                'MAY',
                'JUN',
            ];
            const monthNamesSecondHalf = [
                'JUL',
                'AUG',
                'SEP',
                'OCT',
                'NOV',
                'DEC',
            ];
            // Renaming Divs appropriately
            for (let i = 0; i < mainPage.children.length; i += 1) {
                if (state.whichHalf === 1) {
                    mainPage.children[i].innerHTML = monthNamesFirstHalf[i];
                } else {
                    mainPage.children[i].innerHTML = monthNamesSecondHalf[i];
                }
            }

            let counter = 1;
            // Create bulletEntry instances for each month of the half-year
            // eslint-disable-next-line no-restricted-syntax
            for (const month of mainPage.children) {
                const newPage = document.createElement('bullet-entries');
                newPage.logtype = 'future';
                newPage.date = state.date;
                newPage.position = counter;
                if (month.children.length > 0) {
                    month.removeChild(month.lastElementChild);
                }
                month.appendChild(newPage);

                counter += 1;
            }
            break;
        }
        default: {
            break;
        }
    }
    // if setState was not called by popstate, then pushState
    if (!state.popped) {
        if (state.page === 'home') {
            // eslint-disable-next-line no-restricted-globals
            history.pushState(state, '', '/');
        } else {
            // eslint-disable-next-line no-restricted-globals
            history.pushState(state, '', `#${state.date}`);
        }
    }
};
