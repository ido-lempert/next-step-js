// Popup UI Script for Next-Step Preview Extension
// Handles preview mode toggle and recording controls

document.addEventListener('DOMContentLoaded', async () => {
  const toggle = document.getElementById('preview-toggle');
  const statusDot = document.getElementById('status-dot');
  const statusText = document.getElementById('status-text');
  const recordBtn = document.getElementById('record-btn');
  const stopBtn = document.getElementById('stop-btn');
  const recordingStatus = document.getElementById('recording-status');
  const recordingComplete = document.getElementById('recording-complete');
  const downloadBtn = document.getElementById('download-btn');

  let currentRecording = null;

  // Get current active tab
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  if (!tab) {
    console.error('No active tab found');
    updateStatus(false);
    return;
  }

  console.log('Popup opened for tab:', tab.id);

  // Check current preview state
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_PREVIEW_STATE',
      tabId: tab.id,
    });

    const isEnabled = response.enabled || false;
    toggle.checked = isEnabled;
    updateStatus(isEnabled);
  } catch (error) {
    console.error('Failed to get preview state:', error);
    updateStatus(false);
  }

  // Check recording state
  try {
    const recordingState = await chrome.runtime.sendMessage({
      type: 'GET_RECORDING_STATE',
      tabId: tab.id,
    });

    if (recordingState.isRecording) {
      showRecordingInProgress();
    }
  } catch (error) {
    console.error('Failed to get recording state:', error);
  }

  // Handle toggle changes
  toggle.addEventListener('change', async () => {
    const shouldEnable = toggle.checked;
    console.log(`${shouldEnable ? 'Enabling' : 'Disabling'} preview mode for tab ${tab.id}`);

    try {
      if (shouldEnable) {
        const response = await chrome.runtime.sendMessage({
          type: 'ENABLE_PREVIEW',
          tabId: tab.id,
        });

        if (response.success) {
          updateStatus(true);
          // Reload the page to apply changes
          await chrome.tabs.reload(tab.id);
        } else {
          console.error('Failed to enable preview mode:', response.error);
          toggle.checked = false;
          updateStatus(false);
          showError('Failed to enable preview mode');
        }
      } else {
        const response = await chrome.runtime.sendMessage({
          type: 'DISABLE_PREVIEW',
          tabId: tab.id,
        });

        if (response.success) {
          updateStatus(false);
          // Reload the page to remove SDK
          await chrome.tabs.reload(tab.id);
        } else {
          console.error('Failed to disable preview mode:', response.error);
          toggle.checked = true;
          updateStatus(true);
          showError('Failed to disable preview mode');
        }
      }
    } catch (error) {
      console.error('Error toggling preview mode:', error);
      toggle.checked = !shouldEnable;
      updateStatus(!shouldEnable);
      showError(error.message);
    }
  });

  /**
   * Update the status indicator
   * @param {boolean} enabled - Whether preview mode is enabled
   */
  function updateStatus(enabled) {
    if (enabled) {
      statusDot.classList.add('active');
      statusDot.classList.remove('inactive');
      statusText.textContent = 'Active';
      statusText.classList.add('status-active');
      statusText.classList.remove('status-inactive');
    } else {
      statusDot.classList.add('inactive');
      statusDot.classList.remove('active');
      statusText.textContent = 'Inactive';
      statusText.classList.add('status-inactive');
      statusText.classList.remove('status-active');
    }
  }

  /**
   * Show an error message (simple alert for now)
   * @param {string} message - Error message
   */
  function showError(message) {
    // In a production version, this could be a nicer UI element
    alert(`Error: ${message}`);
  }

  /**
   * Recording button handlers
   */
  recordBtn.addEventListener('click', async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'START_RECORDING',
        tabId: tab.id,
      });

      if (response.success) {
        showRecordingInProgress();
      } else {
        showError('Failed to start recording');
      }
    } catch (error) {
      console.error('Error starting recording:', error);
      showError(error.message);
    }
  });

  stopBtn.addEventListener('click', async () => {
    try {
      const response = await chrome.runtime.sendMessage({
        type: 'STOP_RECORDING',
        tabId: tab.id,
      });

      if (response.success) {
        currentRecording = response.recording;
        showRecordingComplete();
      } else {
        showError('Failed to stop recording');
      }
    } catch (error) {
      console.error('Error stopping recording:', error);
      showError(error.message);
    }
  });

  downloadBtn.addEventListener('click', () => {
    if (!currentRecording) {
      showError('No recording available');
      return;
    }

    // Create download link
    const dataStr = JSON.stringify(currentRecording, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const filename = `recording_${currentRecording.sessionId}.json`;
    
    chrome.downloads.download({
      url: url,
      filename: filename,
      saveAs: true,
    });
  });

  function showRecordingInProgress() {
    recordBtn.style.display = 'none';
    stopBtn.style.display = 'flex';
    recordingStatus.style.display = 'block';
    recordingComplete.style.display = 'none';
  }

  function showRecordingComplete() {
    recordBtn.style.display = 'flex';
    stopBtn.style.display = 'none';
    recordingStatus.style.display = 'none';
    recordingComplete.style.display = 'block';
  }
});
