import React, {FC, Fragment} from "react";
import {Button, Col} from "antd";
import {CloseCircleOutlined, SendOutlined} from "@ant-design/icons";
// @ts-ignore
import {LiveAudioVisualizer} from "react-audio-visualize";
// own modules
import {TValueOf} from "../../models/TUtils.ts";
import {IUseAudioRecorderReturnType} from "../../hooks/useAudioRecorder.hook.ts";
import StopCircleOutlined from "../../icons/StopCircleOutlined.tsx";
import AudioElement from "../AudioElement/AudioElement.tsx";

interface IInputDuringAudioProps {
    mediaRecorder: MediaRecorder;
    audio: TValueOf<Pick<IUseAudioRecorderReturnType, "audio">>;
    audioURL: TValueOf<Pick<IUseAudioRecorderReturnType, "audioURL">>;
    isRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "isRecording">>;
    stopRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "stopRecording">>;
    cleanAudio: TValueOf<Pick<IUseAudioRecorderReturnType, "cleanAudio">>;
    sendVoiceMessage: (record: Blob) => void;
}

const InputDuringAudio: FC<IInputDuringAudioProps> = ({
                                                          mediaRecorder,
                                                          stopRecording,
                                                          audio,
                                                          audioURL,
                                                          cleanAudio,
                                                          isRecording,
                                                          sendVoiceMessage: onSendVoiceMessage
                                                      }) => {
    const sendVoiceMessage = () => {
        if (!audio) {
            return;
        }

        onSendVoiceMessage(audio);
        cleanAudio();
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

            {isRecording &&
                <Col span={1} className="input-message__btn-wrapper">
                    <Button
                        type={"text"}
                        onClick={stopRecording}
                        icon={<StopCircleOutlined/>}
                    />
                </Col>
            }

            <Col span={20} className="input-message__field">
                {audio && audioURL ?
                    <AudioElement blob={audio} blobURL={audioURL}/>
                    :
                    <LiveAudioVisualizer
                        width={"610px"}
                        height={"50px"}
                        mediaRecorder={mediaRecorder}
                    />
                }
            </Col>

            <Col span={1} className="input-message__btn-wrapper">
                <Button
                    type="text"
                    icon={<SendOutlined/>}
                    onClick={sendVoiceMessage}
                />
            </Col>
        </Fragment>
    );
};

export default InputDuringAudio;