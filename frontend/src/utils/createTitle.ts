const MAIN_TITLE = import.meta.env.VITE_TITLE;

function createTitle(subTitle: string) {
    return MAIN_TITLE.concat(" | ").concat(subTitle);
}

export {createTitle};