let gameState = {
    currentScene: "scene_1",
    courage: 50,
    fear: 0,
    curiosity: 50,
    observation: 50,
    inventory: [],
    journals: []
};

let researchLog = {
    startTime: null,
    endTime: null,
    totalPlayTime: 0,
    choiceHistory: []
};

// ตัวแปรควบคุมเอฟเฟคพิมพ์ดีด
let typewriterTimeout;

// ==========================================
// 🖼️ SCENE IMAGE MAP — แมพรูปภาพประกอบแต่ละฉาก
// ==========================================
const sceneImages = {
    "scene_1": "images/scene_entrance.png",
    "scene_2": "images/scene_lobby.png",
    "scene_3": "images/scene_lobby.png",
    "scene_4": "images/scene_phone.png",
    "scene_5": "images/scene_elevator.png",
    "ending_a": "images/scene_ending.png"
};

// ==========================================
// 🔊 AUDIO MANAGER (ใช้ Web Audio API สังเคราะห์เสียง ไม่ต้องโหลดไฟล์ .mp3)
// ==========================================
function playSoundEffect(type) {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        if (type === "click") {
            oscillator.type = 'triangle';
            oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.05);
        }
        else if (type === "phone") {
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        }
        else if (type === "jumpscare") {
            oscillator.type = 'sawtooth';
            oscillator.frequency.setValueAtTime(80, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.4);
            gainNode.gain.setValueAtTime(0.4, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            oscillator.start();
            oscillator.stop(audioCtx.currentTime + 0.5);
        }
    } catch (e) {
        console.log("Audio Context ยังไม่ทำงานจนกว่าผู้เล่นจะมีปฏิสัมพันธ์กับหน้าจอ");
    }
}

// ==========================================
// ⌨️ TYPEWRITER EFFECT (ลูกเล่นตัวพิมพ์ดีด)
// ==========================================
function typeWriter(text, i, fnCallback) {
    const element = document.getElementById("scene-text");

    // เคลียร์ค่า timeout เก่ากรณีผู้เล่นกดข้ามไว
    if (i === 0) element.innerHTML = "";

    if (i < text.length) {
        element.innerHTML += text.charAt(i);
        // เปิดเสียงกิ๊กๆ ตามจังหวะตัวอักษรวิ่ง (สุ่มไม่ให้รำคาญเกินไป)
        if (i % 3 === 0) playSoundEffect("click");

        typewriterTimeout = setTimeout(function () {
            typeWriter(text, i + 1, fnCallback);
        }, 30); // ความเร็วของตัวอักษร (มิลลิวินาที)
    } else if (typeof fnCallback == 'function') {
        fnCallback(); // เมื่อพิมพ์เสร็จ ค่อยเรียกฟังก์ชันโชว์ปุ่ม
    }
}

// ==========================================
// 🖼️ SCENE IMAGE TRANSITION
// ==========================================
function updateSceneImage(sceneId) {
    const wrapper = document.getElementById("scene-image-wrapper");
    const img = document.getElementById("scene-image");
    const newSrc = sceneImages[sceneId];

    if (newSrc && img.src !== newSrc) {
        // Fade out
        wrapper.classList.add("scene-transitioning");
        setTimeout(() => {
            img.src = newSrc;
            img.alt = "ฉาก: " + sceneId;
            // Fade in after image loads
            img.onload = () => {
                wrapper.classList.remove("scene-transitioning");
            };
            // Fallback: remove class even if onload doesn't fire
            setTimeout(() => {
                wrapper.classList.remove("scene-transitioning");
            }, 500);
        }, 300);
    }
}

