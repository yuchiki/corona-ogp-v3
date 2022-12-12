import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

interface Datum {
    diagnosed_date: string;
    count: number;
    missing_count?: number;
    reported_count?: number;
    weekly_gain_ratio?: number;
    untracked_percent?: number;
    weekly_average_count?: number;
}

interface TokyoCoronaData {
    date: string;
    data: Datum[];
}


const origin_url =
    "https://raw.githubusercontent.com/tokyo-metropolitan-gov/covid19/development/data/daily_positive_detail.json";


const createOGPInfoLines = (data: TokyoCoronaData, length: number): string[] => {
    const thisWeek = data.data.slice(-length);
    const lastWeek = data.data.slice(-length - 7, -7);

    const infosByDay = thisWeek.map((datum, i) => {
        return {
            date: new Date(datum.diagnosed_date),
            count: datum.count,
            ratio: datum.count / lastWeek[i].count
        }
    });

    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

    return infosByDay.map(
        dayInfo => `${dayInfo.date.getDate()}日(${weekDays[dayInfo.date.getDay()]}): ${dayInfo.count}人 (${Math.floor(dayInfo.ratio * 100)}%)`
    );
}

const createBodyInfoTable = (data: TokyoCoronaData): string => {
    const length = data.data.length - 7;

    const thisWeek = data.data.slice(-length);
    const lastWeek = data.data.slice(-length - 7, -7);

    const infosByDay = thisWeek.map((datum, i) => {
        return {
            date: new Date(datum.diagnosed_date),
            count: datum.count,
            ratio: datum.count / lastWeek[i].count
        }
    });

    const weekDays = ["日", "月", "火", "水", "木", "金", "土"];

    const lines = infosByDay.map(
        dayInfo => `
            <tr>
                <td>${dayInfo.date.getFullYear()}年${dayInfo.date.getMonth() + 1}月${dayInfo.date.getDate()}日(${weekDays[dayInfo.date.getDay()]})</td>
                <td>${dayInfo.count}人</td>
                <td>${dayInfo.ratio > 1 ? '<font color="red">' + Math.floor(dayInfo.ratio * 100) + '%</font>' : Math.floor(dayInfo.ratio * 100) + "%"}</td>
            </tr>`
    );

    return `
        <table>
            <tr>
                <th>日付</th>
                <th>新規感染者数</th>
                <th>先週比</th>
            </tr>
            ${lines.reverse().join("\n")}
        </table>`;
}

const createHTML = (data: TokyoCoronaData, length: number): string => {
    return `<!DOCTYPE HTML>
    <html xmlns="http://www.w3.org/1999/xhtml" lang="ja" xml:lang="ja" xmlns:og="http://ogp.me/ns#" xmlns:fb="http://www.facebook.com/2008/fbml">
    <head>
      <meta property="og:title" content="東京の感染者数"/>
      <meta property="og:type" content="website"/>
      <meta property="og:description" content="${createOGPInfoLines(data, length)}" ()内は先週比/>
      <meta property="og:url" content="https://raw.githubusercontent.com/tokyo-metropolitan-gov/covid19/development/data/daily_positive_detail.json"/>
      <title>東京の感染者数</title>
    </head>
    <body>
        ${createBodyInfoTable(data)}<br>
    </body>
    </html>`
}


export const lambdaHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    try {
        const tokyoCoronaDatas: TokyoCoronaData = await fetch(origin_url).then(x => x.json());
        const length = 8;

        return {
            statusCode: 200,
            body: createHTML(tokyoCoronaDatas, length),
            headers: {
                'Content-Type': 'text/html;charset=UTF-8'
            }
        };
    } catch (err) {
        console.log(err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'some error happened',
            }),
        };
    }
};
