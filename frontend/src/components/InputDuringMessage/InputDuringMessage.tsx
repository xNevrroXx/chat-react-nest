import React, {forwardRef, Fragment, useRef} from "react";
import {PlusCircleTwoTone, SendOutlined, SmileOutlined} from "@ant-design/icons";
import {Button, Flex} from "antd";
import * as classNames from "classnames";
import InputEmoji from "react-input-emoji";
import {useFileUploadHook} from "react-use-file-upload/dist/lib/types";
// own modules
import AudioRecorderButton from "../AudioRecorderButton/AudioRecorderButton.tsx";
import UploadFiles from "../UploadFiles/UploadFiles.tsx";
import {IUseAudioRecorderReturnType} from "../../hooks/useAudioRecorder.hook.ts";
import {TValueOf} from "../../models/TUtils.ts";

interface IInputDuringMessageProps {
    message: string;
    sendMessage: () => void;
    onChange: (str: string) => void;
    onKeyDown: (event: KeyboardEvent) => void;
    isRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "isRecording">>
    startRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "startRecording">>
    stopRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "stopRecording">>
    files: TValueOf<Pick<useFileUploadHook, "files">>,
    setFiles: TValueOf<Pick<useFileUploadHook, "setFiles">>,
    removeFile: TValueOf<Pick<useFileUploadHook, "removeFile">>,

}

const InputDuringMessage = forwardRef<HTMLDivElement, IInputDuringMessageProps>(({
                                           message,
                                           sendMessage,
                                           onKeyDown,
                                           isRecording,
                                           startRecording,
                                           stopRecording,
                                           files,
                                           setFiles,
                                           removeFile,
                                           onChange
                                       }, ref) => {
    const emojiButtonRef = useRef<HTMLDivElement | null>(null);
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
                        size="large"
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
                    <InputEmoji
                        ref={ref}
                        buttonRef={emojiButtonRef}
                        theme="light"
                        set="twitter"
                        value={message}
                        onChange={onChange}
                        onKeyDown={onKeyDown}
                        cleanOnEnter={true}
                        shouldReturn={true}
                        keepOpened={true}
                        placeholder={"Ваше сообщение"}

                        tabIndex={0}
                        inputClass={classNames("input-message__textbox")}
                        borderRadius={5}
                        borderColor={"rgb(207 222 243)"}
                        fontFamily={"Roboto, sans-serif"}
                    />
                </div>
                <div className="input-message__btn-wrapper">
                    <Button
                        ref={emojiButtonRef}
                        type="text"
                        icon={<SmileOutlined/>}
                        onClick={sendMessage}
                        size="large"
                    />
                </div>
                <div className="input-message__btn-wrapper">
                    {
                        message || files.length > 0 ?
                            <Button
                                type="text"
                                icon={<SendOutlined/>}
                                onClick={sendMessage}
                                size="large"
                            />
                            :
                            <AudioRecorderButton
                                isRecording={isRecording}
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
});

export default InputDuringMessage;