// ==========================================
// 🕹️ SCENE MANAGER WITH EFFECTS
// ==========================================
const scenes = {
    "scene_1": {
        text: "ปี พ.ศ.2569 ณ อาคารศิลปกรรมหลังเก่าที่ปิดตายมา 20 ปี... คุณยืนอยู่หน้าประตูทางเข้า บรรยากาศเงียบสงัด ลุงภารโรงเดินมาส่งพลางพูดว่า 'ถ้าได้ยินเสียงเรียกชื่อ... อย่าหันหลัง' คุณจะทำอย่างไร?",
        playSound: null,
        triggerGlitch: false,
        choices: [
            { text: "🚪 เปิดประตูเดินเข้าไปทันที", nextScene: "scene_2", effects: { courage: +10, fear: +5 }, logTag: "enter_boldly" },
            { text: "🔦 หยุดเช็กอุปกรณ์ (เปิดไฟฉายและกล้อง) ก่อนเข้า", nextScene: "scene_2", effects: { observation: +10 }, itemGiven: "flashlight", logTag: "enter_cautious" }
        ]
    },
    "scene_2": {
        text: "คุณเข้ามาในล็อบบี้ กลิ่นอับและฝุ่นตลบอบอวล ที่โต๊ะประชาสัมพันธ์เก่ามี 'สมุดลงชื่อ' วางอยู่ และข้างๆ มีบอร์ดประกาศเก่าๆ ที่กระดาษเริ่มเปื่อย",
        playSound: null,
        triggerGlitch: false,
        choices: [
            { text: "📖 เดินไปเปิดสมุดลงชื่อเพื่อดูรายชื่อคนล่าสุด", nextScene: "scene_3", effects: { curiosity: +10, fear: +10 }, journalGiven: "Journal 02", logTag: "check_register" },
            { text: "📋 เดินไปตรวจดูบอร์ดประกาศเก่า", nextScene: "scene_3", effects: { observation: +10 }, journalGiven: "Journal 01", logTag: "check_board" }
        ]
    },
    "scene_3": {
        text: "เมื่อคุณเดินมาดูประกาศเก่า ลมเย็นยะเยือกสายหนึ่งพัดผ่านตัวคุณไป บนบอร์ดมีเศษกระดาษระบุประกาศอย่างเป็นทางการปี 2544: 'ปิดตายอาคารศิลปกรรมชั่วคราวเนื่องจากเหตุสุดวิสัย' และมีรอยขีดข่วนลึกด้วยของมีคมทับคำว่า 'เหตุสุดวิสัย' ราวกับคนทำต้องการซ่อนบางอย่าง",
        playSound: null,
        triggerGlitch: false,
        choices: [
            { text: "✋ พยายามใช้มือแกะและลอกเศษกระดาษเพื่อดูข้อความที่ซ่อนอยู่ข้างหลัง", nextScene: "scene_4", effects: { curiosity: +15, fear: +5 }, logTag: "scratch_board" },
            { text: "📸 ถ่ายรูปประกาศเก็บไว้ด้วยกล้อง DSLR แล้วเดินมุ่งหน้าไปห้องประชาสัมพันธ์", nextScene: "scene_4", effects: { observation: +15 }, logTag: "take_photo" }
        ]
    },
    "scene_4": {
        text: "คุณเข้ามาในห้องประชาสัมพันธ์ที่บรรยากาศมืดสนิท บนโต๊ะมีสมุดบันทึกเหตุการณ์เปิดทิ้งไว้ หน้าล่าสุดเขียนไว้เมื่อ 20 ปีก่อน: 'ธีรภัทร หายตัวไปในลิฟต์... ห้ามใครกดขึ้นชั้น 13 เด็ดขาด' ทันใดนั้น โทรศัพท์บ้านรุ่นเก่าบนโต๊ะก็ส่งเสียงดังขึ้นสนั่นตึก! 'กริ๊งงงง!'",
        playSound: "phone",
        triggerGlitch: false,
        choices: [
            { text: "📞 รวบรวมความกล้าเดินไปรับสายโทรศัพท์เพื่อฟังเสียงปลายสาย", nextScene: "scene_5", effects: { courage: +20, fear: +20 }, logTag: "answer_phone" },
            { text: "🗄️ ไม่รับสาย แต่รีบเปิดลิ้นชักโต๊ะทำงานเพื่อหาของที่เป็นประโยชน์ก่อนเสียงเงียบ", nextScene: "scene_5", effects: { observation: +10, curiosity: +10 }, itemGiven: "key", logTag: "search_drawer" }
        ]
    },
    "scene_5": {
        text: "คุณมาหยุดยืนอยู่หน้าลิฟต์เก่า เสียงโทรศัพท์ดับวูบลงไป ทว่าอยู่ๆ ไฟลิฟต์สว่างวาบขึ้นมา ประตูเหล็กเลื่อนเปิดออกเองอย่างช้าๆ ภายในว่างเปล่าและมืดมิด... ปล่อยกลิ่นเหม็นอับรุนแรงลอยออกมากระทบหน้าอย่างจัง!!",
        playSound: "jumpscare",
        triggerGlitch: true,
        choices: [
            { text: "🛗 ก้าวเท้าเข้าไปในลิฟต์ เพื่อลองกดปุ่มหาทางขึ้นไปชั้นบน", nextScene: "ending_a", effects: { courage: +15, fear: +10 }, logTag: "enter_elevator" },
            { text: "🪜 ไม่ไว้ใจระบบลิฟต์ หันหลังไปใช้บันไดหนีไฟมืดๆ ข้างลิฟต์แทน", nextScene: "ending_a", effects: { observation: +10, fear: +5 }, logTag: "use_stairs" }
        ]
    },
    "ending_a": {
        text: "เกมจบลง (Ending A — รอดชีวิต): คุณตัดสินใจหนีออกจากตึกสำเร็จ อาคารหลังนี้กำลังจะถูกทุบทำลายไปพร้อมกับความลับของธีรภัทร...",
        playSound: null,
        triggerGlitch: false,
        choices: []
    }
};

