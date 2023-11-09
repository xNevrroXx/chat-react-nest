import highlight from "highlight.js";


const REGEX = /^(`{3})([a-z0-9+]*$)([\S\s]+?)(^\1$)/gim;

function codeBlocksToHTML(text: string): string {
    if (!text) return text;
    const resultHTML = text.split("");
    const matches = text.matchAll(REGEX);

    for (const match of matches) {
        const code = highlight.highlight(match[3].trim(), {language: match[2]});
        const temp = `<pre><code ${match[2] && "class='hljs language-" + match[2].toLowerCase() + "'"}>${code.value}</code></pre>`;
        resultHTML.splice(match.index, match[0].length, ...temp.split(""));
    }

    return resultHTML.join("");
}

export {codeBlocksToHTML};