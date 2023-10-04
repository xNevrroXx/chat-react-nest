import React, {FC, Fragment, useMemo} from "react";
import {AudioTwoTone} from "@ant-design/icons";
import {IUseAudioRecorderReturnType} from "../../hooks/useAudioRecorder.hook.ts";
import {TValueOf} from "../../models/TUtils.ts";
import {Button} from "antd";

interface IAudioRecorderProps {
    permission: TValueOf<Pick<IUseAudioRecorderReturnType, "permission">>;
    isRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "isRecording">>;
    getMicrophonePermission: TValueOf<Pick<IUseAudioRecorderReturnType, "getMicrophonePermission">>;
    startRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "startRecording">>;
    stopRecording: TValueOf<Pick<IUseAudioRecorderReturnType, "stopRecording">>;
}

const AudioRecorderButton: FC<IAudioRecorderProps> = ({
                                                    permission,
                                                    isRecording,
                                                    getMicrophonePermission,
                                                    startRecording,
                                                    stopRecording
                                                }) => {
    const content = useMemo(() => {
        if (!permission) {
            return (
                <Button
                    type="text"
                    icon={<AudioTwoTone/>}
                    onClick={getMicrophonePermission}
                />
            );
        } else if (!isRecording) {
            return (
                <Button
                    type="text"
                    icon={<AudioTwoTone/>}
                    onClick={startRecording}
                />
            );
        }

        return (
            <Button
                type="text"
                icon={<AudioTwoTone/>}
                onClick={stopRecording}
            />
        );
    }, [permission, isRecording, getMicrophonePermission, startRecording, stopRecording]);

    return (
        <Fragment>
            {content}
        </Fragment>
    );
};

export default AudioRecorderButton;