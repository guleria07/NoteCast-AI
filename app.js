/* ============================================================
   NOTECAST AI — UPLOAD ADAPTER
   ------------------------------------------------------------
   ============================================================ */

(function prepareNoteCastUploadUI() {

    function getStartButtons() {

        return Array.from(
            document.querySelectorAll("button, a")
        ).filter((element) => {

            const text =
                (element.textContent || "")
                    .replace(/\s+/g, " ")
                    .trim()
                    .toLowerCase();

            return text.startsWith("start learning");
        });
    }


    const startButtons =
        getStartButtons();


    if (startButtons.length === 0) {

        console.warn(
            "NoteCast: No Start learning button was found."
        );

        return;
    }


    /* --------------------------------------------------------
       Prefer the large hero button.
       -------------------------------------------------------- */

    const heroButton =
        document.querySelector(
            ".hero-actions .primary-button"
        ) || startButtons[0];


    /* --------------------------------------------------------
       Create the hidden PDF picker expected by app.js
       -------------------------------------------------------- */

    let fileInput =
        document.getElementById("fileInput");


    if (!fileInput) {

        fileInput =
            document.createElement("input");

        fileInput.type = "file";

        fileInput.id = "fileInput";

        fileInput.accept =
            ".pdf,application/pdf";

        fileInput.hidden = true;

        document.body.appendChild(
            fileInput
        );
    }


    /* --------------------------------------------------------
       Give the hero button the ID expected by app.js
       -------------------------------------------------------- */

    let uploadButton =
        document.getElementById(
            "uploadButton"
        );


    if (!uploadButton) {

        heroButton.id =
            "uploadButton";

        uploadButton =
            heroButton;
    }


    /* --------------------------------------------------------
       Create selected-file display
       -------------------------------------------------------- */

    let selectedFile =
        document.getElementById(
            "selectedFile"
        );


    if (!selectedFile) {

        selectedFile =
            document.createElement("div");

        selectedFile.id =
            "selectedFile";

        selectedFile.className =
            "selected-file hidden";


        const actions =
            heroButton.closest(
                ".hero-actions"
            );


        if (actions) {

            actions.insertAdjacentElement(
                "afterend",
                selectedFile
            );

        } else {

            heroButton.insertAdjacentElement(
                "afterend",
                selectedFile
            );
        }
    }


    /* --------------------------------------------------------
       Connect other "Start learning" buttons
       such as the navbar button.
       
       The hero button itself is handled by the existing
       AWS upload code.
       -------------------------------------------------------- */

    startButtons.forEach(
        (button) => {

            if (
                button === uploadButton
            ) {
                return;
            }


            if (
                button.dataset
                    .notecastUploadConnected ===
                "true"
            ) {
                return;
            }


            button.dataset
                .notecastUploadConnected =
                "true";


            button.addEventListener(
                "click",
                (event) => {

                    event.preventDefault();

                    fileInput.click();
                }
            );
        }
    );


    console.log(
        "NoteCast: upload UI prepared successfully."
    );

})();
/* ============================================================
   NOTECAST AI
   FRONTEND APPLICATION

   Architecture:

   Browser
      ↓
   API Gateway
      ↓
   Presigned S3 URL
      ↓
   S3
      ↓
   Existing AWS processing pipeline
      ↓
   Result API
      ↓
   NoteCast Dashboard

   IMPORTANT:
   The AWS backend is intentionally NOT modified here.
============================================================ */


/* ============================================================
   CONFIGURATION
============================================================ */

const API_URL =
    "https://33jzrd1t7h.execute-api.ap-south-1.amazonaws.com/upload";


/* ============================================================
   DOM ELEMENTS
============================================================ */

const uploadButton =
    document.getElementById("uploadButton");

const fileInput =
    document.getElementById("fileInput");

const uploadBox =
    document.getElementById("uploadBox");

const selectedFile =
    document.getElementById("selectedFile");

const status =
    document.getElementById("status");

const statusCard =
    document.getElementById("statusCard");

const statusIcon =
    document.getElementById("statusIcon");

const statusTitle =
    document.getElementById("statusTitle");

const statusMessage =
    document.getElementById("statusMessage");

const workspace =
    document.getElementById("workspace");

const workspaceProcessing =
    document.getElementById("workspaceProcessing");

const workspaceProcessingText =
    document.getElementById("workspaceProcessingText");

const documentTitle =
    document.getElementById("documentTitle");

const summaryText =
    document.getElementById("summaryText");

const explanationCard =
    document.getElementById("explanationCard");

const explanationText =
    document.getElementById("explanationText");

const keyPointList =
    document.getElementById("keyPointList");

const flashcardContainer =
    document.getElementById("flashcardContainer");

const flashcardControls =
    document.getElementById("flashcardControls");

const previousCard =
    document.getElementById("previousCard");

const nextCard =
    document.getElementById("nextCard");

const cardCounter =
    document.getElementById("cardCounter");

const quizContainer =
    document.getElementById("quizContainer");

const podcastStatus =
    document.getElementById("podcastStatus");

const podcastAudio =
    document.getElementById("podcastAudio");


/* ============================================================
   APPLICATION STATE
============================================================ */

let currentUploadKey = null;

let currentFileName = null;

let currentLearningContent = null;

let currentFlashcards = [];

let currentFlashcardIndex = 0;

let currentQuiz = [];

let currentQuizIndex = 0;

let quizAnswered = false;

let pollingTimer = null;

let pollingStartedAt = null;

let audioUrl = null;


/* ============================================================
   CONSTANTS
============================================================ */

const POLL_INTERVAL = 5000;

const MAX_POLL_TIME = 15 * 60 * 1000;

const MAX_FILE_SIZE =
    50 * 1024 * 1024;


/* ============================================================
   INITIALIZATION
============================================================ */

document.addEventListener(
    "DOMContentLoaded",
    initializeApp
);


function initializeApp() {

    console.log(
        "NoteCast AI frontend initialized."
    );

    console.log(
        "API:",
        API_URL
    );


    setupUpload();

    setupTabs();

    setupFlashcardControls();

    setupDragAndDrop();

    setupNavigation();

}


/* ============================================================
   UPLOAD SETUP
============================================================ */

