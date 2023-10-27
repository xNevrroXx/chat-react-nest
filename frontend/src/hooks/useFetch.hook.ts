import {useCallback, useState} from "react";
import axios from "axios";

export enum FetchingStatus {
    IDLE = "IDLE",
    FETCHING = "FETCHING",
    FULFILLED = "FULFILLED",
    REJECTED = "REJECTED"
}

const useFetch = <T>(url: string | undefined) => {
    const [status, setStatus] = useState<FetchingStatus>(FetchingStatus.IDLE);
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<unknown | null>(null);

    const request = useCallback(async () => {
        if (!url) return;
        setStatus(FetchingStatus.FETCHING);

        try {
            const response = await axios.get<T>(url);
            setData(response.data);
            setStatus(FetchingStatus.FULFILLED);
        } catch (error) {
            setError(error);
            setStatus(FetchingStatus.REJECTED);
        }
    }, [url]);

    const clear = useCallback(() => {
        setStatus(FetchingStatus.IDLE);
        setData(null);
        setError(null);
    }, []);

    return {status, data, error, request, clear};
};

export {useFetch};