import { t } from './i18n.js';
import { SlashCommandParser } from './slash-commands/SlashCommandParser.js';
import { getContext } from './st-context.js';

const ASSISTANT_NAME = 'Assistant';

/**
 * @desc Prepare the create assistant button.
 * @returns {void}
 */
export function prepareCreateAssistant() {
    const createAssistantBtn = document.querySelector('[data-which="create-assistant-btn"]');

    if (createAssistantBtn) {
        createAssistantBtn.addEventListener('click', async () => {
            if (assistantAlreadyExists()) {
                chatWithAssistant();
            } else {
                await createAssistant();
                chatWithAssistant();
            }
        });
    }
}

// region Helpers
/**
 * @desc Sleep for a given number of milliseconds.
 * @param {number} ms
 * @returns {Promise<void>}
 */
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @desc Check if the assistant already exists.
 * @returns {boolean}
 */
function assistantAlreadyExists() {
    const { characters } = getContext();

    return characters.some(character => character.name === ASSISTANT_NAME);
}

/**
 * @desc Chat with the assistant.
 * @returns {Promise<void>}
 */
async function chatWithAssistant() {
    SlashCommandParser.commands.char.callback({ _scope: null, _abortController: null }, ASSISTANT_NAME);
}

/**
 * @desc Create the assistant.
 * @returns {Promise<void>}
 */
async function createAssistant() {
    try {
        const characterManagementButton = document.querySelector('#rightNavDrawerIcon');
        const createCharacterButton = document.querySelector('#rm_button_create');
        const characterNameInput = document.querySelector('#character_name_pole');
        const firstMessageTextarea = document.querySelector('#firstmessage_textarea');
        const saveCharacterButton = document.querySelector('#create_button_label');

        characterManagementButton.click();
        createCharacterButton.click();

        await sleep(0);

        characterNameInput.value = ASSISTANT_NAME;
        firstMessageTextarea.value = 'Hello! I am your assistant. How can I help you today?';

        await sleep(0);

        saveCharacterButton.click();

        await sleep(100);
    } catch (error) {
        console.error('Unable to create assistant.', error);
        toastr.error(t`Unable to create assistant.`, t`Error`, { timeOut: 0, extendedTimeOut: 0, preventDuplicates: true });
    }
}
// endregion
