// element caching
// buttons
const newFileButton = document.getElementById('new-file-button');
const loadFileButton = document.getElementById('load-file-button');
// containers
const rawMarkdownContainer = document.getElementById('raw-markdown');
const renderedHtmlContainer = document.getElementById('rendered-html');

function renderMarkDownToHtml(markdown) {
    return window.markdown.render(markdown);
}

function handleFileLoad({canceled, path, content}) {
    if (canceled) {
        return;
    }
    rawMarkdownContainer.value = content;
    renderedHtmlContainer.innerHTML = renderMarkDownToHtml(content);
}

loadFileButton.addEventListener('click', () => {
    window.fileControl.open().then(handleFileLoad);
})

rawMarkdownContainer.addEventListener('input', (event) => {
    renderedHtmlContainer.innerHTML = renderMarkDownToHtml(event.target.value);
})