function renderScene(sceneId) {
    clearTimeout(typewriterTimeout);
    const scene = scenes[sceneId];
    gameState.currentScene = sceneId;

    // 🖼️ 0. อัปเดตรูปภาพประกอบฉาก
    updateSceneImage(sceneId);

    // 📺 1. จัดการกิมมิคหน้าจอ Glitch/สั่น
    const container = document.querySelector(".game-container");
    if (scene.triggerGlitch) {
        container.classList.add("glitch-effect");
        setTimeout(() => container.classList.remove("glitch-effect"), 500);
    }

    // 🔊 2. จัดการเอฟเฟคเสียงประจำฉาก
    if (scene.playSound) {
        playSoundEffect(scene.playSound);
    }

    // ล้างปุ่มชอยส์ไว้ก่อน รอข้อความพิมพ์เสร็จค่อยแสดง
    const choiceContainer = document.getElementById("choice-container");
    choiceContainer.innerHTML = "";

    // ⌨️ 3. เรียกใช้ลูกเล่นตัวพิมพ์ดีด เมื่อพิมพ์เสร็จค่อยให้วาดปุ่มตัวเลือก (Callback)
    typeWriter(scene.text, 0, () => {
        if (scene.choices.length === 0) {
            handleGameEnd();
            return;
        }

        scene.choices.forEach(choice => {
            const button = document.createElement("button");
            button.innerText = choice.text;
            button.className = "btn-choice";
            button.onclick = () => {
                playSoundEffect("click");
                processChoice(choice);
            };
            choiceContainer.appendChild(button);
        });
    });

    updateHUD();
}

function processChoice(choice) {
    researchLog.choiceHistory.push({
        fromScene: gameState.currentScene,
        choiceSelected: choice.logTag,
        timestamp: Date.now() - researchLog.startTime
    });

    if (choice.effects) {
        if (choice.effects.courage) gameState.courage += choice.effects.courage;
        if (choice.effects.fear) gameState.fear += choice.effects.fear;
        if (choice.effects.curiosity) gameState.curiosity += choice.effects.curiosity;
        if (choice.effects.observation) gameState.observation += choice.effects.observation;

        gameState.fear = Math.max(0, Math.min(100, gameState.fear));
        gameState.courage = Math.max(0, Math.min(100, gameState.courage));
    }

    if (choice.itemGiven && !gameState.inventory.includes(choice.itemGiven)) gameState.inventory.push(choice.itemGiven);
    if (choice.journalGiven && !gameState.journals.includes(choice.journalGiven)) gameState.journals.push(choice.journalGiven);

    renderScene(choice.nextScene);
}

function updateHUD() {
    const courageEl = document.getElementById("val-courage");
    const fearEl = document.getElementById("val-fear");
    const itemsEl = document.getElementById("val-items");
    const barCourage = document.getElementById("bar-courage");
    const barFear = document.getElementById("bar-fear");

    courageEl.innerText = gameState.courage;
    fearEl.innerText = gameState.fear;
    itemsEl.innerText = gameState.inventory.length > 0
        ? gameState.inventory.join(", ")
        : "—";

    // Animate progress bars
    barCourage.style.width = gameState.courage + "%";
    barFear.style.width = gameState.fear + "%";
}

// ==========================================
// ⚠️ INITIALIZATION WITH INITIAL WARNING
// ==========================================
window.onload = () => {
    // ดักปุ่มกด Consent เพื่อปิดหน้าจอคำเตือนแล้วเข้าเกม
    document.getElementById("btn-consent").onclick = () => {
        document.getElementById("warning-screen").classList.add("hidden");
        document.getElementById("game-interface").classList.remove("hidden");

        // เริ่มจับเวลาการวิจัยจริงหลังจากกดยอมรับคำเตือน
        researchLog.startTime = Date.now();
        renderScene("scene_1");
    };
};

