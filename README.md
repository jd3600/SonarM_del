# 🛰️ SONAR: Agentic Broadcast Intelligence
### Next-Gen Regulatory Oversight for New Caledonia

**SONAR** is an automated monitoring ecosystem designed for **ARCOM** (French Broadcasting Authority). It leverages **Gemini 3.0 Flash** to ensure real-time compliance for Radio and TV broadcasts, focusing on political pluralism, advertising quotas, and new digital safety laws (SREN 2024).

---

## 🏗️ Project Architecture

The project is structured into standalone modules designed for **Edge Computing** deployment:

* **🎙️ SonarAudio**: Handles live stream capture, transcription, and political pluralism auditing for radio stations.
* **📺 SonarVideo**: Features advanced visual detection for politicians, logo tracking, and segment summarization for TV news.
* **🖥️ SonarFrontEnd**: A centralized high-fidelity dashboard for data visualization and reporting.

---

## 🚀 Deployment Workflow

The system follows a streamlined local-to-cloud update cycle:
1.  **Analyze**: Local engines process live media streams using Gemini 3.0.
2.  **Sync**: Resulting analysis files are synchronized into the Frontend directory.
3.  **Publish**: Content is pushed to GitHub to update the live web demonstration.

---

## 🛠️ Quick Start

1.  **Prerequisites**: Node.js and FFmpeg installed on the local machine.
2.  **Configuration**: Add your `GEMINI_API_KEY` to the `.env` file in the respective module folders.
3.  **Execution**: 
    * **Audio**: `cd SonarAudio && node server.js`
    * **Video**: `cd SonarVideo && node server.js`

---

## 🧠 Why Gemini 3.0 Flash?

* **Native Multimodality**: Simultaneous understanding of audio, video, and text for complex regulatory tasks.
* **Thinking Mode**: Balanced speed and reasoning for identifying political nuances in broadcast.
* **Economic Efficiency**: Reduces manual monitoring costs by **97%**, dropping operational overhead from **$43,200/month** to approximately **$1,250/month**.

---

**📍 Developed in Nouméa, New Caledonia | Devpost Hackathon 2026**