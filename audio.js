/**
 * audio.js
 * Web Audio APIを利用したSE生成・BGM管理モジュール
 */

const audioState = {
    context: null,
    bgmVolume: 0.5,
    seVolume: 0.5,
    bgmAudioEl: null,
    isMuted: false // 全体ミュートなど将来拡張用
};

/**
 * ユーザーインタラクション時にAudioContextを初期化
 * （ブラウザのAutoplayポリシー対策）
 */
function initAudio() {
    if (!audioState.context) {
        audioState.context = new (window.AudioContext || window.webkitAudioContext)();

        // 保存された設定を読み込み
        const savedBgmVol = localStorage.getItem('bgmVolume');
        const savedSeVol = localStorage.getItem('seVolume');
        if (savedBgmVol !== null) audioState.bgmVolume = parseFloat(savedBgmVol);
        if (savedSeVol !== null) audioState.seVolume = parseFloat(savedSeVol);

        // BGMプレイヤーのセットアップ
        audioState.bgmAudioEl = document.getElementById('bgm-player');
        if (audioState.bgmAudioEl) {
            audioState.bgmAudioEl.volume = audioState.bgmVolume;
        }

        console.log("Audio System Initialized");
    }
}

/**
 * 音量設定の更新
 */
function setBGMVolume(val) {
    audioState.bgmVolume = val;
    localStorage.setItem('bgmVolume', val);
    if (audioState.bgmAudioEl) {
        audioState.bgmAudioEl.volume = val;
    }
}

function setSEVolume(val) {
    audioState.seVolume = val;
    localStorage.setItem('seVolume', val);
}

/**
 * BGMの再生/停止
 */
function playBGM() {
    if (!audioState.context) return;
    if (audioState.bgmAudioEl && audioState.bgmAudioEl.paused) {
        audioState.bgmAudioEl.play().catch(e => console.warn("BGM Play Failed:", e));
    }
}

function stopBGM() {
    if (audioState.bgmAudioEl) {
        audioState.bgmAudioEl.pause();
        audioState.bgmAudioEl.currentTime = 0;
    }
}

/**
 * SEのプロシージャル生成・再生
 * 著作権フリーのレトロ風な音をオシレーターで合成します
 * @param {string} type - 'click', 'place', 'flip', 'win', 'lose', 'draw'
 */
function playSE(type) {
    if (!audioState.context || audioState.context.state !== 'running') return;
    if (audioState.seVolume <= 0) return;

    const ctx = audioState.context;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    // 全体のSE音量を反映
    const masterVol = audioState.seVolume;

    switch (type) {
        case 'click':
            // 短い「ピッ」
            osc.type = 'square';
            osc.frequency.setValueAtTime(600, t);
            osc.frequency.exponentialRampToValueAtTime(300, t + 0.05);
            gain.gain.setValueAtTime(0.5 * masterVol, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);
            osc.start(t);
            osc.stop(t + 0.05);
            break;

        case 'place':
            // 低く重い「バシッ」（カードを置いた音）
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, t);
            osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
            gain.gain.setValueAtTime(1.0 * masterVol, t);
            gain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);
            osc.start(t);
            osc.stop(t + 0.1);
            break;

        case 'flip':
            // 爽快な「シャラーン！」（カードがひっくり返った音）
            osc.type = 'sine';
            osc.frequency.setValueAtTime(800, t);
            osc.frequency.linearRampToValueAtTime(1200, t + 0.1);
            gain.gain.setValueAtTime(0.8 * masterVol, t);
            gain.gain.linearRampToValueAtTime(0.01, t + 0.3);

            // 少し和音をつけるともっと綺麗な音になるため、2つ目のオシレーターも並行して鳴らす
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'triangle';
            osc2.frequency.setValueAtTime(1200, t);
            osc2.frequency.linearRampToValueAtTime(1600, t + 0.1);
            gain2.gain.setValueAtTime(0.4 * masterVol, t);
            gain2.gain.linearRampToValueAtTime(0.01, t + 0.3);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);

            osc.start(t);
            osc.stop(t + 0.3);
            osc2.start(t);
            osc2.stop(t + 0.3);
            break;

        case 'win':
            // 勝利の短いファンファーレ（ド・ミ・ソ・ド）
            playTone(261.63, t, 0.15, 'triangle', masterVol);     // C4
            playTone(329.63, t + 0.15, 0.15, 'triangle', masterVol); // E4
            playTone(392.00, t + 0.3, 0.15, 'triangle', masterVol); // G4
            playTone(523.25, t + 0.45, 0.4, 'triangle', masterVol); // C5
            break;

        case 'rule':
            // 特殊ルール発動時の「ピロリン！」（和音を用いた通知音）
            playTone(659.25, t, 0.1, 'square', masterVol * 0.6);      // E5
            playTone(880.00, t + 0.1, 0.2, 'square', masterVol * 0.6); // A5
            break;

        case 'lose':
            // 敗北のどんよりした音（下降アルペジオ）
            playTone(300, t, 0.2, 'sawtooth', masterVol * 0.8);
            playTone(280, t + 0.2, 0.2, 'sawtooth', masterVol * 0.8);
            playTone(260, t + 0.4, 0.4, 'sawtooth', masterVol * 0.8);
            break;

        case 'draw':
            // 引き分けの間の抜けた音
            playTone(400, t, 0.2, 'square', masterVol * 0.5);
            playTone(400, t + 0.2, 0.2, 'square', masterVol * 0.5);
            break;
    }
}

/**
 * カスタム音程を鳴らすヘルパー（メロディ用）
 */
function playTone(freq, startTime, duration, type, masterVol) {
    const ctx = audioState.context;
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.value = freq;

    osc.connect(gain);
    gain.connect(ctx.destination);

    gain.gain.setValueAtTime(0.5 * masterVol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration);
}
