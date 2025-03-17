import { isDev, svrUrlDev, svrUrlPro } from "../define/TypeDefine";

export default class HttpManager {
    baseUrl: string = '';
    constructor() {
        this.setBaseUrl();
    }

    /**
     * 设置基础URL
     */
    public setBaseUrl() {
        this.baseUrl = isDev ? svrUrlDev : svrUrlPro;
    }

    /**
     * 发送POST请求
     * @param path 请求路径
     * @param params 请求参数
     * @returns Promise
     */
    public post(path: string, params: any = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const url = this.baseUrl + path;

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            console.log('收到服务器数据', response);
                            resolve(response);
                        } catch (e) {
                            reject(new Error('解析响应数据失败'));
                        }
                    } else {
                        reject(new Error(`请求失败: ${xhr.status}`));
                    }
                }
            };

            xhr.onerror = () => {
                reject(new Error('网络请求错误'));
            };

            xhr.ontimeout = () => {
                reject(new Error('请求超时'));
            };

            xhr.open('POST', url, true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.timeout = 10000; // 10秒超时

            try {
                xhr.send(JSON.stringify(params));
            } catch (e) {
                reject(new Error('发送请求失败'));
            }
        });
    }

    /**
     * 发送GET请求
     * @param path 请求路径
     * @param params 请求参数
     * @returns Promise
     */
    public get(path: string, params: any = {}): Promise<any> {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            const queryString = Object.keys(params)
                .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
                .join('&');
            const url = this.baseUrl + path + (queryString ? `?${queryString}` : '');

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response);
                        } catch (e) {
                            reject(new Error('解析响应数据失败'));
                        }
                    } else {
                        reject(new Error(`请求失败: ${xhr.status}`));
                    }
                }
            };

            xhr.onerror = () => {
                reject(new Error('网络请求错误'));
            };

            xhr.ontimeout = () => {
                reject(new Error('请求超时'));
            };

            xhr.open('GET', url, true);
            xhr.timeout = 10000; // 10秒超时

            try {
                xhr.send();
            } catch (e) {
                reject(new Error('发送请求失败'));
            }
        });
    }
}
export const httpManager = new HttpManager();
