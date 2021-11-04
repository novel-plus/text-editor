/** dom element cache */
// buttons
const newFileButton = document.getElementById('new-file-button');
const loadFileButton = document.getElementById('load-file-button');
const saveFileButton = document.getElementById('save-file-button');
// containers
const rawMarkdownContainer = document.getElementById('raw-markdown');
const renderedHtmlContainer = document.getElementById('rendered-html');
// special
const mainEventReceiver = document.getElementById('main-event-receiver');

const gloabals = {
    filepath: ''
}

/** functions */
function renderMarkDownToHtml(rawMarkdown) {
    return markdownApi.parse(rawMarkdown);
}

function handlePathUpdate(path) {
    const basePath = pathApi.basename(path);
    const originalTitle = '예제 마크다운 텍스트 편집기'
    document.title = `${basePath} - ${originalTitle}`;
    gloabals.filepath = path;
}

function handleFileLoad({canceled, path, content}) {
    if (!!canceled) {
        return;
    }
    handlePathUpdate(pathApi.basename(path));
    rawMarkdownContainer.value = content;
    renderedHtmlContainer.innerHTML = renderMarkDownToHtml(content);
}

function handleFileSave() {
    const filename = gloabals.filepath;
    const rawMarkdown = rawMarkdownContainer.value;
    if (rawMarkdown === '') {
        alert('빈 문서입니다.')
        return;
    }
    fileControlApi.save(filename, rawMarkdown).then((complete)=>console.log("complete saving", complete));
}

/** event handlers */
// user event handlers
newFileButton.addEventListener('click', () => {
    fileControlApi.new();
})

loadFileButton.addEventListener('click', () => {
    fileControlApi.open().then(handleFileLoad);
})

saveFileButton.addEventListener('click', () => {
    handleFileSave();
})

rawMarkdownContainer.addEventListener('input', (event) => {
    renderedHtmlContainer.innerHTML = renderMarkDownToHtml(event.target.value);
})

// main event handlers
mainEventReceiver.addEventListener('file-render:opened', (event) => {
    const result = event.detail;
    handleFileLoad(result);
})

mainEventReceiver.addEventListener('file-render:save-request', (event) => {
    handleFileSave();
})
