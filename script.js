let currentChapter = 0;

let survival = 0;
let curiosity = 0;
let courage = 0;

let selectedEnding = "";

let playStartTime = Date.now();

let playerChoices = [];

// ==========================
// STORY
// ==========================

const chapters = [

    {
        title: "บทที่ 1 : เสียงเรียกยามเที่ยงคืน",

        image: "assets/images/scene1.jpg",

        story: `
เวลา 00:37 น.

คุณเพิ่งออกจากห้องโปรเจกต์ของมหาวิทยาลัย

คืนนี้ทั้งอาคารเงียบผิดปกติ

ระหว่างเดินกลับหอพัก

จู่ ๆ คุณได้ยินเสียงเรียกชื่อจากด้านหลัง

"(ชื่อคุณ)..."

ไม่มีใครอยู่บริเวณนั้น

แต่เสียงนั้นดังขึ้นอีกครั้ง...
`,

        choices: [

            {
                text: "หันกลับไปดู",

                survival: -1,
                curiosity: 3,
                courage: 1,

                feedback: `
คุณหันกลับไปทันที

ปลายถนนว่างเปล่า

แต่ใต้เสาไฟดวงสุดท้าย

มีเงาคนยืนอยู่...
`
            },

            {
                text: "เดินต่อโดยไม่สนใจ",

                survival: 3,
                curiosity: 0,
                courage: 0,

                feedback: `
คุณเร่งฝีเท้า

และพยายามไม่สนใจเสียงเรียก

แม้จะรู้สึกว่ามีใครกำลังเดินตามอยู่
`
            },

            {
                text: "โทรหาเพื่อน",

                survival: 1,
                curiosity: 1,
                courage: 1,

                feedback: `
คุณหยิบโทรศัพท์ขึ้นมา

แต่หน้าจอกลับขึ้นข้อความ

"อย่าหันหลัง"
`
            }

        ]

    },

    {
        title: "บทที่ 2 : ลิฟต์ชั้น 13",

        image: "assets/images/scene2.jpg",

        story: `
เมื่อกลับถึงหอพัก

คุณรีบขึ้นลิฟต์

ทั้งที่อาคารนี้มีเพียง 12 ชั้น

แต่จู่ ๆ ลิฟต์กลับหยุดที่ชั้น 13

ประตูค่อย ๆ เปิดออก

เบื้องหน้าคือทางเดินมืดสนิท

และมีใครบางคนยืนอยู่ปลายทางเดิน...
`,

        choices: [

            {
                text: "เดินออกไปดู",

                survival: -1,
                curiosity: 3,
                courage: 2,

                feedback: `
คุณก้าวออกจากลิฟต์

เงาคนนั้นเริ่มเดินเข้าหาคุณ

อย่างช้า ๆ
`
            },

            {
                text: "กดปิดประตูลิฟต์",

                survival: 3,
                curiosity: 0,
                courage: 0,

                feedback: `
คุณพยายามกดปิดประตู

แต่ปุ่มไม่ตอบสนอง
`
            },

            {
                text: "หยิบโทรศัพท์ขึ้นมาถ่ายรูป",

                survival: 0,
                curiosity: 2,
                courage: 3,

                feedback: `
เมื่อมองภาพที่ถ่ายได้

เงาคนนั้นกำลังยืนอยู่ด้านหลังคุณ
`
            }

        ]

    }

];

// ==========================
// ELEMENTS
// ==========================

const introScreen = document.getElementById("introScreen");
const guideScreen = document.getElementById("guideScreen");
const playerScreen = document.getElementById("playerScreen");

const gameScreen = document.getElementById("gameScreen");
const feedbackScreen = document.getElementById("feedbackScreen");

const endingScreen = document.getElementById("endingScreen");
const surveyScreen = document.getElementById("surveyScreen");
const certificateScreen = document.getElementById("certificateScreen");

const storyText = document.getElementById("storyText");
const choiceContainer = document.getElementById("choiceContainer");

const chapterLabel = document.getElementById("chapterLabel");
const sceneImage = document.getElementById("sceneImage");

const feedbackText = document.getElementById("feedbackText");

// ==========================
// TYPEWRITER
// ==========================

function typeWriter(text, element, speed = 25) {

    element.innerHTML = "";

    let i = 0;

    function typing() {

        if (i < text.length) {

            element.innerHTML += text.charAt(i);

            i++;

            setTimeout(typing, speed);

        }

    }

    typing();

}

// ==========================
// SCREEN
// ==========================

function showScreen(screen) {

    document
        .querySelectorAll(".screen")
        .forEach(screen => {

            screen.classList.remove("active");

        });

    screen.classList.add("active");

}

// ==========================
// PROGRESS BAR
// ==========================

function updateProgress() {

    const percent =
        ((currentChapter) / chapters.length) * 100;

    document.getElementById("progressBar")
        .style.width = percent + "%";

}

// ==========================
// INTRO
// ==========================

window.onload = () => {

    typeWriter(
        `เวลา 00:37 น.

คุณกำลังเดินกลับหอพักเพียงลำพัง...

และมีบางอย่างกำลังเฝ้ามองคุณอยู่`,
        document.getElementById("introTypewriter"),
        30
    );

};

// ==========================
// GUIDE
// ==========================

