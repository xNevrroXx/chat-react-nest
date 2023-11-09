import highlight from "highlight.js";


const REGEX = /^(`{3})([a-z0-9+]*$)([\S\s]+?)(^\1$)/gim;

/**
 * Finds and replaces the Markdown code blocks with HTML code blocks(pre > code > ...found code block...).<br\>
 * Also add a highlight to the code using "highlight.js" npm package.
 * @param {string} text - a text that possible contains blocks of Markdown code
 * @return {string}     - a new string containing HTML tags.
 * */
function codeBlocksToHTML(text: string): string {
    if (!text) return text;
    let resultCharsHTML = "";
    const prevEndMatchesIndexes = {
        textIndex: 0,
        htmlIndex: 0,
    };

    const matches = text.matchAll(REGEX);
    const matchArray = Array.from(matches);
    if (!matchArray.length) {
        // if there is no code sections in the input text
        return text;
    }

    for (const match of matchArray) {
        // add plain text to the resulting string.
        resultCharsHTML += text.slice(prevEndMatchesIndexes.textIndex, match.index);
        prevEndMatchesIndexes.htmlIndex += match.index - prevEndMatchesIndexes.textIndex;
        prevEndMatchesIndexes.textIndex = match.index + 1;

        // add HTML code blocks to the resulting string.
        const language = match[2];
        const extractedCode = match[3].trim();
        if (!extractedCode.length) {
            continue;
        }
        const highlightedCode = language
            ? highlight.highlight(extractedCode, {language})
            : highlight.highlightAuto(extractedCode);

        const codeWithWrapper =
            "<pre>" +
                `<code class="hljs ${language && "language-" + language.toLowerCase()}">` +
                    highlightedCode.value +
                "</code>" +
            "</pre>";
        resultCharsHTML += codeWithWrapper;
        prevEndMatchesIndexes.htmlIndex += codeWithWrapper.length;
        prevEndMatchesIndexes.textIndex += match[0].length;
    }

    return resultCharsHTML;
}

export {codeBlocksToHTML};