interface ICutTheTextParams {
    text: string,
    maxLength: number,
}

export const truncateTheText = ({text, maxLength}: ICutTheTextParams): string => {
    if (!text || text.length < maxLength - 1) {
        return text;
    }

    let result = text.slice(0, maxLength);
    for (let i = result.length - 1; i > 0; i--) {
        const regexIsLastSpace = result.match(/\s$/);

        if (!regexIsLastSpace) {
            result = result.concat("...");
            break;
        }

        result = result.slice(0, -1);
    }

    return result;
};