function setupUpload() {

    if (!uploadButton || !fileInput) {

        console.error(
            "Upload elements were not found."
        );

        return;
    }


    uploadButton.addEventListener(
        "click",
        function () {

            if (
                uploadButton.disabled
            ) {
                return;
            }

            fileInput.click();

        }
    );


    fileInput.addEventListener(
        "change",
        async function () {

            if (
                !fileInput.files ||
                fileInput.files.length === 0
            ) {

                return;
            }


            const file =
                fileInput.files[0];


            await handleSelectedFile(
                file
            );


            /*
             * Reset input so the same PDF
             * can be selected again later.
             */

            fileInput.value = "";

        }
    );

}


/* ============================================================
   DRAG AND DROP
============================================================ */

function setupDragAndDrop() {

    if (!uploadBox) {
        return;
    }


    [
        "dragenter",
        "dragover"
    ].forEach(
        function (eventName) {

            uploadBox.addEventListener(
                eventName,
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    uploadBox.classList.add(
                        "drag-over"
                    );

                }
            );

        }
    );


    [
        "dragleave",
        "drop"
    ].forEach(
        function (eventName) {

            uploadBox.addEventListener(
                eventName,
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();

                    uploadBox.classList.remove(
                        "drag-over"
                    );

                }
            );

        }
    );


    uploadBox.addEventListener(
        "drop",
        async function (event) {

            const files =
                event.dataTransfer.files;


            if (
                !files ||
                files.length === 0
            ) {
                return;
            }


            await handleSelectedFile(
                files[0]
            );

        }
    );

}


/* ============================================================
   FILE SELECTION
============================================================ */

async function handleSelectedFile(file) {

    console.log(
        "Selected file:",
        file
    );


    if (!validateFile(file)) {
        return;
    }


    currentFileName =
        file.name;


    showSelectedFile(
        file
    );


    documentTitle.textContent =
        file.name;


    resetPreviousResult();


    /*
     * Show workspace immediately.
     *
     * This allows the user to see that
     * the application has started processing.
     */

    showWorkspace();


    showProcessingState(
        "Preparing upload...",
        "Preparing your PDF for secure upload."
    );


    await uploadPDF(file);

}


/* ============================================================
   FILE VALIDATION
============================================================ */

function validateFile(file) {

    if (!file) {

        showError(
            "No file was selected."
        );

        return false;
    }


    const isPDF =
        file.type === "application/pdf" ||
        file.name
            .toLowerCase()
            .endsWith(".pdf");


    if (!isPDF) {

        showError(
            "Please select a PDF file."
        );

        return false;
    }


    if (
        file.size > MAX_FILE_SIZE
    ) {

        showError(
            "The PDF is too large. Please select a file smaller than 50 MB."
        );

        return false;
    }


    return true;

}


/* ============================================================
   SHOW SELECTED FILE
============================================================ */

function showSelectedFile(file) {

    if (!selectedFile) {
        return;
    }


    selectedFile.textContent =
        `📄 ${file.name} • ${formatFileSize(file.size)}`;


    selectedFile.classList.remove(
        "hidden"
    );


    clearStatus();

}


/* ============================================================
   FILE SIZE
============================================================ */

function formatFileSize(bytes) {

    if (
        !Number.isFinite(bytes) ||
        bytes <= 0
    ) {

        return "0 KB";

    }


    const units = [
        "B",
        "KB",
        "MB",
        "GB"
    ];


    const index =
        Math.floor(
            Math.log(bytes) /
            Math.log(1024)
        );


    const safeIndex =
        Math.min(
            index,
            units.length - 1
        );


    return (
        `${(
            bytes /
            Math.pow(
                1024,
                safeIndex
            )
        ).toFixed(safeIndex === 0 ? 0 : 1)} ${units[safeIndex]}`
    );

}


/* ============================================================
   UPLOAD PDF
============================================================ */

async function uploadPDF(file) {

    try {

        stopResultPolling();


        setUploadButtonState(
            true,
            "Preparing upload..."
        );


        showProcessingState(
            "Preparing upload...",
            "Requesting a secure upload URL."
        );


        /*
         * =====================================================
         * STEP 1
         * Request presigned S3 URL
         * =====================================================
         */

        console.log(
            "Requesting presigned upload URL..."
        );


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            filename:
                                file.name
                        })
                }
            );


        console.log(
            "Upload API HTTP status:",
            response.status
        );


        if (!response.ok) {

            const errorText =
                await safeReadText(
                    response
                );


            throw new Error(
                `Upload API returned ${response.status}${errorText ? `: ${errorText}` : ""}`
            );

        }


        const data =
            await safeReadJSON(
                response
            );


        console.log(
            "Upload API response:",
            data
        );


        /*
         * Some API Gateway setups may return
         * the JSON inside a body string.
         */

        const uploadData =
            normalizeAPIResponse(
                data
            );


        const uploadUrl =
            uploadData.uploadUrl ||
            uploadData.uploadURL ||
            uploadData.presignedUrl ||
            uploadData.presignedURL ||
            uploadData.url;


        const key =
            uploadData.key ||
            uploadData.s3Key ||
            uploadData.objectKey;


        if (!uploadUrl) {

            throw new Error(
                "The upload API did not return an S3 upload URL."
            );

        }


        if (!key) {

            throw new Error(
                "The upload API did not return the S3 object key."
            );

        }


        currentUploadKey =
            key;


        console.log(
            "S3 object key:",
            currentUploadKey
        );


        /*
         * =====================================================
         * STEP 2
         * Upload PDF directly to S3
         * =====================================================
         */

        setUploadButtonState(
            true,
            "Uploading..."
        );


        showProcessingState(
            "Uploading your PDF...",
            "Sending your document securely to Amazon S3."
        );


        const uploadResponse =
            await fetch(
                uploadUrl,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/pdf"
                    },

                    body: file
                }
            );


        console.log(
            "S3 upload HTTP status:",
            uploadResponse.status
        );


        if (!uploadResponse.ok) {

            throw new Error(
                `S3 upload failed with status ${uploadResponse.status}.`
            );

        }


        console.log(
            "PDF uploaded successfully."
        );


        selectedFile.textContent =
            `✓ ${file.name} uploaded successfully`;


        setStatus(
            "PDF uploaded successfully. Processing has started.",
            "success"
        );


        /*
         * =====================================================
         * START AWS RESULT POLLING
         * =====================================================
         */

        showProcessingState(
            "Processing your document",
            "Textract, Bedrock and the remaining AWS pipeline are working on your document."
        );


        showWorkspaceProcessing(
            "NoteCast AI is extracting, understanding and generating your learning material."
        );


        startResultPolling();

    }

    catch (error) {

        console.error(
            "UPLOAD ERROR:",
            error
        );


        stopResultPolling();


        showProcessingError(
            "Upload failed",
            getUsefulErrorMessage(
                error
            )
        );


        setStatus(
            getUsefulErrorMessage(
                error
            ),
            "error"
        );

    }

    finally {

        /*
         * Do not leave the button permanently disabled.
         */

        setTimeout(
            function () {

                setUploadButtonState(
                    false,
                    "Choose PDF"
                );

            },
            1200
        );

    }

}


