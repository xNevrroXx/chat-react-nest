import React, {FC, useEffect, useMemo, useState} from "react";
import {Typography} from "antd";
import * as classNames from "classnames";
// own modules
import {API_URL} from "../../http";
import {useFetch} from "../../hooks/useFetch.hook.ts";
import {truncateTheText} from "../../utils/truncateTheText.ts";
import {ILinkPreviewInfoResponse} from "../../models/IResponse/ILinkPreviewInfoResponse.ts";
// styles
import "./link-previewer.scss";

const {Text, Link} = Typography;

interface ILinkPreviewerProps {
    href: string,
    className?: string
}
const checkImage = async (path: string) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = () => reject();

        img.src = path;
    });
const LinkPreviewer: FC<ILinkPreviewerProps> = ({href, className}) => {
    const {data, request} = useFetch<ILinkPreviewInfoResponse>(API_URL + "/link-preview?url=" + href);
    const [isUseRow, setIsUseRow] = useState<boolean>(false);

    useEffect(() => {
        void request();
    }, [request]);
    
    useEffect(() => {
        if (!data || !data.image) return;

        void checkImage(data.image)
            .then(image => {
                if (image.height < image.width) return;
                setIsUseRow(true);
            });
    }, [data]);

    return useMemo(() => {
        if (!data) return;

        if (!isUseRow) {
            return (
                <div className={classNames("link-previewer", className)}>
                    <Link strong href={data.url}>{data.title}</Link>

                    <Text style={{lineHeight: "17px"}}>
                        {
                            truncateTheText({
                                text: data.description,
                                maxLength: 200
                            })
                        }
                    </Text>

                    <div className="link-previewer__image-wrapper">
                        <a
                            href={data.url}
                            title={data.title}
                        >
                            <img
                                src={data.image}
                                alt={data.title + " preview"}
                            />
                        </a>
                    </div>

                    {data.author && <Text>{data.author}</Text>}
                </div>
            );
        }

        return (
            <div className={classNames("link-previewer", "link-previewer_row", className)}>
                <div>
                    <Link strong href={data.url}>{data.title}</Link>

                    <Text style={{lineHeight: "17px"}}>
                        {
                            truncateTheText({
                                text: data.description,
                                maxLength: 80
                            })
                        }
                    </Text>

                    {data.author && <Text>{data.author}</Text>}
                </div>
                <div className="link-previewer__image-wrapper">
                    <a
                        href={data.url}
                        title={data.title}
                    >
                        <img
                            src={data.image}
                            alt={data.title + " preview"}
                        />
                    </a>
                </div>

            </div>
        );
    }, [className, data, isUseRow]);
};

export default LinkPreviewer;