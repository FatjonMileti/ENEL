import _ from 'lodash';
import moment from 'moment';
import auth from 'services/auth';
import * as _config from './config';

export const config = _config;

export function getPlaylistPreviewUrl(playlist) {
    return `${config.SERVER_URL}/screen/preview/${playlist.id}`;
}

export function getScreenUrl(screen) {
    return `${config.SERVER_URL}/screen/${screen.id}`;
}

export const DATE_FORMAT = 'DD-MM-YYYY';
export function formatDate(val, format = DATE_FORMAT) {
    return moment(val).format(format);
}

export const DATETIME_FORMAT = 'DD-MM-YYYY HH:mm';
export function formatDatetime(val, format = DATETIME_FORMAT) {
    return formatDate(val, format);
}

/* eslint-disable */
// -- analytics --
export function weekInterval(flag) {
    let startDate = new Date();
    // hours are borrrrrring ...
    startDate = new Date(startDate.toDateString());
    const d = new Date(+startDate);
    let endDate = new Date(d.setDate(d.getDate() - 7));

    if (flag === 'start') {
        return startDate;
    } else if (flag === 'end') {
        return endDate;
    }
    return { startDate, endDate };
}

export function extractDataSet(obj) {
    const a = [];
    switch (obj.slug) {
    case 'dataSet':
        if (obj.item.analytics.dataSet.length === 0) {
            return [0];
        }
        obj.labels.forEach((d) => {
            const date = new Date(d);
            obj.item.analytics.dataSet.forEach((o) => {
                if (new Date(o.date).toDateString() === date.toDateString()) {
                    a.push(o.total);
                } else {
                    a.push(0);
                }
            });
        });
        return a;
    case 'total':
        return obj.item.analytics.dataSet.reduce((ac, c) => ac + c.total, 0);
    }
}

export function checkForIntervalChanges(objs) {
    const h = d => d.toDateString();
    const { startDate: sd, endDate: ed } = objs.interval;
    const { startDate: nsd, endDate: ned } = objs.nextInterval;
    if (h(sd) !== h(nsd) || h(ed) !== h(ned)) {
        return true;
    }
    return false;
}
/* eslint-enable */

export function createLabels(interval) {
    const sd = new Date(interval.startDate);
    const ed = new Date(interval.endDate);
    const i = [];
    while (ed <= sd) {
        i.push(`${ed.getFullYear()}-${ed.getMonth() + 1}-${ed.getDate()}`);
        ed.setDate(ed.getDate() + 1);
    }
    return i;
}
// -- analytics --

export function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function isFetched(v) {
    return typeof v !== 'undefined' && _.size(v) > 0;
}

export function getDropzonePreview(input) {
    if (input instanceof File) {
        return _.get(input, 'preview');
    } else if (typeof input === 'string') {
        return input;
    }

    return null;
}

export function getEmailCampaignPreview(item) {
    if (!item || typeof item !== 'object') {
        return null;
    }

    const id = item.emailTemplateId || item.TemplateID;
    if (!id) {
        return null;
    }

    const token = auth.getLocalAccessToken();

    return `${config.SERVER_URL}/api/v1/email_campaign/preview/${id}?access_token=${token.value}`;
}

export function getWelcomeScreenDownloadPage(id) {
    if (!id) {
        return null;
    }

    const token = auth.getLocalAccessToken();
    return `${config.SERVER_URL}/api/v1/welcome_screen/${id}/download_html?access_token=${token.value}`;
}

export function getWelcomeScreenPreview(id) {
    return `${config.SERVER_URL}/welcomeScreen/${id}`;
}

export function prevent(e) {
    if (!e) {
        return;
    }

    e.preventDefault();
    e.stopPropagation();
}

export function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    const sliceSize = 512;
    const byteCharacters = atob(base64Data);
    const bytesLength = byteCharacters.length;
    const slicesCount = Math.ceil(bytesLength / sliceSize);
    const byteArrays = new Array(slicesCount);

    for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        const begin = sliceIndex * sliceSize;
        const end = Math.min(begin + sliceSize, bytesLength);

        const bytes = new Array(end - begin);
        for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

export function dataURLtoBlob(dataURL, contentType) {
    return base64toBlob(dataURL.replace(/(.*?)base64,/, ''), contentType);
}

export function dataURLtoFile(dataURL, filename) {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
}


export const bytesToMegaBytes = bytes => bytes / (1024 * 1024);


export function isLessOrEqual45Days(date) {
    const dateToCheck = moment(date);
    const today = moment();
    const dateIn45Days = today.add(45, 'days');

    return dateToCheck.isSameOrBefore(dateIn45Days);
}

export function isGreaterThan45Days(date) {
    const dateToCheck = moment(date);
    const today = moment();
    const dateIn45Days = today.clone().add(45, 'days');

    return dateToCheck.isAfter(dateIn45Days);
}