/* ============================================================
   API RESPONSE NORMALIZATION
============================================================ */

function normalizeAPIResponse(data) {

    if (
        data &&
        typeof data === "object" &&
        typeof data.body === "string"
    ) {

        try {

            const parsed =
                JSON.parse(
                    data.body
                );


            if (
                parsed &&
                typeof parsed === "object"
            ) {

                return parsed;

            }

        }

        catch (error) {

            console.warn(
                "Could not parse API body:",
                error
            );

        }

    }


    return (
        data &&
        typeof data === "object"
            ? data
            : {}
    );

}


/* ============================================================
   RESULT POLLING
============================================================ */

function startResultPolling() {

    stopResultPolling();


    if (!currentUploadKey) {

        console.error(
            "Cannot poll without S3 key."
        );

        return;
    }


    pollingStartedAt =
        Date.now();


    console.log(
        "Starting result polling for:",
        currentUploadKey
    );


    checkForResult();


    pollingTimer =
        setInterval(
            checkForResult,
            POLL_INTERVAL
        );

}


/* ============================================================
   STOP POLLING
============================================================ */

function stopResultPolling() {

    if (pollingTimer) {

        clearInterval(
            pollingTimer
        );

        pollingTimer = null;

    }

}


/* ============================================================
   CHECK RESULT
============================================================ */

async function checkForResult() {

    if (!currentUploadKey) {
        return;
    }


    /*
     * Safety timeout.
     */

    if (
        pollingStartedAt &&
        Date.now() - pollingStartedAt >
            MAX_POLL_TIME
    ) {

        stopResultPolling();


        showProcessingError(
            "Processing is taking longer than expected",
            "The document may still be processing. You can check the AWS pipeline or try the upload again later."
        );


        return;
    }


    try {

        console.log(
            "Checking NoteCast result..."
        );


        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify({
                            action:
                                "result",

                            key:
                                currentUploadKey
                        })
                }
            );


        if (!response.ok) {

            /*
             * A temporary polling error should
             * not immediately destroy the session.
             */

            console.warn(
                `Result API returned ${response.status}.`
            );

            return;

        }


        const rawData =
            await safeReadJSON(
                response
            );


        const data =
            normalizeAPIResponse(
                rawData
            );


        console.log(
            "Result API response:",
            data
        );


        const result =
            normalizeResultResponse(
                data
            );


        console.log(
            "Normalized result:",
            result
        );


        /*
         * =====================================================
         * PROCESSING
         * =====================================================
         */

        if (
            result.status ===
                "processing" ||
            result.status ===
                "PROCESSING" ||
            result.status ===
                "pending" ||
            result.status ===
                "PENDING" ||
            result.status ===
                "running" ||
            result.status ===
                "RUNNING"
        ) {

            showProcessingState(
                "Processing your document",
                getProcessingMessage(
                    result
                )
            );


            return;

        }


        /*
         * =====================================================
         * FAILED
         * =====================================================
         */

        if (
            result.status ===
                "failed" ||
            result.status ===
                "FAILED" ||
            result.status ===
                "error" ||
            result.status ===
                "ERROR"
        ) {

            stopResultPolling();


            const errorMessage =
                result.error ||
                result.message ||
                "Something went wrong while generating your learning content.";


            showProcessingError(
                "Processing failed",
                errorMessage
            );


            return;

        }


        /*
         * =====================================================
         * READY
         * =====================================================
         */

        if (
            result.status ===
                "ready" ||
            result.status ===
                "READY" ||
            result.status ===
                "complete" ||
            result.status ===
                "completed" ||
            result.status ===
                "COMPLETE" ||
            result.status ===
                "COMPLETED" ||
            hasLearningContent(
                result
            )
        ) {

            stopResultPolling();


            currentLearningContent =
                extractLearningContent(
                    result
                );


            console.log(
                "Learning content received:",
                currentLearningContent
            );


            renderLearningContent(
                currentLearningContent
            );


            const foundAudioUrl =
                extractAudioUrl(
                    result
                );


            if (foundAudioUrl) {

                setupPodcast(
                    foundAudioUrl
                );

            }


            showReadyState();


            hideWorkspaceProcessing();


            return;

        }


        console.log(
            "Unknown result status:",
            result.status
        );

    }

    catch (error) {

        /*
         * Important:
         * A temporary polling/network error does NOT
         * immediately mark the AWS job as failed.
         */

        console.warn(
            "RESULT POLLING ERROR:",
            error
        );

    }

}


/* ============================================================
   RESULT NORMALIZATION
============================================================ */

function normalizeResultResponse(data) {

    const result =
        (
            data &&
            typeof data === "object"
        )
            ? data
            : {};


    let content =
        result.content ||
        result.learningContent ||
        result.learning_content ||
        result.result ||
        null;


    /*
     * If result.result is a JSON string,
     * parse it.
     */

    if (
        typeof content === "string"
    ) {

        try {

            const parsed =
                JSON.parse(
                    content
                );


            if (
                parsed &&
                typeof parsed === "object"
            ) {

                content = parsed;

            }

        }

        catch (error) {

            /*
             * It may simply be a text result.
             * Leave it as-is.
             */

        }

    }


    return {
        ...result,
        content
    };

}


/* ============================================================
   LEARNING CONTENT DETECTION
============================================================ */