document
    .getElementById("guideBtn")
    .addEventListener("click", () => {

        showScreen(guideScreen);

    });

document
    .getElementById("backIntroBtn")
    .addEventListener("click", () => {

        showScreen(introScreen);

    });

// ==========================
// START GAME
// ==========================

document
    .getElementById("startBtn")
    .addEventListener("click", () => {

        showScreen(playerScreen);

    });

// ==========================
// PLAYER FORM
// ==========================

document
    .getElementById("playerForm")
    .addEventListener("submit", (e) => {

        e.preventDefault();

        showScreen(gameScreen);

        loadChapter();

    });

// ==========================
// LOAD CHAPTER
// ==========================

function loadChapter() {

    updateProgress();

    const chapter =
        chapters[currentChapter];

    chapterLabel.innerText =
        chapter.title;

    sceneImage.src =
        chapter.image;

    typeWriter(
        chapter.story,
        storyText,
        20
    );

    choiceContainer.innerHTML = "";

    chapter.choices.forEach(choice => {

        const btn =
            document.createElement("button");

        btn.className =
            "choice-btn";

        btn.innerText =
            choice.text;

        btn.onclick = () => {

            choose(choice);

        };

        choiceContainer.appendChild(btn);

    });

}

// ==========================
// CHOOSE
// ==========================

function choose(choice) {

    survival += choice.survival;
    curiosity += choice.curiosity;
    courage += choice.courage;

    playerChoices.push(choice.text);

    feedbackText.innerText =
        choice.feedback;

    showScreen(feedbackScreen);

}

// ==========================
// CONTINUE
// ==========================

document
    .getElementById("continueBtn")
    .addEventListener("click", () => {

        currentChapter++;

        if (currentChapter >= chapters.length) {

            showEnding();

            return;

        }

        showScreen(gameScreen);

        loadChapter();

    });

// ==========================
// ENDING
// ==========================

function showEnding() {

    showScreen(endingScreen);

    const endingBox =
        document.getElementById("endingResult");

    if (

        playerChoices.includes("หันกลับไปดู")
        &&
        playerChoices.includes("เดินออกไปดู")

    ) {

        selectedEnding =
            "🔴 อย่าหันหลัง";

        endingBox.innerHTML = `
<h2>🔴 อย่าหันหลัง</h2>
<p>
เช้าวันต่อมา

ไม่มีใครพบตัวคุณอีกเลย
</p>
`;

    }
    else if (

        survival >= curiosity &&
        survival >= courage

    ) {

        selectedEnding =
            "🟢 ผู้รอดชีวิต";

        endingBox.innerHTML = `
<h2>🟢 ผู้รอดชีวิต</h2>
<p>
คุณรอดออกจากเหตุการณ์ทั้งหมด
</p>
`;

    }
    else if (

        curiosity >= courage

    ) {

        selectedEnding =
            "🟡 ผู้ค้นพบความจริง";

        endingBox.innerHTML = `
<h2>🟡 ผู้ค้นพบความจริง</h2>
<p>
คุณค้นพบความลับที่ซ่อนอยู่
</p>
`;

    }
    else {

        selectedEnding =
            "🟠 ผู้กล้าเผชิญหน้า";

        endingBox.innerHTML = `
<h2>🟠 ผู้กล้าเผชิญหน้า</h2>
<p>
คุณเลือกเผชิญหน้ากับทุกสิ่ง
</p>
`;

    }

    document.getElementById(
        "survivalScore"
    ).innerText = survival;

    document.getElementById(
        "curiosityScore"
    ).innerText = curiosity;

    document.getElementById(
        "courageScore"
    ).innerText = courage;

}

// ==========================
// SURVEY
// ==========================

document
    .getElementById("goSurveyBtn")
    .addEventListener("click", () => {

        showScreen(surveyScreen);

    });

document
    .getElementById("surveyForm")
    .addEventListener("submit", (e) => {

        e.preventDefault();

        generateCertificate();

        showScreen(certificateScreen);

    });

// ==========================
// CERTIFICATE
// ==========================

function generateCertificate() {

    document
        .getElementById("certificateEnding")
        .innerText =
        selectedEnding;

    const totalTime =
        Math.floor(
            (Date.now() - playStartTime)
            / 1000
        );

    const mins =
        Math.floor(totalTime / 60);

    const secs =
        totalTime % 60;

    document
        .getElementById("playTime")
        .innerText =
        `${mins}:${secs.toString().padStart(2, "0")}`;

}

// ==========================
// DOWNLOAD PNG
// ==========================

document
    .getElementById("downloadBtn")
    .addEventListener("click", () => {

        html2canvas(
            document.getElementById("certificate")
        )
            .then(canvas => {

                const link =
                    document.createElement("a");

                link.download =
                    "dont-look-back-result.png";

                link.href =
                    canvas.toDataURL();

                link.click();

            });

    });

// ==========================
// RESTART
// ==========================

document
    .getElementById("restartBtn")
    .addEventListener("click", () => {

        location.reload();

    });

// ==========================
// SOUND
// ==========================

let soundEnabled = true;

document
    .getElementById("soundToggle")
    .addEventListener("click", () => {

        const wind =
            document.getElementById("windAudio");

        soundEnabled = !soundEnabled;

        if (soundEnabled) {

            wind.play();

        }
        else {

            wind.pause();

        }

    });

