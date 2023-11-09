import React, {FC, JSX, useEffect, useRef, useState} from "react";
import * as classNames from "classnames";
// @ts-ignore
import {AudioVisualizer} from "react-audio-visualize";
import {Button, theme, Typography} from "antd";
import {PauseCircleOutlined} from "@ant-design/icons";
// own modules
import PlayCircleOutlined from "../../icons/PlayCircleOutlined.tsx";
// styles
import "./audio-element.scss";
import {IFile} from "../../models/IStore/IRoom.ts";
import {TValueOf} from "../../models/TUtils.ts";

const {useToken} = theme;
const {Text} = Typography;

interface IVoiceRecording {
    blob?: Blob,
    url: string,
    size?: TValueOf<Pick<IFile, "size">>,
    // default: 600px
    width?: number,
    // default: 50px
    height?: number,
    alignCenter?: boolean,
    createdAt?: string,
    children?: JSX.Element
}

const AudioElement: FC<IVoiceRecording> = ({
                                               blob: inputBlob,
                                               url,
                                               size,
                                               height = 50,
                                               width = 600,
                                               alignCenter,
                                               children,
                                           }) => {
    const {token} = useToken();
    const [blob, setBlob] = useState<Blob | undefined>(inputBlob);
    const [blobUrl, setBlobUrl] = useState<string | null>(inputBlob ? URL.createObjectURL(inputBlob) : "");
    // const {data, request, status, clear} = useFetch<unknown>(import.meta.env.VITE_BACKEND_BASE_URL + "/file?name=" + url);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [audioTimestamp, setAudioTimestamp] = useState<number | null>(null);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);

    // useEffect(() => {
    //     if (blob) {
    //         return;
    //     }
    //
    //     void request({
    //         method: "GET"
    //     });
    // }, [blob, request, url]);

    useEffect(() => {
        if (inputBlob) {
            return;
        }

        async function getBlobInfo() {
            const blob = await fetch(import.meta.env.VITE_BACKEND_BASE_URL + "/file?name=" + url).then(r => r.blob());
            setBlob(blob);
            setBlobUrl(URL.createObjectURL(blob));
        }

        void getBlobInfo();
    }, [inputBlob, url]);

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
                {isPlaying ?
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

            {blob && blobUrl && (
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
                        src={blobUrl || undefined}
                        onTimeUpdate={onTimeUpdate}
                        onEnded={() => setIsPlaying(false)}
                    />
                    <p>
                        {size && <Text style={{color: token.colorTextSecondary}}>{size.value} {size.unit}</Text>}
                        {children}
                    </p>
                </div>
            )}
        </div>
    );
};

export default AudioElement;