function hasLearningContent(data) {

    if (
        !data ||
        typeof data !== "object"
    ) {

        return false;

    }


    const content =
        data.content ||
        data.learningContent ||
        data.learning_content;


    if (
        content &&
        typeof content === "object"
    ) {

        return (
            content.summary !== undefined ||
            content.key_points !== undefined ||
            content.keyPoints !== undefined ||
            content.flashcards !== undefined ||
            content.quiz !== undefined ||
            content.podcast_script !== undefined
        );

    }


    return (
        data.summary !== undefined ||
        data.key_points !== undefined ||
        data.keyPoints !== undefined ||
        data.flashcards !== undefined ||
        data.quiz !== undefined
    );

}


/* ============================================================
   EXTRACT LEARNING CONTENT
============================================================ */

function extractLearningContent(data) {

    let content =
        data.content ||
        data.learningContent ||
        data.learning_content ||
        data;


    /*
     * Some APIs return the body as JSON text.
     */

    if (
        typeof content === "string"
    ) {

        try {

            const parsed =
                JSON.parse(
                    content
                );


            if (
                parsed &&
                typeof parsed === "object"
            ) {

                content = parsed;

            }

        }

        catch (error) {

            return {
                summary:
                    content
            };

        }

    }


    return (
        content &&
        typeof content === "object"
            ? content
            : {}
    );

}


/* ============================================================
   EXTRACT AUDIO URL
============================================================ */

function extractAudioUrl(data) {

    if (!data) {
        return null;
    }


    const candidates = [

        data.audioUrl,

        data.audio_url,

        data.podcastUrl,

        data.podcast_url,

        data.audio,

        data.podcastAudio,

        data.podcast_audio

    ];


    for (
        const candidate
        of candidates
    ) {

        if (
            typeof candidate === "string" &&
            candidate.trim()
        ) {

            return candidate.trim();

        }

    }


    const content =
        data.content ||
        data.learningContent ||
        data.learning_content;


    if (
        content &&
        typeof content === "object"
    ) {

        return extractAudioUrl(
            content
        );

    }


    return null;

}


/* ============================================================
   PROCESSING MESSAGE
============================================================ */

function getProcessingMessage(result) {

    if (
        result &&
        result.message
    ) {

        return result.message;

    }


    return (
        "NoteCast AI is extracting, understanding and generating your learning material."
    );

}


/* ============================================================
   SHOW WORKSPACE
============================================================ */

function showWorkspace() {

    if (!workspace) {
        return;
    }


    workspace.classList.remove(
        "hidden"
    );

}


/* ============================================================
   SHOW PROCESSING STATE
============================================================ */

function showProcessingState(
    title,
    message
) {

    if (statusCard) {

        statusCard.classList.remove(
            "hidden"
        );

    }


    if (statusIcon) {

        statusIcon.textContent =
            "⏳";

    }


    if (statusTitle) {

        statusTitle.textContent =
            title ||
            "Processing your document";

    }


    if (statusMessage) {

        statusMessage.textContent =
            message ||
            "Please wait.";

    }


    showWorkspaceProcessing(
        message
    );

}


/* ============================================================
   SHOW READY STATE
============================================================ */

function showReadyState() {

    if (statusCard) {

        statusCard.classList.remove(
            "hidden"
        );

    }


    if (statusIcon) {

        statusIcon.textContent =
            "✓";

    }


    if (statusTitle) {

        statusTitle.textContent =
            "Your learning workspace is ready";

    }


    if (statusMessage) {

        statusMessage.textContent =
            "Your summary, key points, flashcards, quiz and podcast are ready.";

    }


    if (status) {

        setStatus(
            "✓ Processing complete.",
            "success"
        );

    }


    hideWorkspaceProcessing();

}


/* ============================================================
   SHOW PROCESSING ERROR
============================================================ */

function showProcessingError(
    title,
    message
) {

    if (statusCard) {

        statusCard.classList.remove(
            "hidden"
        );

    }


    if (statusIcon) {

        statusIcon.textContent =
            "❌";

    }


    if (statusTitle) {

        statusTitle.textContent =
            title ||
            "Something went wrong";

    }


    if (statusMessage) {

        statusMessage.textContent =
            message ||
            "Please try again.";

    }


    hideWorkspaceProcessing();

}


/* ============================================================
   WORKSPACE PROCESSING
============================================================ */

function showWorkspaceProcessing(
    message
) {

    if (!workspaceProcessing) {
        return;
    }


    workspaceProcessing.classList.remove(
        "hidden"
    );


    if (
        workspaceProcessingText &&
        message
    ) {

        workspaceProcessingText.textContent =
            message;

    }

}


function hideWorkspaceProcessing() {

    if (!workspaceProcessing) {
        return;
    }


    workspaceProcessing.classList.add(
        "hidden"
    );

}


/* ============================================================
   BUTTON STATE
============================================================ */

function setUploadButtonState(
    disabled,
    text
) {

    if (!uploadButton) {
        return;
    }


    uploadButton.disabled =
        disabled;


    uploadButton.textContent =
        text;

}


/* ============================================================
   STATUS
============================================================ */

function setStatus(
    message,
    type
) {

    if (!status) {
        return;
    }


    status.textContent =
        message || "";


    status.classList.remove(
        "success",
        "error"
    );


    if (type) {

        status.classList.add(
            type
        );

    }

}


function clearStatus() {

    if (!status) {
        return;
    }


    status.textContent =
        "";


    status.classList.remove(
        "success",
        "error"
    );

}


/* ============================================================
   ERROR MESSAGE
============================================================ */

function showError(message) {

    setStatus(
        `❌ ${message}`,
        "error"
    );


    if (selectedFile) {

        selectedFile.textContent =
            message;

        selectedFile.classList.remove(
            "hidden"
        );

    }

}


function getUsefulErrorMessage(error) {

    if (!error) {

        return (
            "An unknown error occurred."
        );

    }


    if (
        error instanceof TypeError &&
        error.message ===
            "Failed to fetch"
    ) {

        return (
            "The browser could not reach the upload API. Check the API endpoint/CORS configuration and the browser console."
        );

    }


    return (
        error.message ||
        String(error)
    );

}


/* ============================================================
   SAFE RESPONSE JSON
============================================================ */

async function safeReadJSON(
    response
) {

    const text =
        await response.text();


    if (!text) {
        return {};
    }


    try {

        return JSON.parse(
            text
        );

    }

    catch (error) {

        console.warn(
            "Response was not valid JSON:",
            text
        );


        return {
            raw:
                text
        };

    }

}


