import { POPUP_RESULT, POPUP_TYPE, Popup } from './popup.js';

/** @type {Popup} */
let loaderPopup;

let preloaderYoinked = false;

export function showLoader() {
    // Two loaders don't make sense. Don't await, we can overlay the old loader while it closes
    if (loaderPopup) loaderPopup.complete(POPUP_RESULT.CANCELLED);

    loaderPopup = new Popup(`
        <div id="loader">
            <div id="load-spinner" class="fa-solid fa-gear fa-spin fa-3x"></div>
        </div>`, POPUP_TYPE.DISPLAY, null, { transparent: true, animation: 'none' });

    // No close button, loaders are not closable
    loaderPopup.closeButton.style.display = 'none';

    loaderPopup.show();
}

export async function hideLoader() {
    if (!loaderPopup) {
        console.warn('There is no loader showing to hide');
        return Promise.resolve();
    }

    return new Promise((resolve) => {
        const spinner = $('#load-spinner');
        
        // Apply the styles
        spinner.css({
            'filter': 'blur(15px)',
            'opacity': '0',
        });

        // Check if transitions are disabled by comparing computed style
        const transitionDuration = getComputedStyle(spinner[0]).transitionDuration;
        const hasTransitions = parseInt(transitionDuration) > 0;

        if (hasTransitions) {
            // Spinner blurs/fades out
            spinner.one('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', cleanup);
        } else {
            // No transitions - clean up immediately
            cleanup();
        }

        function cleanup() {
            $('#loader').remove();
            // Yoink preloader entirely; it only exists to cover up unstyled content while loading JS
            // If it's present, we remove it once and then it's gone.
            yoinkPreloader();
            loaderPopup.complete(POPUP_RESULT.AFFIRMATIVE).then(() => {
                loaderPopup = null;
                resolve();
            });
        }
    });
}

function yoinkPreloader() {
    if (preloaderYoinked) return;
    document.getElementById('preloader').remove();
    preloaderYoinked = true;
}
