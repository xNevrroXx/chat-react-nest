import React, {useState, useEffect, FC} from "react";
import {Upload, Modal, UploadFile} from "antd";

function getBase64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

interface IUploadFilesProps {
    attachments: UploadFile[],
    removeAttachment: (file: UploadFile) => void
}
const UploadFiles: FC<IUploadFilesProps> = ({ attachments, removeAttachment }) => {
    const [state, setState] = useState({
        previewVisible: false,
        previewImage: "",
        fileList: attachments
    });

    useEffect(() => {
        setState({
            ...state,
            fileList: attachments
        });
    }, [attachments]);

    const handleCancel = () => setState({ ...state, previewVisible: false });

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview && file.originFileObj) {
            const base64 = await getBase64(file.originFileObj);
            file.preview = base64 as string;
        }

        setState({
            ...state,
            previewImage: file.url! || file.preview!,
            previewVisible: true
        });
    };

    const handleChange = ({ fileList }: {fileList: UploadFile[]}) => {
        setState({
            ...state,
            fileList
        });
    };

    return (
        <div className="clearfix">
            <Upload
                action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
                listType="picture-card"
                fileList={state.fileList}
                onPreview={void handlePreview}
                onChange={handleChange}
                onRemove={file => removeAttachment(file)}
            />
            <Modal
                visible={state.previewVisible}
                footer={null}
                onCancel={handleCancel}
            >
                <img alt="example" style={{ width: "100%" }} src={state.previewImage} />
            </Modal>
        </div>
    );
};

export default UploadFiles;