/* ============================================================
   SAFE RESPONSE TEXT
============================================================ */

async function safeReadText(
    response
) {

    try {

        const text =
            await response.text();


        return text
            ? text.slice(0, 500)
            : "";

    }

    catch (error) {

        return "";

    }

}


/* ============================================================
   RESET PREVIOUS RESULT
============================================================ */

function resetPreviousResult() {

    currentLearningContent =
        null;

    currentFlashcards =
        [];

    currentFlashcardIndex =
        0;

    currentQuiz =
        [];

    currentQuizIndex =
        0;

    quizAnswered =
        false;

    audioUrl =
        null;


    if (summaryText) {

        summaryText.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">⏳</div>
                <strong>Processing your document</strong>
                <p>Your AI-generated summary will appear here.</p>
            </div>
        `;

    }


    if (explanationCard) {

        explanationCard.classList.add(
            "hidden"
        );

    }


    if (keyPointList) {

        keyPointList.innerHTML = "";

    }


    if (flashcardContainer) {

        flashcardContainer.innerHTML = `
            <div class="flashcard empty-flashcard">
                <div class="empty-icon">🧠</div>
                <strong>Your flashcards are being generated</strong>
                <p>Please wait for processing to complete.</p>
            </div>
        `;

    }


    if (flashcardControls) {

        flashcardControls.classList.add(
            "hidden"
        );

    }


    if (quizContainer) {

        quizContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎯</div>
                <strong>Your quiz is being generated</strong>
                <p>Please wait for processing to complete.</p>
            </div>
        `;

    }


    if (podcastAudio) {

        podcastAudio.pause();

        podcastAudio.removeAttribute(
            "src"
        );

        podcastAudio.load();

    }


    if (podcastStatus) {

        podcastStatus.textContent =
            "Your generated podcast will appear here after processing.";

    }

}


/* ============================================================
   RENDER ALL CONTENT
============================================================ */

function renderLearningContent(
    content
) {

    if (
        !content ||
        typeof content !== "object"
    ) {

        console.warn(
            "No learning content to render."
        );

        return;

    }


    renderSummary(
        getFirstValue(
            content,
            [
                "summary",
                "Summary"
            ]
        )
    );


    renderExplanation(
        getFirstValue(
            content,
            [
                "explanation",
                "Explanation"
            ]
        )
    );


    renderKeyPoints(
        getFirstValue(
            content,
            [
                "key_points",
                "keyPoints",
                "key-points",
                "keypoints"
            ]
        )
    );


    renderFlashcards(
        getFirstValue(
            content,
            [
                "flashcards",
                "flashCards",
                "flash_cards"
            ]
        )
    );


    renderQuiz(
        getFirstValue(
            content,
            [
                "quiz",
                "questions"
            ]
        )
    );


    renderPodcastScript(
        getFirstValue(
            content,
            [
                "podcast_script",
                "podcastScript",
                "podcast_script_text",
                "podcast"
            ]
        )
    );

}


/* ============================================================
   GET FIRST VALUE
============================================================ */

function getFirstValue(
    object,
    keys
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return undefined;

    }


    for (
        const key
        of keys
    ) {

        if (
            object[key] !== undefined &&
            object[key] !== null
        ) {

            return object[key];

        }

    }


    return undefined;

}


/* ============================================================
   SUMMARY
============================================================ */

function renderSummary(
    summary
) {

    if (!summaryText) {
        return;
    }


    const text =
        valueToReadableText(
            summary
        );


    if (!text) {

        summaryText.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <strong>No summary was generated</strong>
                <p>The AWS pipeline completed, but no summary was returned.</p>
            </div>
        `;

        return;

    }


    summaryText.textContent =
        text;

}


/* ============================================================
   EXPLANATION
============================================================ */

function renderExplanation(
    explanation
) {

    if (
        !explanationCard ||
        !explanationText
    ) {

        return;

    }


    const text =
        valueToReadableText(
            explanation
        );


    if (!text) {

        explanationCard.classList.add(
            "hidden"
        );

        return;

    }


    explanationCard.classList.remove(
        "hidden"
    );


    explanationText.textContent =
        text;

}


/* ============================================================
   KEY POINTS
============================================================ */

function renderKeyPoints(
    points
) {

    if (!keyPointList) {
        return;
    }


    keyPointList.innerHTML =
        "";


    const normalized =
        normalizeArray(
            points
        );


    if (
        normalized.length === 0
    ) {

        keyPointList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">💡</div>
                <strong>No key points were generated</strong>
                <p>The AWS pipeline completed without returning key points.</p>
            </div>
        `;

        return;

    }


    normalized.forEach(
        function (
            point,
            index
        ) {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "key-point";


            const number =
                document.createElement(
                    "div"
                );


            number.className =
                "key-point-number";


            number.textContent =
                String(
                    index + 1
                );


            const text =
                document.createElement(
                    "div"
                );


            text.className =
                "key-point-text";


            text.textContent =
                extractKeyPointText(
                    point
                );


            item.appendChild(
                number
            );


            item.appendChild(
                text
            );


            keyPointList.appendChild(
                item
            );

        }
    );

}


/* ============================================================
   KEY POINT TEXT
============================================================ */

function extractKeyPointText(
    point
) {

    if (
        typeof point ===
        "string"
    ) {

        return point;

    }


    if (
        point &&
        typeof point === "object"
    ) {

        return (
            point.text ||
            point.point ||
            point.title ||
            point.description ||
            point.content ||
            valueToReadableText(
                point
            )
        );

    }


    return String(
        point
    );

}


/* ============================================================
   FLASHCARDS
============================================================ */

function renderFlashcards(
    flashcards
) {

    currentFlashcards =
        normalizeArray(
            flashcards
        );


    currentFlashcardIndex =
        0;


    if (!flashcardContainer) {
        return;
    }


    if (
        currentFlashcards.length === 0
    ) {

        flashcardContainer.innerHTML = `
            <div class="flashcard empty-flashcard">
                <div class="empty-icon">🧠</div>
                <strong>No flashcards were generated</strong>
                <p>The AWS pipeline completed without returning flashcards.</p>
            </div>
        `;


        if (flashcardControls) {

            flashcardControls.classList.add(
                "hidden"
            );

        }


        return;

    }


    if (flashcardControls) {

        flashcardControls.classList.remove(
            "hidden"
        );

    }


    renderCurrentFlashcard();

}


