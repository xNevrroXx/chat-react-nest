import React, {FC} from "react";
import {Button, Col} from "antd";
import {PlusCircleTwoTone, SendOutlined} from "@ant-design/icons";
import InputEmojiWithRef from "react-input-emoji";
import * as classNames from "classnames";
import AudioRecorder from "../AudioRecord/AudioRecorder.tsx";
import {TValueOf} from "../../models/TUtils.ts";
import {IUseAudioRecorderReturnType} from "../../hooks/useAudioRecorder.hook.ts";

interface IInputDuringMessageProps {
    message: string;
    sendMessage: () => void;
    onChange: (str: string) => void;
    onKeyDown: (event: KeyboardEvent) => void;
    permission: TValueOf<Pick<IUseAudioRecorderReturnType, "permission">>
    isRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "isRecording">>
    getMicrophonePermission: TValueOf<Pick<IUseAudioRecorderReturnType, "getMicrophonePermission">>
    startRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "startRecording">>
    stopRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "stopRecording">>
}

const InputDuringMessage: FC<IInputDuringMessageProps> = ({
                                                              message,
                                                              sendMessage,
                                                              onChange,
                                                              onKeyDown,
                                                              permission,
                                                              isRecording,
                                                              getMicrophonePermission,
                                                              startRecording,
                                                              stopRecording
                                                          }) => {
    return (
        <>
            <Col span={1} className="input-message__btn-wrapper">
                <Button
                    type="text"
                    icon={<PlusCircleTwoTone/>}
                />
            </Col>
            <Col span={20} className="input-message__field">
                <InputEmojiWithRef
                    inputClass={classNames("input-message__textbox")}
                    tabIndex={0}
                    borderRadius={5}
                    borderColor={"rgb(207 222 243)"}
                    fontFamily={"Roboto, sans-serif"}

                    value={message}
                    onChange={onChange}
                    shouldReturn={true}
                    cleanOnEnter={true}
                    onKeyDown={onKeyDown}
                    placeholder={"Ваше сообщение"}
                />
            </Col>
            <Col span={1} className="input-message__btn-wrapper">
                {
                    message ?
                        <Button
                            type="text"
                            icon={<SendOutlined/>}
                            onClick={sendMessage}
                        />
                        :
                        <AudioRecorder
                            permission={permission}
                            isRecording={isRecording}
                            getMicrophonePermission={getMicrophonePermission}
                            startRecording={startRecording}
                            stopRecording={stopRecording}
                        />
                }
            </Col>
        </>
    );
};

export default InputDuringMessage;