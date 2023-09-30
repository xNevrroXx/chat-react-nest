import {useRef, useState} from "react";

export type IUseAudioRecorderReturnType = ReturnType<typeof useAudioRecorder>;

const mimeType = "audio/webm" as const;

const useAudioRecorder = () => {
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const [permission, setPermission] = useState<boolean>(false);
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [audio, setAudio] = useState<Blob | null>(null);
    const [audioURL, setAudioURL] = useState<string | null>(null);
    const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

    const getMicrophonePermission = async () => {
        console.log("get permission");
        if ("MediaRecorder" in window) {
            try {
                const streamData = await navigator.mediaDevices.getUserMedia({
                    audio: true,
                    video: false,
                });
                setPermission(true);
                setStream(streamData);
            } catch (err) {
                if (err instanceof Error) {
                    alert(err.message);
                    return;
                }
                console.warn(err);
            }
        } else {
            alert("The MediaRecorder API is not supported in your browser.");
        }
    };

    const startRecording = () => {
        console.log("start recording");
        if (!stream) {
            return;
        }

        setIsRecording(true);
        //create new Media recorder instance using the stream
        const media = new MediaRecorder(stream, { mimeType });
        //set the MediaRecorder instance to the mediaRecorder ref
        mediaRecorder.current = media;
        //invokes the start method to start the recording process
        mediaRecorder.current.start();
        const localAudioChunks: Blob[] = [];

        mediaRecorder.current.ondataavailable = (event) => {
            console.log("blobEvent: ", event);
            if (typeof event.data === "undefined") return;
            if (event.data.size === 0) return;
            localAudioChunks.push(event.data);
        };
        setAudioChunks(localAudioChunks);
    };

    const stopRecording = () => {
        console.log("stop recording");
        if (!mediaRecorder.current) {
            return;
        }
        setIsRecording(false);
        //stops the recording instance
        mediaRecorder.current.onstop = () => {
            //creates a blob file from the audiochunks data
            const audioBlob = new Blob(audioChunks, { type: mimeType });
            //creates a playable URL from the blob file.
            const audioUrl = URL.createObjectURL(audioBlob); // The "AudioVisualizer" doesn't need the
            setAudio(audioBlob);
            setAudioURL(audioUrl);
            setAudioChunks([]);
        };
        mediaRecorder.current.stop();
    };

    const cleanAudio = () => {
        mediaRecorder.current = null;
        setIsRecording(false);
        setAudio(null);
        setAudioURL(null);
    };

    return {
        mediaRecorder,
        permission,
        isRecording,
        audio,
        audioURL,
        getMicrophonePermission,
        startRecording,
        stopRecording,
        cleanAudio
    };
};

export {useAudioRecorder};