/* ============================================================
   CURRENT FLASHCARD
============================================================ */

function renderCurrentFlashcard() {

    if (!flashcardContainer) {
        return;
    }


    const item =
        currentFlashcards[
            currentFlashcardIndex
        ];


    if (!item) {
        return;
    }


    const question =
        extractFlashcardQuestion(
            item
        );


    const answer =
        extractFlashcardAnswer(
            item
        );


    flashcardContainer.innerHTML = "";


    const card =
        document.createElement(
            "div"
        );


    card.className =
        "flashcard";


    const number =
        document.createElement(
            "span"
        );


    number.className =
        "flashcard-number";


    number.textContent =
        `CARD ${String(
            currentFlashcardIndex + 1
        ).padStart(2, "0")}`;


    const questionElement =
        document.createElement(
            "h3"
        );


    questionElement.textContent =
        question;


    const divider =
        document.createElement(
            "div"
        );


    divider.className =
        "flashcard-divider";


    const answerElement =
        document.createElement(
            "p"
        );


    answerElement.textContent =
        answer ||
        "No answer was provided.";


    card.appendChild(
        number
    );


    card.appendChild(
        questionElement
    );


    card.appendChild(
        divider
    );


    card.appendChild(
        answerElement
    );


    flashcardContainer.appendChild(
        card
    );


    updateFlashcardControls();

}


/* ============================================================
   FLASHCARD QUESTION
============================================================ */

function extractFlashcardQuestion(
    item
) {

    if (
        typeof item ===
        "string"
    ) {

        return item;

    }


    if (
        item &&
        typeof item === "object"
    ) {

        return (
            item.question ||
            item.front ||
            item.prompt ||
            item.term ||
            item.title ||
            "Question"
        );

    }


    return "Question";

}


/* ============================================================
   FLASHCARD ANSWER
============================================================ */

function extractFlashcardAnswer(
    item
) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return "";

    }


    return (
        item.answer ||
        item.back ||
        item.explanation ||
        item.definition ||
        item.response ||
        ""
    );

}


/* ============================================================
   FLASHCARD CONTROLS
============================================================ */

function setupFlashcardControls() {

    if (previousCard) {

        previousCard.addEventListener(
            "click",
            function () {

                if (
                    currentFlashcardIndex >
                    0
                ) {

                    currentFlashcardIndex--;

                    renderCurrentFlashcard();

                }

            }
        );

    }


    if (nextCard) {

        nextCard.addEventListener(
            "click",
            function () {

                if (
                    currentFlashcardIndex <
                    currentFlashcards.length - 1
                ) {

                    currentFlashcardIndex++;

                    renderCurrentFlashcard();

                }

            }
        );

    }

}


function updateFlashcardControls() {

    if (
        !previousCard ||
        !nextCard ||
        !cardCounter
    ) {

        return;

    }


    cardCounter.textContent =
        `${currentFlashcardIndex + 1} / ${currentFlashcards.length}`;


    previousCard.disabled =
        currentFlashcardIndex === 0;


    nextCard.disabled =
        currentFlashcardIndex ===
        currentFlashcards.length - 1;

}


/* ============================================================
   QUIZ
============================================================ */

