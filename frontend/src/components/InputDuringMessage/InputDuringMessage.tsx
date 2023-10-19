import React, {FC, Fragment, useRef} from "react";
import * as classNames from "classnames";
import {Button, Flex} from "antd";
import {PlusCircleTwoTone, SendOutlined} from "@ant-design/icons";
import InputEmojiWithRef from "react-input-emoji";
import AudioRecorderButton from "../AudioRecorderButton/AudioRecorderButton.tsx";
import UploadFiles from "../UploadFiles/UploadFiles.tsx";
import {IUseAudioRecorderReturnType} from "../../hooks/useAudioRecorder.hook.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {useFileUploadHook} from "react-use-file-upload/dist/lib/types";

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
    files: TValueOf<Pick<useFileUploadHook, "files">>,
    setFiles: TValueOf<Pick<useFileUploadHook, "setFiles">>,
    removeFile: TValueOf<Pick<useFileUploadHook, "removeFile">>
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
                                                              stopRecording,
                                                              files,
                                                              setFiles,
                                                              removeFile
                                                          }) => {
    const inputFilesRef = useRef<HTMLInputElement | null>(null);
    const buttonAddFilesRef = useRef<HTMLButtonElement | null>(null);

    const onClickButtonFiles = () => {
        if (!inputFilesRef.current) {
            return;
        }
        inputFilesRef.current.click();
    };

    return (
        <Fragment>
            <Flex vertical={false} style={{width: "100%"}} align="self-end" gap="middle">
                <div className="input-message__btn-wrapper">
                    <Button
                        ref={buttonAddFilesRef}
                        type="text"
                        icon={<PlusCircleTwoTone/>}
                        onClick={onClickButtonFiles}
                    />
                    <input
                        ref={inputFilesRef}
                        type="file"
                        multiple
                        style={{display: "none"}}
                        onChange={(e) => {
                            setFiles(e, "a");
                            if (!inputFilesRef.current || inputFilesRef.current.type !== "file") {
                                return;
                            }
                            inputFilesRef.current.value = "";
                        }
                        }
                    />
                </div>
                <div className="input-message__field" style={{flexGrow: 1}}>
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
                </div>
                <div className="input-message__btn-wrapper">
                    {
                        message || files.length > 0 ?
                            <Button
                                type="text"
                                icon={<SendOutlined/>}
                                onClick={sendMessage}
                            />
                            :
                            <AudioRecorderButton
                                permission={permission}
                                isRecording={isRecording}
                                getMicrophonePermission={getMicrophonePermission}
                                startRecording={startRecording}
                                stopRecording={stopRecording}
                            />
                    }
                </div>
            </Flex>
            <UploadFiles
                buttonRef={buttonAddFilesRef}
                attachments={files}
                removeAttachment={removeFile}
            />
        </Fragment>
    );
};

export default InputDuringMessage;