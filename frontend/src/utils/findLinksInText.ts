const URL_REGEX = /(https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/g;
const URL_COMBINED_REGEX = /(?<!=)(?<!^)(?=https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_+.~#?&/=]*))/g;

function findLinksInText(text: string): string[] {
    const links = [];
    const matches = text.matchAll(URL_REGEX);

    for (const match of matches) {
        const maybeCombinedUrls = match[0];
        const sliced = maybeCombinedUrls.split(URL_COMBINED_REGEX);
        links.push(...sliced);
    }

    return links;
}

export {findLinksInText};