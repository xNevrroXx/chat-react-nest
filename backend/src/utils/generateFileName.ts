function generateFileName(senderId: string) {
    return senderId + "-voice-" + Date.now() + ".webm";
}

export {generateFileName};