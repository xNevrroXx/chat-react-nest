interface ICutTheTextParams {
    text: string,
    maxLength: number,
}

export const truncateTheText = ({text, maxLength}: ICutTheTextParams): string => {
    if (!text || text.length < maxLength - 1) {
        return text;
    }

    let result = text.slice(0, maxLength);
    const regexLastLetterBeforeSpace = /.(?=\s)/g;
    let m: RegExpExecArray | null = null;
    let lastMatch: RegExpExecArray | null = null;
    do {
        const pastMatch = m;
        m = regexLastLetterBeforeSpace.exec(result);

        if (!m) {
            lastMatch = pastMatch;
            break;
        }
    } while(m);


    if (!lastMatch) {
        return result;
    }

    result = result.slice(0, lastMatch.index + 1).concat("...");

    return result;
};