function renderQuiz(
    quiz
) {

    currentQuiz =
        normalizeArray(
            quiz
        );


    currentQuizIndex =
        0;


    quizAnswered =
        false;


    if (!quizContainer) {
        return;
    }


    if (
        currentQuiz.length === 0
    ) {

        quizContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🎯</div>
                <strong>No quiz questions were generated</strong>
                <p>The AWS pipeline completed without returning quiz questions.</p>
            </div>
        `;

        return;

    }


    renderCurrentQuiz();

}


/* ============================================================
   CURRENT QUIZ
============================================================ */

function renderCurrentQuiz() {

    if (!quizContainer) {
        return;
    }


    const item =
        currentQuiz[
            currentQuizIndex
        ];


    if (!item) {
        return;
    }


    quizAnswered =
        false;


    const question =
        extractQuizQuestion(
            item
        );


    const options =
        extractQuizOptions(
            item
        );


    quizContainer.innerHTML =
        "";


    const questionWrapper =
        document.createElement(
            "div"
        );


    questionWrapper.className =
        "quiz-question";


    const questionNumber =
        document.createElement(
            "div"
        );


    questionNumber.className =
        "question-number";


    questionNumber.textContent =
        `QUESTION ${String(
            currentQuizIndex + 1
        ).padStart(2, "0")}`;


    const questionElement =
        document.createElement(
            "h3"
        );


    questionElement.textContent =
        question;


    questionWrapper.appendChild(
        questionNumber
    );


    questionWrapper.appendChild(
        questionElement
    );


    quizContainer.appendChild(
        questionWrapper
    );


    const optionsContainer =
        document.createElement(
            "div"
        );


    optionsContainer.className =
        "quiz-options";


    const letters = [
        "A",
        "B",
        "C",
        "D",
        "E",
        "F"
    ];


    options.forEach(
        function (
            option,
            index
        ) {

            const button =
                document.createElement(
                    "button"
                );


            button.type =
                "button";


            button.className =
                "quiz-option";


            button.dataset.answerIndex =
                String(index);


            const letter =
                document.createElement(
                    "span"
                );


            letter.className =
                "quiz-letter";


            letter.textContent =
                letters[index] ||
                String(
                    index + 1
                );


            const text =
                document.createElement(
                    "span"
                );


            text.textContent =
                extractQuizOptionText(
                    option
                );


            button.appendChild(
                letter
            );


            button.appendChild(
                text
            );


            button.addEventListener(
                "click",
                function () {

                    handleQuizAnswer(
                        index
                    );

                }
            );


            optionsContainer.appendChild(
                button
            );

        }
    );


    quizContainer.appendChild(
        optionsContainer
    );


    const feedback =
        document.createElement(
            "div"
        );


    feedback.id =
        "quizFeedback";


    quizContainer.appendChild(
        feedback
    );


    const controls =
        document.createElement(
            "div"
        );


    controls.className =
        "quiz-controls";


    const previous =
        document.createElement(
            "button"
        );


    previous.type =
        "button";


    previous.className =
        "secondary";


    previous.textContent =
        "← Previous";


    previous.disabled =
        currentQuizIndex === 0;


    previous.addEventListener(
        "click",
        function () {

            if (
                currentQuizIndex > 0
            ) {

                currentQuizIndex--;

                renderCurrentQuiz();

            }

        }
    );


    const counter =
        document.createElement(
            "span"
        );


    counter.textContent =
        `${currentQuizIndex + 1} / ${currentQuiz.length}`;


    const next =
        document.createElement(
            "button"
        );


    next.type =
        "button";


    next.className =
        "primary";


    next.textContent =
        "Next →";


    next.disabled =
        currentQuizIndex ===
        currentQuiz.length - 1;


    next.addEventListener(
        "click",
        function () {

            if (
                currentQuizIndex <
                currentQuiz.length - 1
            ) {

                currentQuizIndex++;

                renderCurrentQuiz();

            }

        }
    );


    controls.appendChild(
        previous
    );


    controls.appendChild(
        counter
    );


    controls.appendChild(
        next
    );


    quizContainer.appendChild(
        controls
    );

}


/* ============================================================
   QUIZ QUESTION
============================================================ */

function extractQuizQuestion(
    item
) {

    if (
        typeof item ===
        "string"
    ) {

        return item;

    }


    if (
        item &&
        typeof item === "object"
    ) {

        return (
            item.question ||
            item.prompt ||
            item.questionText ||
            item.text ||
            "Question"
        );

    }


    return "Question";

}


/* ============================================================
   QUIZ OPTIONS
============================================================ */

function extractQuizOptions(
    item
) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return [];

    }


    const options =
        item.options ||
        item.choices ||
        item.answers ||
        [];


    return normalizeArray(
        options
    );

}


/* ============================================================
   QUIZ OPTION TEXT
============================================================ */

function extractQuizOptionText(
    option
) {

    if (
        typeof option ===
        "string"
    ) {

        return option;

    }


    if (
        option &&
        typeof option === "object"
    ) {

        return (
            option.text ||
            option.answer ||
            option.label ||
            option.value ||
            valueToReadableText(
                option
            )
        );

    }


    return String(
        option
    );

}


/* ============================================================
   QUIZ ANSWER
============================================================ */

function handleQuizAnswer(
    selectedIndex
) {

    if (quizAnswered) {
        return;
    }


    const item =
        currentQuiz[
            currentQuizIndex
        ];


    if (!item) {
        return;
    }


    const correctIndex =
        getQuizCorrectAnswer(
            item
        );


    if (
        correctIndex === null
    ) {

        console.warn(
            "Could not determine correct quiz answer:",
            item
        );


        return;

    }


    quizAnswered =
        true;


    const optionButtons =
        quizContainer.querySelectorAll(
            ".quiz-option"
        );


    optionButtons.forEach(
        function (
            button
        ) {

            const index =
                Number(
                    button.dataset.answerIndex
                );


            if (
                index ===
                Number(
                    correctIndex
                )
            ) {

                button.classList.add(
                    "correct"
                );

            }


            if (
                index ===
                selectedIndex &&
                index !==
                Number(
                    correctIndex
                )
            ) {

                button.classList.add(
                    "incorrect"
                );

            }

        }
    );


    const feedback =
        document.getElementById(
            "quizFeedback"
        );


    if (!feedback) {
        return;
    }


    if (
        selectedIndex ===
        Number(
            correctIndex
        )
    ) {

        feedback.className =
            "quiz-feedback correct-feedback";


        feedback.textContent =
            "✓ Correct!";

    }

    else {

        feedback.className =
            "quiz-feedback incorrect-feedback";


        feedback.textContent =
            "✗ Incorrect. The correct answer is highlighted.";

    }

}


/* ============================================================
   GET CORRECT QUIZ ANSWER
============================================================ */

function getQuizCorrectAnswer(
    item
) {

    if (
        !item ||
        typeof item !== "object"
    ) {

        return null;

    }


    /*
     * Direct numeric answer.
     */

    if (
        item.correct_answer !==
        undefined
    ) {

        return normalizeCorrectAnswer(
            item.correct_answer
        );

    }


    if (
        item.correctAnswer !==
        undefined
    ) {

        return normalizeCorrectAnswer(
            item.correctAnswer
        );

    }


    if (
        item.correct_index !==
        undefined
    ) {

        return normalizeCorrectAnswer(
            item.correct_index
        );

    }


    if (
        item.correctIndex !==
        undefined
    ) {

        return normalizeCorrectAnswer(
            item.correctIndex
        );

    }


    /*
     * Some quiz generators use:
     *
     * answer: "A"
     * answer: "B"
     */

    if (
        item.answer !==
        undefined
    ) {

        return normalizeCorrectAnswer(
            item.answer
        );

    }


    return null;

}


/* ============================================================
   NORMALIZE CORRECT ANSWER
============================================================ */

function normalizeCorrectAnswer(
    answer
) {

    if (
        typeof answer ===
        "number"
    ) {

        return answer;

    }


    if (
        typeof answer !==
        "string"
    ) {

        return null;

    }


    const cleaned =
        answer
            .trim()
            .toUpperCase();


    const letterMap = {
        "A": 0,
        "B": 1,
        "C": 2,
        "D": 3,
        "E": 4,
        "F": 5
    };


    if (
        letterMap[
            cleaned
        ] !== undefined
    ) {

        return letterMap[
            cleaned
        ];

    }


    const match =
        cleaned.match(
            /^\d+$/
        );


    if (match) {

        const number =
            Number(
                cleaned
            );


        /*
         * Support both:
         *
         * 0-based: 0,1,2,3
         *
         * 1-based: 1,2,3,4
         *
         * We default to zero-based when 0 exists.
         */

        return number;

    }


    return null;

}


/* ============================================================
   PODCAST SCRIPT
============================================================ */

function renderPodcastScript(
    script
) {

    if (!podcastStatus) {
        return;
    }


    if (
        script &&
        (
            typeof script ===
                "string" ||
            typeof script ===
                "object"
        )
    ) {

        podcastStatus.textContent =
            "Your AI-generated learning podcast script is ready.";

    }

}


/* ============================================================
   PODCAST AUDIO
============================================================ */

function setupPodcast(
    url
) {

    if (
        !url ||
        !podcastAudio
    ) {

        return;

    }


    audioUrl =
        url;


    console.log(
        "Podcast audio URL received."
    );


    podcastAudio.pause();


    podcastAudio.src =
        url;


    podcastAudio.load();


    if (podcastStatus) {

        podcastStatus.textContent =
            "Your AI-generated learning podcast is ready. Press play to listen.";

    }


    podcastAudio.addEventListener(
        "loadedmetadata",
        function () {

            console.log(
                "Podcast audio metadata loaded."
            );

        },
        {
            once: true
        }
    );


    podcastAudio.addEventListener(
        "error",
        function () {

            console.error(
                "Podcast audio could not be loaded:",
                podcastAudio.error
            );


            if (podcastStatus) {

                podcastStatus.textContent =
                    "The podcast was generated, but the audio could not be loaded in the browser.";

            }

        }
    );

}


/* ============================================================
   NORMALIZE ARRAY
============================================================ */

function normalizeArray(
    value
) {

    if (
        Array.isArray(value)
    ) {

        return value;

    }


    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {

        return [];

    }


    /*
     * Sometimes Bedrock output may return
     * a JSON string containing an array.
     */

    if (
        typeof value ===
        "string"
    ) {

        try {

            const parsed =
                JSON.parse(
                    value
                );


            if (
                Array.isArray(parsed)
            ) {

                return parsed;

            }

        }

        catch (error) {

            /*
             * It may be a newline-separated list.
             */

            const lines =
                value
                    .split("\n")
                    .map(
                        line =>
                            line
                                .replace(
                                    /^\s*[-•*]\s*/,
                                    ""
                                )
                                .trim()
                    )
                    .filter(Boolean);


            if (
                lines.length > 1
            ) {

                return lines;

            }

        }


        return [value];

    }


    if (
        typeof value ===
        "object"
    ) {

        /*
         * Handle object containing an array.
         */

        const candidates = [
            value.items,
            value.data,
            value.results,
            value.questions,
            value.cards,
            value.points
        ];


        for (
            const candidate
            of candidates
        ) {

            if (
                Array.isArray(candidate)
            ) {

                return candidate;

            }

        }


        return [value];

    }


    return [];

}


/* ============================================================
   VALUE → READABLE TEXT
============================================================ */

function valueToReadableText(
    value
) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    if (
        typeof value ===
        "string"
    ) {

        return value.trim();

    }


    if (
        typeof value ===
        "number" ||
        typeof value ===
        "boolean"
    ) {

        return String(
            value
        );

    }


    if (
        Array.isArray(value)
    ) {

        return value
            .map(
                item =>
                    valueToReadableText(
                        item
                    )
            )
            .filter(Boolean)
            .join("\n\n");

    }


    if (
        typeof value ===
        "object"
    ) {

        /*
         * Prefer meaningful content fields.
         */

        const preferredKeys = [
            "text",
            "content",
            "summary",
            "description",
            "explanation",
            "answer",
            "response",
            "value"
        ];


        for (
            const key
            of preferredKeys
        ) {

            if (
                value[key] !== undefined &&
                value[key] !== null
            ) {

                const text =
                    valueToReadableText(
                        value[key]
                    );


                if (text) {
                    return text;
                }

            }

        }


        try {

            return JSON.stringify(
                value,
                null,
                2
            );

        }

        catch (error) {

            return String(
                value
            );

        }

    }


    return String(
        value
    );

}


/* ============================================================
   TABS
============================================================ */

function setupTabs() {

    const tabButtons =
        document.querySelectorAll(
            ".tab"
        );


    const panels =
        document.querySelectorAll(
            ".panel"
        );


    tabButtons.forEach(
        function (
            button
        ) {

            button.addEventListener(
                "click",
                function () {

                    const target =
                        button.dataset.tab;


                    if (!target) {
                        return;
                    }


                    tabButtons.forEach(
                        function (
                            item
                        ) {

                            item.classList.remove(
                                "active"
                            );


                            item.setAttribute(
                                "aria-selected",
                                "false"
                            );

                        }
                    );


                    panels.forEach(
                        function (
                            panel
                        ) {

                            panel.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    button.setAttribute(
                        "aria-selected",
                        "true"
                    );


                    const targetPanel =
                        document.getElementById(
                            target
                        );


                    if (
                        targetPanel
                    ) {

                        targetPanel.classList.add(
                            "active"
                        );

                    }

                }
            );

        }
    );

}


/* ============================================================
   NAVIGATION
============================================================ */

function setupNavigation() {

    const navLinks =
        document.querySelectorAll(
            ".navbar-nav a"
        );


    navLinks.forEach(
        function (
            link
        ) {

            link.addEventListener(
                "click",
                function () {

                    /*
                     * If My Notes is clicked,
                     * make sure workspace is visible
                     * if a document has already been uploaded.
                     */

                    const target =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        target ===
                        "#workspace" &&
                        workspace &&
                        !workspace.classList.contains(
                            "hidden"
                        )
                    ) {

                        setTimeout(
                            function () {

                                workspace.scrollIntoView({
                                    behavior:
                                        "smooth"
                                });

                            },
                            50
                        );

                    }

                }
            );

        }
    );

}


/* ============================================================
   DEBUG HELPER
============================================================ */

window.NoteCastAI = {

    getState:
        function () {

            return {
                apiUrl:
                    API_URL,

                currentUploadKey:
                    currentUploadKey,

                currentFileName:
                    currentFileName,

                flashcards:
                    currentFlashcards.length,

                quiz:
                    currentQuiz.length,

                audioUrl:
                    audioUrl

            };

        },


    checkAPI:
        async function () {

            try {

                const response =
                    await fetch(
                        API_URL,
                        {
                            method:
                                "OPTIONS"
                        }
                    );


                console.log(
                    "API OPTIONS status:",
                    response.status
                );


                return response.status;

            }

            catch (error) {

                console.error(
                    "API check failed:",
                    error
                );


                return null;

            }

        }

};


/* ============================================================
   FINAL LOG
============================================================ */

console.log(
    "NoteCast AI app.js loaded successfully."
);