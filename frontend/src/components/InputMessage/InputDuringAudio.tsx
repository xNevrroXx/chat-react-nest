import React, {FC, Fragment, useRef} from "react";
import {Button, Col} from "antd";
import {CloseCircleOutlined, SendOutlined} from "@ant-design/icons";
// @ts-ignore
import {AudioVisualizer, LiveAudioVisualizer} from "react-audio-visualize";
// own modules
import {TValueOf} from "../../models/TUtils.ts";
import {IUseAudioRecorderReturnType} from "../../hooks/useAudioRecorder.hook.ts";
import StopCircleOutlined from "../../icons/StopCircleOutlined.tsx";
import PlayCircleOutlined from "../../icons/PlayCircleOutlined.tsx";

interface IInputDuringAudioProps {
    mediaRecorder: MediaRecorder;
    audio: TValueOf<Pick<IUseAudioRecorderReturnType, "audio">>;
    audioURL: TValueOf<Pick<IUseAudioRecorderReturnType, "audioURL">>;
    isRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "isRecording">>;
    stopRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "stopRecording">>;
    cleanAudio: TValueOf<Pick<IUseAudioRecorderReturnType, "cleanAudio">>;
}

const InputDuringAudio: FC<IInputDuringAudioProps> = ({mediaRecorder, stopRecording, audio, audioURL, cleanAudio, isRecording}) => {
    const visualizerRef = useRef<HTMLDivElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const audioTimestampRef = useRef<number | null>(null);

    const onPlay = () => {
        if (!audioRef.current) {
            return;
        }

        void audioRef.current.play();
    };

    return (
        <Fragment>
            <Col span={1} className="input-message__btn-wrapper">
                <Button
                    type={"text"}
                    onClick={cleanAudio}
                    icon={<CloseCircleOutlined/>}
                />
            </Col>

            <Col span={1} className="input-message__btn-wrapper">
                { isRecording ?
                    <Button
                        type={"text"}
                        onClick={stopRecording}
                        icon={<StopCircleOutlined/>}
                    />
                    :
                    <Button
                        type={"text"}
                        onClick={onPlay}
                        icon={<PlayCircleOutlined/>}
                    />
                }

            </Col>

            <Col span={20} className="input-message__field">
                { audio && audioURL ?
                    (
                        <Fragment>
                            <AudioVisualizer
                                ref={visualizerRef}
                                blob={audio}
                                width={600}
                                height={50}
                                barWidth={3}
                                gap={2}
                                barColor={"lightblue"}
                                currentTime={audioRef || undefined}
                            />
                            <audio
                                ref={audioRef}
                                src={audioURL || "fake"}
                                onPlaying={(event) => {
                                    audioTimestampRef.current = event.timeStamp;
                                }}
                            />
                        </Fragment>
                    )
                    :
                    <LiveAudioVisualizer
                        width={"610px"}
                        height={"50px"}
                        mediaRecorder={mediaRecorder}
                    />
                }
            </Col>

            <Col span={1} className="input-message__btn-wrapper">
                <Button type="text" icon={<SendOutlined/>}/>
            </Col>
        </Fragment>
    );
};

export default InputDuringAudio;