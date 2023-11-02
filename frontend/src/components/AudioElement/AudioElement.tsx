import React, {FC, useRef, useState} from "react";
import * as classNames from "classnames";
// @ts-ignore
import {AudioVisualizer} from "react-audio-visualize";
import {Button, theme, Typography} from "antd";
import {PauseCircleOutlined} from "@ant-design/icons";
// own modules
import PlayCircleOutlined from "../../icons/PlayCircleOutlined.tsx";
// styles
import "./audio-element.scss";

const {useToken} = theme;
const {Text} = Typography;

interface IVoiceRecording {
    blob: Blob,
    blobURL: string,
    // default: 600px
    width?: number,
    // default: 50px
    height?:number,
    alignCenter?: boolean,
    createdAt?: string
}
const AudioElement: FC<IVoiceRecording> = ({blob, blobURL, height = 50, width= 600, alignCenter, createdAt}) => {
    const {token} = useToken();
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
                        size="large"
                    />
                    :
                    <Button
                        type={"text"}
                        onClick={playAudio}
                        icon={<PlayCircleOutlined/>}
                        size="large"
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
                    barColor={"rgb(99,162,255)"}
                    barPlayedColor={"rgb(22, 119, 255)"}
                    currentTime={audioTimestamp}
                />
                <audio
                    ref={audioRef}
                    src={blobURL}
                    onTimeUpdate={onTimeUpdate}
                    onEnded={() => setIsPlaying(false)}
                />
                <p>
                    <Text style={{color: token.colorTextSecondary}}>{Number.parseFloat((blob.size / 1024).toString() ).toFixed(1)}KB</Text>
                    { createdAt && <Text style={{color: token.colorTextSecondary}} className="message__time">{createdAt}</Text> }
                </p>
            </div>
        </div>
    );
};

export default AudioElement;