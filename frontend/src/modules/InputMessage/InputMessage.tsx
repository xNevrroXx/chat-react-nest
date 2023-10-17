import {FC, useState} from "react";
import {Button, Flex} from "antd";
import {DeleteOutlined} from "@ant-design/icons";
import useFileUpload from "react-use-file-upload";
// own modules
import InputDuringMessage from "../../components/InputDuringMessage/InputDuringMessage.tsx";
import InputDuringAudio from "../../components/InputDuringAudio/InputDuringAudio.tsx";
import {useAudioRecorder} from "../../hooks/useAudioRecorder.hook.ts";
import MessageReply from "../../components/MessageReply/MessageReply.tsx";
import {
    IAttachment,
    TSendMessage,
    TFileType,
    Message as MessageClass,
    ForwardedMessage as ForwardedMessageClass
} from "../../models/IStore/IChats.ts";
import {TValueOf} from "../../models/TUtils.ts";
// styles
import "./input-message.scss";

interface IInputMessage {
    onSendMessage: (text: TValueOf<Pick<TSendMessage, "text">>, attachments: IAttachment[]) => void;
    sendVoiceMessage: (record: Blob) => void;
    onTyping: () => void;
    messageForReply: MessageClass | ForwardedMessageClass | null;
    removeMessageForReply: () => void;
}

const InputMessage: FC<IInputMessage> = ({onSendMessage, sendVoiceMessage, onTyping, messageForReply, removeMessageForReply}) => {
    const [message, setMessage] = useState<string | null>(null);
    const {
        files,
        // handleDragDropEvent,
        clearAllFiles,
        // createFormData,
        setFiles,
        removeFile
    } = useFileUpload();
    const {
        mediaRecorder,
        permission,
        isRecording,
        audio,
        audioURL,
        getMicrophonePermission,
        startRecording,
        stopRecording,
        cleanAudio
    } = useAudioRecorder();

    const onChangeMessage = (str: string) => {
        setMessage(str);
    };

    const onKeyDown = (event: KeyboardEvent) => {
        if (
            event.key !== "Enter"
            || !(event.target instanceof HTMLDivElement)
            || !message
            || message.length === 0
        ) {
            onTyping();
            return;
        }

        void sendMessage();
        setMessage(event.target.innerHTML);
    };

    const sendMessage = async () => {
        const trimmedMessage = message ? message.trim() : null;
        const attachments = files.reduce<Promise<IAttachment[]>>(async (previousValue, currentValue) => {
            const prev = await previousValue;
            const extensionInfo = currentValue.name.match(/(?<=\.)\D+$/) || [];
            const extension = extensionInfo.length === 1 ? extensionInfo[0] : "";

            prev.push({
                originalName: currentValue.name,
                fileType: TFileType.ATTACHMENT,
                mimeType: currentValue.type,
                extension: extension,
                buffer: await currentValue.arrayBuffer()
            });
            return prev;
        }, Promise.all([]));

        onSendMessage(trimmedMessage, await attachments);
        setMessage("");
        clearAllFiles();
    };


    return (
        <>
            <Flex className="input-message" justify="space-between" vertical align="self-start" gap="small">
                {messageForReply &&
                    <Flex align="center">
                        <MessageReply
                            isInput={true}
                            message={messageForReply}
                        />
                        <Button
                            size="small"
                            type="text"
                            icon={<DeleteOutlined/>}
                            onClick={removeMessageForReply}
                        />
                    </Flex>
                }
                { mediaRecorder.current && (isRecording || audioURL) ?
                    <InputDuringAudio
                        audio={audio}
                        mediaRecorder={mediaRecorder.current}
                        stopRecording={stopRecording}
                        cleanAudio={cleanAudio}
                        isRecording={isRecording}
                        audioURL={audioURL}
                        sendVoiceMessage={sendVoiceMessage}
                    />
                    :
                    <InputDuringMessage
                        message={message || ""}
                        sendMessage={sendMessage}
                        onChange={onChangeMessage}
                        onKeyDown={onKeyDown}
                        permission={permission}
                        isRecording={isRecording}
                        getMicrophonePermission={getMicrophonePermission}
                        startRecording={startRecording}
                        stopRecording={stopRecording}
                        files={files}
                        setFiles={setFiles}
                        removeFile={removeFile}
                    />
                }
            </Flex>
        </>
    );
};

export default InputMessage;