import React, {FC, useRef, useState} from "react";
import * as classNames from "classnames";
// @ts-ignore
import {AudioVisualizer} from "react-audio-visualize";
import {Button} from "antd";
import {PauseCircleOutlined} from "@ant-design/icons";
// own modules
import PlayCircleOutlined from "../../icons/PlayCircleOutlined.tsx";
// styles
import "./audio-element.scss";

interface IVoiceRecording {
    blob: Blob,
    blobURL: string,
    // default: 600px
    width?: number,
    // default: 50px
    height?:number,
    alignCenter?: boolean
}
const AudioElement: FC<IVoiceRecording> = ({blob, blobURL, height = 50, width= 600, alignCenter}) => {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioTimestamp, setAudioTimestamp] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    const playAudio = () => {
        if (!audioRef.current) {
            return;
        }

        void audioRef.current.play();
        setIsPlaying(true);
    };

    const pauseAudio = () => {
        if (!audioRef.current) {
            return;
        }

        void audioRef.current.pause();
        setIsPlaying(false);
    };

    const onTimeUpdate: React.ReactEventHandler<HTMLAudioElement> = (event) => {
        if (!(event.target instanceof HTMLAudioElement)) {
            return;
        }

        setAudioTimestamp(event.target.currentTime);
    };

    return (
        <div className={classNames("audio-element", alignCenter && "audio-element_align-center")}>
            <div className="audio-element__control-btn">
                { isPlaying ?
                    <Button
                        type={"text"}
                        onClick={pauseAudio}
                        icon={<PauseCircleOutlined/>}
                    />
                    :
                    <Button
                        type={"text"}
                        onClick={playAudio}
                        icon={<PlayCircleOutlined/>}
                    />
                }
            </div>

            <div className="audio-element__waves">
                <AudioVisualizer
                    blob={blob}
                    width={width}
                    height={height}
                    barWidth={3}
                    gap={2}
                    barColor={"lightblue"}
                    barPlayedColor="rgb(160, 198, 255)"
                    currentTime={audioTimestamp}
                />
                <audio
                    ref={audioRef}
                    src={blobURL}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                />
            </div>
        </div>
    );
};

export default AudioElement;