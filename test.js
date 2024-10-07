function formatDate(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

function getDateNDaysAgo(n) {
    const now = new Date(); // current date and time
    now.setDate(now.getDate() - n); // subtract n days
    return formatDate(now);
}

const dates = {
    startDate: getDateNDaysAgo(30), // alter days to increase/decrease data set
    endDate: getDateNDaysAgo(0) // leave at 1 to get yesterday's data
}

const getAPI = async (url) => {
    try {
        const res = await fetch(url, {
            method: 'GET',
        });

        if (!res.ok) {
            return res.json().then(errorData => {
                throw new HttpError(res.status, errorData.message);
            });
        }
        const data = await res.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch api', error);
    }
}

const postAPI = async (url, jsonData) => {
    const res = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonData)
    });

    if (!res.ok) {
        return res.json().then(errorData => {
            throw new HttpError(res.status, errorData.message);
        });
    }
    const data = await res.text();
    return data;
};

const cloudflare = `https://openai-api-worker.lluu3790.workers.dev`
const url = `https://api.polygon.io/v2/aggs/ticker/AAL/range/1/day/${dates.startDate}/${dates.endDate}?adjusted=true&sort=asc&apiKey=R60M8xeij33TKWT2BGVZ10rMMcH0hPL6`
const myUrl = `https://email-api-kuku20.onrender.com/stock/po/range-date?stockTicker=AAL&start=${dates.startDate}&end=${dates.endDate}`
getAPI(myUrl).then(async data => { 
    // delete data.request_id
    console.log(data)
    const x = await postAPI(cloudflare, data)

    console.log(x)
 })
