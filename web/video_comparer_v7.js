import { app } from "../../scripts/app.js";
import { api } from "../../scripts/api.js";

const NODE_ID = "IndiVideoComparer";
const DEFAULT_MAX_RECORDING_BYTES = 512 * 1024 * 1024;
const DEFAULT_MAX_RECORDING_SECONDS = 120;

function fileToUrl(file) {
  if (!file) return "";
  const params = new URLSearchParams({
    filename: file.filename,
    subfolder: file.subfolder || "",
    type: file.type || "temp",
    t: String(Date.now()),
  });
  return api.apiURL(`/view?${params.toString()}`);
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00.000";
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - minutes * 60;
  return `${minutes}:${remainder.toFixed(3).padStart(6, "0")}`;
}

function formatRecordingTime(seconds) {
  const wholeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
  const minutes = Math.floor(wholeSeconds / 60);
  const remainder = wholeSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(remainder).padStart(2, "0")}`;
}

function makeButton(text, title) {
  const button = document.createElement("button");
  button.type = "button";
  button.textContent = text;
  button.title = title;
  Object.assign(button.style, {
    border: "1px solid var(--border-color, #555)",
    borderRadius: "5px",
    background: "var(--comfy-input-bg, #2b2b2b)",
    color: "var(--input-text, #ddd)",
    cursor: "pointer",
    minWidth: "34px",
    height: "28px",
    padding: "0 8px",
  });
  return button;
}

function installComparer(node) {
  if (node.__indiVideoComparerInstalled) return;
  node.__indiVideoComparerInstalled = true;

  const root = document.createElement("div");
  Object.assign(root.style, {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    boxSizing: "border-box",
    padding: "2px",
    minHeight: "0",
    userSelect: "none",
  });

  const stage = document.createElement("div");
  Object.assign(stage.style, {
    position: "relative",
    width: "100%",
    height: "280px",
    minHeight: "120px",
    flex: "0 0 auto",
    aspectRatio: "16 / 9",
    overflow: "hidden",
    borderRadius: "6px",
    background: "#000",
    cursor: "ew-resize",
    touchAction: "none",
  });

  const videoB = document.createElement("video");
  const videoA = document.createElement("video");
  for (const video of [videoA, videoB]) {
    video.preload = "auto";
    video.playsInline = true;
    video.controls = false;
    video.loop = false;
    Object.assign(video.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      objectFit: "contain",
      background: "#000",
      pointerEvents: "none",
    });
    stage.appendChild(video);
  }
  videoB.muted = true;

  const divider = document.createElement("div");
  Object.assign(divider.style, {
    position: "absolute",
    top: "0",
    bottom: "0",
    width: "2px",
    background: "rgba(255,255,255,0.95)",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.45)",
    transform: "translateX(-1px)",
    pointerEvents: "none",
  });
  stage.appendChild(divider);

  const handle = document.createElement("div");
  handle.textContent = "↔";
  Object.assign(handle.style, {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    display: "grid",
    placeItems: "center",
    color: "#111",
    background: "rgba(255,255,255,0.92)",
    fontWeight: "700",
    fontSize: "18px",
    pointerEvents: "none",
  });
  divider.appendChild(handle);

  const labelA = document.createElement("span");
  const labelB = document.createElement("span");
  for (const label of [labelA, labelB]) {
    Object.assign(label.style, {
      position: "absolute",
      top: "8px",
      padding: "3px 7px",
      borderRadius: "4px",
      background: "rgba(0,0,0,0.65)",
      color: "#fff",
      font: "600 12px sans-serif",
      pointerEvents: "none",
    });
    stage.appendChild(label);
  }
  labelB.style.left = "8px";
  labelA.style.right = "8px";

  const status = document.createElement("div");
  status.textContent = "Connect two VIDEO inputs and queue the node.";
  Object.assign(status.style, {
    position: "absolute",
    inset: "0",
    display: "grid",
    placeItems: "center",
    color: "#aaa",
    font: "12px sans-serif",
    textAlign: "center",
    padding: "20px",
    pointerEvents: "none",
  });
  stage.appendChild(status);

  const controls = document.createElement("div");
  Object.assign(controls.style, {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    width: "100%",
  });

  const playButton = makeButton("▶", "Play / pause both videos");
  const recordButton = makeButton(
    "⏺ REC",
    "Record up to 2 minutes and send it through recorded_video to a connected Save Video node",
  );
  recordButton.style.minWidth = "62px";
  recordButton.style.color = "#ff7b7b";
  recordButton.setAttribute("aria-pressed", "false");
  const muteButton = makeButton("🔇", "Mute / unmute video A audio");
  const resetButton = makeButton("50%", "Reset comparison divider");
  const timeline = document.createElement("input");
  timeline.type = "range";
  timeline.min = "0";
  timeline.max = "1";
  timeline.step = "0.001";
  timeline.value = "0";
  timeline.title = "Seek both videos";
  Object.assign(timeline.style, { flex: "1", minWidth: "60px" });

  const timeLabel = document.createElement("span");
  timeLabel.textContent = "0:00.000 / 0:00.000";
  Object.assign(timeLabel.style, {
    color: "var(--input-text, #ccc)",
    font: "11px ui-monospace, monospace",
    whiteSpace: "nowrap",
  });

  controls.append(playButton, recordButton, timeline, timeLabel, muteButton, resetButton);
  root.append(stage, controls);

  const state = {
    split: 0.5,
    duration: 0,
    loop: true,
    muted: true,
    syncTolerance: 0.08,
    frameRequest: null,
    loadToken: 0,
    destroyed: false,
    aspectRatio: 16 / 9,
    recorder: null,
    recordingCanvas: null,
    recordingStream: null,
    recordingChunks: [],
    recordingBytes: 0,
    recordingLimitMessage: "",
    recordingTimer: null,
    recordingStartedAt: 0,
    publishRecording: true,
    maxRecordingBytes: DEFAULT_MAX_RECORDING_BYTES,
    maxRecordingSeconds: DEFAULT_MAX_RECORDING_SECONDS,
    lastLayoutWidth: 0,
    resizeObserver: null,
  };

  function applyResponsiveLayout(rootWidth) {
    const safeWidth = Math.max(184, Number(rootWidth) || 500);
    const previewWidth = safeWidth - 4;
    const previewHeight = Math.max(120, previewWidth / state.aspectRatio);
    stage.style.width = "100%";
    stage.style.height = `${previewHeight}px`;
    root.style.height = `${previewHeight + 42}px`;
    state.lastLayoutWidth = safeWidth;
    return previewHeight;
  }

  if (typeof ResizeObserver !== "undefined") {
    state.resizeObserver = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width || 0;
      if (width > 0 && Math.abs(width - state.lastLayoutWidth) > 0.5) {
        applyResponsiveLayout(width);
        node.graph?.setDirtyCanvas(true, true);
      }
    });
    state.resizeObserver.observe(root);
  }

  function setSplit(value) {
    state.split = Math.max(0.02, Math.min(0.98, Number(value) || 0.5));
    const percent = state.split * 100;
    videoA.style.clipPath = "none";
    videoB.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
    divider.style.left = `${percent}%`;
  }

  function setTime(value) {
    const max = state.duration || 0;
    const next = Math.max(0, Math.min(max, Number(value) || 0));
    if (Number.isFinite(videoA.duration)) videoA.currentTime = Math.min(next, videoA.duration);
    if (Number.isFinite(videoB.duration)) videoB.currentTime = Math.min(next, videoB.duration);
    timeline.value = String(next);
    timeLabel.textContent = `${formatTime(next)} / ${formatTime(max)}`;
  }

  function updatePlayButton() {
    playButton.textContent = videoA.paused ? "▶" : "❚❚";
  }

  function updateMuteButton() {
    videoA.muted = state.muted;
    videoB.muted = true;
    muteButton.textContent = state.muted ? "🔇" : "🔊";
  }

  async function playBoth() {
    if (!videoA.src || !videoB.src) return;
    if (state.duration > 0 && videoA.currentTime >= state.duration - 0.01) setTime(0);
    videoB.currentTime = videoA.currentTime;
    const results = await Promise.allSettled([videoA.play(), videoB.play()]);
    if (results.some((result) => result.status === "rejected")) {
      videoA.pause();
      videoB.pause();
    }
    updatePlayButton();
  }

  function pauseBoth() {
    videoA.pause();
    videoB.pause();
    updatePlayButton();
  }

  function drawContainedVideo(context, video, width, height) {
    const sourceWidth = video.videoWidth || 0;
    const sourceHeight = video.videoHeight || 0;
    if (!sourceWidth || !sourceHeight || video.readyState < 2) return;
    const scale = Math.min(width / sourceWidth, height / sourceHeight);
    const drawWidth = sourceWidth * scale;
    const drawHeight = sourceHeight * scale;
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    context.drawImage(video, x, y, drawWidth, drawHeight);
  }

  function drawRecordingLabel(context, text, x, align, scale) {
    const fontSize = Math.max(10, Math.round(16 * scale));
    const paddingX = Math.max(5, Math.round(8 * scale));
    const paddingY = Math.max(3, Math.round(5 * scale));
    context.font = `600 ${fontSize}px sans-serif`;
    context.textBaseline = "top";
    const textWidth = context.measureText(text).width;
    const width = textWidth + paddingX * 2;
    const height = fontSize + paddingY * 2;
    const left = align === "right" ? x - width : x;
    context.fillStyle = "rgba(0,0,0,0.68)";
    context.beginPath();
    context.roundRect(left, Math.round(8 * scale), width, height, Math.max(3, 4 * scale));
    context.fill();
    context.fillStyle = "#fff";
    context.fillText(text, left + paddingX, Math.round(8 * scale) + paddingY);
  }

  function drawRecordingFrame() {
    const canvas = state.recordingCanvas;
    if (!canvas) return;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    const width = canvas.width;
    const height = canvas.height;
    const splitX = Math.round(width * state.split);
    const scale = Math.max(0.65, Math.min(2.5, width / 1280));

    context.fillStyle = "#000";
    context.fillRect(0, 0, width, height);
    drawContainedVideo(context, videoA, width, height);
    context.save();
    context.beginPath();
    context.rect(0, 0, splitX, height);
    context.clip();
    drawContainedVideo(context, videoB, width, height);
    context.restore();

    const lineWidth = Math.max(2, Math.round(3 * scale));
    const handleRadius = Math.max(9, Math.round(17 * scale));
    context.strokeStyle = "rgba(0,0,0,0.55)";
    context.lineWidth = lineWidth + 2;
    context.beginPath();
    context.moveTo(splitX, 0);
    context.lineTo(splitX, height);
    context.stroke();
    context.strokeStyle = "rgba(255,255,255,0.96)";
    context.lineWidth = lineWidth;
    context.stroke();

    context.fillStyle = "rgba(255,255,255,0.94)";
    context.beginPath();
    context.arc(splitX, height / 2, handleRadius, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#111";
    context.font = `700 ${Math.max(12, Math.round(20 * scale))}px sans-serif`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText("↔", splitX, height / 2);
    context.textAlign = "left";

    const edge = Math.max(8, Math.round(10 * scale));
    drawRecordingLabel(context, labelB.textContent || "B", edge, "left", scale);
    drawRecordingLabel(context, labelA.textContent || "A", width - edge, "right", scale);
  }

  function resetRecordButton() {
    recordButton.disabled = false;
    recordButton.textContent = "⏺ REC";
    recordButton.style.color = "#ff7b7b";
    recordButton.setAttribute("aria-pressed", "false");
  }

  function releaseRecordingStream() {
    if (state.recordingTimer !== null) {
      window.clearTimeout(state.recordingTimer);
      state.recordingTimer = null;
    }
    state.recordingStream?.getTracks().forEach((track) => track.stop());
    state.recordingStream = null;
    state.recordingCanvas = null;
  }

  function showRecordingMessage(message) {
    status.textContent = message;
    status.style.display = "grid";
    window.setTimeout(() => {
      if (state.destroyed) return;
      if (videoA.src && videoB.src) {
        status.style.display = "none";
      } else {
        status.textContent = "Connect two VIDEO inputs and queue the node.";
      }
    }, 2500);
  }

  function downloadRecordingFallback(blob) {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `video-comparison-${stamp}.webm`;
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
    return filename;
  }

  async function publishRecordingBlob(blob) {
    const form = new FormData();
    form.append("recording", blob, "video-comparison.webm");
    const response = await api.fetchApi("/indi_video_comparer/recording", {
      method: "POST",
      body: form,
    });
    let result = {};
    try {
      result = await response.json();
    } catch {
      // The HTTP status below still provides a useful fallback error.
    }
    if (!response.ok || !result.recording_file) {
      throw new Error(result.error || `Recording upload failed (${response.status}).`);
    }

    const recordingWidget = node.widgets?.find((candidate) => candidate.name === "recording_file");
    if (!recordingWidget) {
      throw new Error("The recording_file widget is unavailable. Refresh ComfyUI and try again.");
    }
    recordingWidget.value = result.recording_file;
    recordingWidget.callback?.(result.recording_file);
    node.graph?.setDirtyCanvas(true, true);
    recordButton.title = `Registered ${result.recording_file}`;

    const outputConnected = Boolean(node.outputs?.[0]?.links?.length);
    if (outputConnected) {
      recordButton.textContent = "Queueing…";
      showRecordingMessage("Recording ready. Queueing the connected Save Video node…");
      await app.queuePrompt(0, 1);
    } else {
      showRecordingMessage("Recording ready. Connect recorded_video to Save Video, then queue once.");
    }
    return result;
  }

  function stopRecording(publish = true) {
    if (!state.recorder || state.recorder.state === "inactive") return;
    state.publishRecording = publish;
    recordButton.disabled = true;
    recordButton.textContent = publish ? "Preparing…" : "Stopping…";
    state.recorder.stop();
  }

  async function startRecording() {
    if (!videoA.src || !videoB.src || videoA.readyState < 2 || videoB.readyState < 2) {
      throw new Error("Queue the node and wait for both video previews before recording.");
    }
    if (typeof MediaRecorder === "undefined" || typeof HTMLCanvasElement.prototype.captureStream !== "function") {
      throw new Error("This browser does not support comparison recording.");
    }

    if (videoA.paused) await playBoth();

    const sourceWidth = videoA.videoWidth || videoB.videoWidth || 1280;
    const sourceHeight = videoA.videoHeight || videoB.videoHeight || 720;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(2, Math.round(sourceWidth / 2) * 2);
    canvas.height = Math.max(2, Math.round(sourceHeight / 2) * 2);
    state.recordingCanvas = canvas;
    drawRecordingFrame();

    const stream = canvas.captureStream(30);
    const captureVideoStream = videoA.captureStream || videoA.mozCaptureStream;
    if (!state.muted && typeof captureVideoStream === "function") {
      try {
        const sourceStream = captureVideoStream.call(videoA);
        sourceStream.getAudioTracks().forEach((track) => stream.addTrack(track));
        sourceStream.getVideoTracks().forEach((track) => track.stop());
      } catch (error) {
        console.warn("Video Comparer could not add preview audio to the recording.", error);
      }
    }

    const mimeTypes = [
      "video/webm;codecs=vp9,opus",
      "video/webm;codecs=vp8,opus",
      "video/webm;codecs=vp9",
      "video/webm;codecs=vp8",
      "video/webm",
    ];
    const mimeType = mimeTypes.find((type) => MediaRecorder.isTypeSupported(type)) || "";
    const videoBitsPerSecond = Math.max(
      4_000_000,
      Math.min(30_000_000, canvas.width * canvas.height * 4),
    );
    const options = mimeType ? { mimeType, videoBitsPerSecond } : { videoBitsPerSecond };
    state.recordingStream = stream;
    const recorder = new MediaRecorder(stream, options);

    state.recordingChunks = [];
    state.recordingBytes = 0;
    state.recordingLimitMessage = "";
    state.publishRecording = true;
    state.recorder = recorder;
    recorder.addEventListener("dataavailable", (event) => {
      if (!event.data?.size || !state.publishRecording) return;
      const nextBytes = state.recordingBytes + event.data.size;
      if (nextBytes > state.maxRecordingBytes) {
        state.publishRecording = false;
        state.recordingChunks = [];
        state.recordingLimitMessage = "Recording stopped because it exceeded the 512 MiB limit.";
        if (recorder.state !== "inactive") recorder.stop();
        return;
      }
      state.recordingBytes = nextBytes;
      state.recordingChunks.push(event.data);
    });
    recorder.addEventListener("stop", async () => {
      const chunks = state.recordingChunks;
      const shouldPublish = state.publishRecording;
      const limitMessage = state.recordingLimitMessage;
      const recordingType = recorder.mimeType || mimeType || "video/webm";
      state.recorder = null;
      state.recordingChunks = [];
      state.recordingBytes = 0;
      state.recordingLimitMessage = "";
      releaseRecordingStream();

      if (!shouldPublish || !chunks.length) {
        resetRecordButton();
        if (limitMessage) showRecordingMessage(limitMessage);
        return;
      }
      const blob = new Blob(chunks, { type: recordingType });
      if (!blob.size) {
        resetRecordButton();
        return;
      }
      recordButton.textContent = "Uploading…";
      try {
        await publishRecordingBlob(blob);
      } catch (error) {
        const filename = downloadRecordingFallback(blob);
        recordButton.title = `Upload failed; downloaded ${filename}`;
        showRecordingMessage(`${error?.message || "Recording upload failed."} Downloaded a browser copy instead.`);
      } finally {
        resetRecordButton();
      }
    });
    recorder.addEventListener("error", (event) => {
      state.publishRecording = false;
      showRecordingMessage(event.error?.message || "Recording failed.");
      if (recorder.state !== "inactive") recorder.stop();
    });

    recorder.start(250);
    state.recordingStartedAt = performance.now();
    state.recordingTimer = window.setTimeout(() => {
      if (state.recorder?.state === "recording") {
        showRecordingMessage("The 2-minute recording limit was reached. Preparing the recording…");
        stopRecording(true);
      }
    }, state.maxRecordingSeconds * 1000);
    recordButton.style.color = "#fff";
    recordButton.setAttribute("aria-pressed", "true");
  }

  function animationFrame() {
    if (state.destroyed) return;
    const liveRootWidth = root.clientWidth;
    if (liveRootWidth > 0 && Math.abs(liveRootWidth - state.lastLayoutWidth) > 0.5) {
      applyResponsiveLayout(liveRootWidth);
      node.graph?.setDirtyCanvas(true, true);
    }
    if (state.recorder?.state === "recording") {
      drawRecordingFrame();
      const elapsed = (performance.now() - state.recordingStartedAt) / 1000;
      recordButton.textContent = `■ ${formatRecordingTime(elapsed)}`;
    }
    if (!videoA.paused && state.duration > 0) {
      if (videoA.currentTime >= state.duration - 0.015) {
        if (state.loop) {
          setTime(0);
          void playBoth();
        } else {
          setTime(state.duration);
          pauseBoth();
        }
      } else {
        const drift = Math.abs(videoA.currentTime - videoB.currentTime);
        if (drift > state.syncTolerance) videoB.currentTime = videoA.currentTime;
        if (videoB.paused) void videoB.play();
        timeline.value = String(videoA.currentTime);
        timeLabel.textContent = `${formatTime(videoA.currentTime)} / ${formatTime(state.duration)}`;
      }
    }
    state.frameRequest = requestAnimationFrame(animationFrame);
  }

  function splitFromPointer(event) {
    const rect = stage.getBoundingClientRect();
    if (!rect.width) return;
    setSplit((event.clientX - rect.left) / rect.width);
  }

  stage.addEventListener("pointermove", splitFromPointer);
  stage.addEventListener("pointerdown", (event) => {
    event.preventDefault();
    event.stopPropagation();
    stage.setPointerCapture?.(event.pointerId);
    splitFromPointer(event);
  });
  stage.addEventListener("pointerup", (event) => stage.releasePointerCapture?.(event.pointerId));
  stage.addEventListener("wheel", (event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof app.canvas?.processMouseWheel === "function") {
      app.canvas.processMouseWheel(event);
    } else {
      app.canvas?._mousewheel_callback?.(event);
    }
  }, { passive: false, capture: true });

  playButton.addEventListener("click", (event) => {
    event.stopPropagation();
    if (videoA.paused) void playBoth();
    else pauseBoth();
  });
  recordButton.addEventListener("click", async (event) => {
    event.stopPropagation();
    if (state.recorder?.state === "recording") {
      stopRecording(true);
      return;
    }
    recordButton.disabled = true;
    recordButton.textContent = "Starting…";
    try {
      await startRecording();
      recordButton.disabled = false;
    } catch (error) {
      releaseRecordingStream();
      state.recorder = null;
      state.recordingChunks = [];
      resetRecordButton();
      showRecordingMessage(error?.message || "Recording failed.");
    }
  });
  muteButton.addEventListener("click", (event) => {
    event.stopPropagation();
    state.muted = !state.muted;
    updateMuteButton();
  });
  resetButton.addEventListener("click", (event) => {
    event.stopPropagation();
    setSplit(0.5);
  });
  timeline.addEventListener("input", (event) => {
    event.stopPropagation();
    setTime(event.target.value);
  });
  for (const element of [controls, timeline]) {
    element.addEventListener("pointerdown", (event) => event.stopPropagation());
  }

  videoA.addEventListener("play", updatePlayButton);
  videoA.addEventListener("pause", updatePlayButton);

  async function loadPayload(payload) {
    const token = ++state.loadToken;
    stopRecording(false);
    pauseBoth();
    status.style.display = "grid";
    status.textContent = "Loading comparison previews…";

    labelA.textContent = String(payload.label_a ?? "A");
    labelB.textContent = String(payload.label_b ?? "B");
    state.loop = payload.loop !== false;
    state.muted = payload.muted !== false;
    state.syncTolerance = Math.max(0.01, Number(payload.sync_tolerance_ms || 80) / 1000);
    state.maxRecordingBytes = Math.max(
      1024 * 1024,
      Number(payload.max_recording_bytes) || DEFAULT_MAX_RECORDING_BYTES,
    );
    state.maxRecordingSeconds = Math.max(
      10,
      Number(payload.max_recording_seconds) || DEFAULT_MAX_RECORDING_SECONDS,
    );
    setSplit(payload.initial_split ?? 0.5);
    updateMuteButton();

    const width = Number(payload.width_a) || 16;
    const height = Number(payload.height_a) || 9;
    state.aspectRatio = width > 0 && height > 0 ? width / height : 16 / 9;
    stage.style.aspectRatio = `${width} / ${height}`;

    videoA.src = fileToUrl(payload.video_a);
    videoB.src = fileToUrl(payload.video_b);
    videoA.load();
    videoB.load();

    const waitForMetadata = (video) => new Promise((resolve, reject) => {
      if (video.readyState >= 1) {
        resolve();
        return;
      }
      video.addEventListener("loadedmetadata", resolve, { once: true });
      video.addEventListener("error", () => reject(new Error("Video preview failed to load.")), { once: true });
    });

    try {
      await Promise.all([waitForMetadata(videoA), waitForMetadata(videoB)]);
    } catch (error) {
      if (token !== state.loadToken) return;
      status.textContent = error.message;
      return;
    }
    if (token !== state.loadToken) return;

    state.duration = Math.min(
      Number.isFinite(videoA.duration) ? videoA.duration : Number(payload.duration_a) || 0,
      Number.isFinite(videoB.duration) ? videoB.duration : Number(payload.duration_b) || 0,
    );
    timeline.max = String(state.duration || 0);
    timeline.step = "0.001";
    setTime(0);
    status.style.display = "none";

    const currentWidth = Math.max(260, node.size?.[0] || 520);
    const previewHeight = applyResponsiveLayout(currentWidth - 20);
    const targetHeight = Math.max(420, previewHeight + 300);
    node.setSize?.([currentWidth, targetHeight]);
    node.graph?.setDirtyCanvas(true, true);

    if (payload.autoplay !== false) void playBoth();
  }

  const widget = node.addDOMWidget("video_comparer", "preview", root, {
    serialize: false,
    hideOnZoom: false,
    getValue: () => null,
    setValue: () => {},
  });
  widget.computeSize = function computeSize(width) {
    const previewHeight = applyResponsiveLayout(width - 20);
    return [width, previewHeight + 42];
  };

  let applyingNodeResize = false;
  const previousResize = node.onResize;
  node.onResize = function onResize(size) {
    const result = previousResize?.apply(this, arguments);
    if (!size || applyingNodeResize || state.destroyed) return result;
    const width = Math.max(260, Number(size[0]) || 520);
    const previewHeight = applyResponsiveLayout(width - 20);
    const requiredHeight = Math.max(420, previewHeight + 300);
    if (Math.abs((Number(size[1]) || 0) - requiredHeight) > 1) {
      applyingNodeResize = true;
      size[1] = requiredHeight;
      this.size[1] = requiredHeight;
      applyingNodeResize = false;
      this.graph?.setDirtyCanvas(true, true);
    }
    return result;
  };

  const previousExecuted = node.onExecuted;
  node.onExecuted = function onExecuted(message) {
    previousExecuted?.apply(this, arguments);
    const payload = Array.isArray(message?.video_comparer)
      ? message.video_comparer[0]
      : message?.video_comparer;
    if (payload) void loadPayload(payload);
  };

  const previousRemoved = node.onRemoved;
  node.onRemoved = function onRemoved() {
    state.destroyed = true;
    state.loadToken += 1;
    stopRecording(false);
    pauseBoth();
    if (state.frameRequest !== null) cancelAnimationFrame(state.frameRequest);
    state.resizeObserver?.disconnect();
    videoA.removeAttribute("src");
    videoB.removeAttribute("src");
    videoA.load();
    videoB.load();
    return previousRemoved?.apply(this, arguments);
  };

  setSplit(0.5);
  updateMuteButton();
  state.frameRequest = requestAnimationFrame(animationFrame);
  node.setSize?.([520, 480]);
}

app.registerExtension({
  name: "indi.VideoComparer",
  nodeCreated(node) {
    if (node.comfyClass === NODE_ID) installComparer(node);
  },
});