function handleGameEnd() {
    researchLog.endTime = Date.now();
    researchLog.totalPlayTime = Math.floor((researchLog.endTime - researchLog.startTime) / 1000);

    // 1. แสดงข้อความจบเกม
    document.getElementById("choice-container").innerHTML =
        '<div class="game-end-msg">🏁 บันทึกข้อมูลการวิจัยเสร็จสิ้น — ขอบคุณที่ร่วมการทดลอง</div>';

    // 2. แสดงพื้นที่ทำแบบประเมินท้ายเกม
    const summaryContainer = document.getElementById("research-summary-container");
    summaryContainer.classList.remove("hidden");

    // 3. ดักจับการส่งฟอร์มแบบประเมิน
    const surveyForm = document.getElementById("survey-form");
    surveyForm.onsubmit = (e) => {
        e.preventDefault();

        // บันทึกคำตอบจากแบบประเมินลงใน log วิจัย
        const formData = new FormData(surveyForm);
        researchLog.surveyAnswers = {
            emotionalLevel: formData.get("q1"),
            immersionEffect: formData.get("q2")
        };

        // ซ่อนฟอร์มหลังจากกดส่งแล้ว
        surveyForm.classList.add("hidden");

        // เรียกฟังก์ชันคำนวณและแสดงผลพฤติกรรมผู้เล่น
        showPsychologicalDashboard();
    };
}

// ==========================================
// 📈 ฟังก์ชันคำนวณและแสดงผลสรุปพฤติกรรม (สำหรับผู้เล่นและผู้วิจัย)
// ==========================================
function showPsychologicalDashboard() {
    // 1. คำนวณหา "สไตล์การเล่น"
    let playerStyle = "";

    if (gameState.currentScene === "ending_c") {
        playerStyle = "🎲 ผู้เสี่ยงภัยที่ไร้ความระมัดระวัง (Impulsive Explorer) — คุณมีความอยากรู้อยากเห็นสูงมากจนยอมมองข้ามคำเตือนของลุงภารโรง ทำให้คุณหันหลังกลับไปและติดอยู่ในลูป";
    } else if (gameState.currentScene === "ending_d") {
        playerStyle = "😰 ผู้เล่นที่ถูกครอบงำด้วยความวิตกกังวล (High Anxiety Passive) — ค่าความกลัวที่สูงเกินไปในฉากกดดัน ทำให้คุณตัดสินใจล่าช้าหรือเลือกชอยส์ที่หลบหนีปัญหา";
    } else if (gameState.courage > 65 && gameState.observation > 60) {
        playerStyle = "🕵️ นักสืบผู้รอบคอบและกล้าหาญ (Rational Investigator) — คุณรักษาสมดุลระหว่างความกล้าและการสังเกตได้ดีมาก สามารถไขปริศนาและเอาชีวิตรอดออกมาพร้อมหลักฐาน";
    } else {
        playerStyle = "🏃 ผู้รอดชีวิตตามสัญชาตญาณ (Pure Survivor) — คุณเน้นทำตามกฎและความปลอดภัยเป็นหลัก ไม่สนการค้นหาความจริงลึกๆ มุ่งเป้าไปที่การเอาตัวรอดจากตัวตึกอย่างรวดเร็ว";
    }

    // 2. อัปเดตข้อมูลขึ้นหน้าจอ Dashboard
    document.getElementById("summary-time").innerText = researchLog.totalPlayTime;
    document.getElementById("summary-courage").innerText = gameState.courage;
    document.getElementById("summary-fear").innerText = gameState.fear;
    document.getElementById("summary-style").innerText = playerStyle;

    // 3. แปลงข้อมูลทั้งหมดเป็น JSON
    const finalResearchOutput = {
        playerMetadata: {
            timestamp: new Date().toISOString(),
            finalEnding: gameState.currentScene
        },
        gameStats: gameState,
        behaviorLogs: researchLog
    };

    document.getElementById("raw-json-output").value = JSON.stringify(finalResearchOutput, null, 2);

    // 4. เปิดแสดงหน้าจอ Dashboard
    document.getElementById("psych-dashboard").classList.remove("hidden");
}
