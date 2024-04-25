class GoHook {
    constructor() {
        // this.ajax = ajax
    }

    async start() {
        let that = this
        let spiderFeat = that.getUrlQueryVar('spiderFeat')
        switch (spiderFeat) {
            case 'sticker-maker':
                await that.hookStickerMaker();
                break;
            default :
                console.error('no match page hash');
                break;
        }
    }

    async hookStickerMaker() {
        let that = this
        let reqPrompt = ''
        let resOutput = []
        await that.sleepSecond(3);

        function onFetch(callback) {
            let logFetch = window.fetch
            window.fetch = function (input, init) {
                // 如果 input 前缀等于 /api/models/fofr/sticker-maker/versions/
                if (input.startsWith('/api/models/fofr/sticker-maker/versions/')) {
                    init.body = JSON.parse(init.body)
                    init.body.input.prompt = reqPrompt
                    init.body = JSON.stringify(init.body)
                    resOutput = []
                }

                return new Promise((resolve, reject) => {
                    logFetch(input, init)
                        .then(function (response) {
                            callback(response.clone())
                            resolve(response)
                        }, reject)
                })
            }
        }

        onFetch(response => {
            response.json()
                .then(res => {
                    if (res && res.completed_at) {
                        resOutput = res.output
                        console.log(res.output)
                    }
                })
        })

        while (true) {
            await that.sleepSecond(3);

            console.log(59);
            var settings = {
                "url": "http://127.0.0.1:31051/queue-pop",
                "method": "GET",
                "timeout": 0,
            };
            let response = await $.ajax(settings).done();
            if (!response.data || !response.data.data) {
                continue
            }

            let tempJson = JSON.parse(response.data.data)
            reqPrompt = tempJson.input.prompt
            console.log(90, reqPrompt);
            $('[form="input-form"]').click()
            while (true) {
                await that.sleepSecond(1);
                if (resOutput.length > 0) {
                    break
                }
            }

            console.log('end', resOutput)

            // $('#prompt').val('tiger')
            // await that.sleepSecond(1);
            // that.apiLog('noDebug', $('#prompt').val());
            // $('[form="input-form"]').click()
            // await that.sleepSecond(50);
            // reqPrompt = 'chicken'
            // console.debug($('[data-testid="value-output-image"]').attr('src'))
        }
    }

    saveData(postData) {
        let that = this
        if (!postData || postData.length === 0) {
            return
        }

        that.ajax({
            "url": "http://127.0.0.1:31051/bet365-spider",
            "method": "POST",
            "timeout": 0,
            "headers": {
                "Content-Type": "application/json"
            },
            "data": JSON.stringify(postData),
        });
    }

    /**
     * 只是打印，方便查看效果，不会保存数据
     */
    apiLog() {
        var logString = ''
        for (let i = 0; i < arguments.length; i++) {
            if (i > 0) {
                logString += " ";
            }
            logString += arguments[i];
        }

        console.debug(logString)

        var settings = {
            "url": "http://127.0.0.1:31051?" + logString,
            "method": "GET",
            "timeout": 0,
        };

        $.ajax(settings).done(function (response) {
            console.log(response);
        });
    }

    /**
     * 检查是否要验证码
     */
    checkCaptcha() {
        setInterval(function () {
            var documentTitle = ['Attention Required! | Cloudflare', 'Please Wait... | Cloudflare']
            if (documentTitle.indexOf(document.title) !== -1) {
                location.reload()
            }
        }, 60000)
    }

    // 生成 20 到 30 分钟之间的随机时间（单位：秒）
    generateRandomTime() {
        // 20 分钟的毫秒数
        const minTime = 20 * 60;
        // 30 分钟的毫秒数
        const maxTime = 30 * 60;
        // 生成随机时间
        return Math.floor(Math.random() * (maxTime - minTime + 1)) + minTime;
    }

    getUrlQueryVar(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');
        for (var i = 0; i < vars.length; i++) {
            var pair = vars[i].split('=');
            if (pair[0] === variable) {
                return decodeURIComponent(pair[1]);
            }
        }
        return '';
    }

    /**
     * 根据输入的时间参数生成完整的日期时间
     * 1. 输入时间是字符串，只会出现接下来24小时内的时间，比如 19:50 03:30 00:45
     * 2. 返回完整的日期，如2024-03-19 19:50
     * 4. 如果当前时间是2024-03-19 18:30，输入参数是19:50，则是当天的时间，应返回2024-03-19 19:50
     * 5. 如果当前时间是2024-03-19 18:30，输入参数是03:30，则是明天的时间，应返回2024-03-20 03:30
     * @param {string} inputTime
     * @returns {string}
     */
    generateCompleteDateTime(inputTime) {
        // 输入参数为空或者不是期望的格式，则返回空
        if (!inputTime || !/^\d{2}:\d{2}$/.test(inputTime)) {
            return '';
        }

        // 获取当前时间
        const now = new Date();
        // 解析输入时间字符串
        const [hours, minutes] = inputTime.split(':').map(str => parseInt(str));
        // 设置输入时间的小时和分钟
        const inputDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

        // 如果输入时间比当前时间晚，则日期为今天；否则为明天
        const targetDate = inputDateTime > now ? now : new Date(now.getTime() + 24 * 60 * 60 * 1000);

        // 构建完整日期时间字符串
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const date = String(targetDate.getDate()).padStart(2, '0');
        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');

        return `${year}-${month}-${date} ${hoursStr}:${minutesStr}`;
    }


    /**
     * 设置cookie
     * @param key
     * @param value
     * @param day
     */
    setCookie(key, value, day) {
        if (!day) {
            day = 1;
        }
        var d = new Date();
        d.setTime(d.getTime() + (day * 24 * 60 * 60 * 1000));
        var expires = 'expires=' + d.toGMTString();
        document.cookie = key + '=' + value + '; ' + expires;
    }

    /**
     * 获取cookie
     * @param key
     * @return {string}
     */
    getCookie(key) {
        var name = key + '=';
        var ca = document.cookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name) !== -1) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    }

    md5(string) {
        function md5_RotateLeft(lValue, iShiftBits) {
            return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
        }

        function md5_AddUnsigned(lX, lY) {
            var lX4, lY4, lX8, lY8, lResult;
            lX8 = (lX & 0x80000000);
            lY8 = (lY & 0x80000000);
            lX4 = (lX & 0x40000000);
            lY4 = (lY & 0x40000000);
            lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
            if (lX4 & lY4) {
                return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
            }
            if (lX4 | lY4) {
                if (lResult & 0x40000000) {
                    return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
                } else {
                    return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
                }
            } else {
                return (lResult ^ lX8 ^ lY8);
            }
        }

        function md5_F(x, y, z) {
            return (x & y) | ((~x) & z);
        }

        function md5_G(x, y, z) {
            return (x & z) | (y & (~z));
        }

        function md5_H(x, y, z) {
            return (x ^ y ^ z);
        }

        function md5_I(x, y, z) {
            return (y ^ (x | (~z)));
        }

        function md5_FF(a, b, c, d, x, s, ac) {
            a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_F(b, c, d), x), ac));
            return md5_AddUnsigned(md5_RotateLeft(a, s), b);
        }

        function md5_GG(a, b, c, d, x, s, ac) {
            a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_G(b, c, d), x), ac));
            return md5_AddUnsigned(md5_RotateLeft(a, s), b);
        }

        function md5_HH(a, b, c, d, x, s, ac) {
            a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_H(b, c, d), x), ac));
            return md5_AddUnsigned(md5_RotateLeft(a, s), b);
        }

        function md5_II(a, b, c, d, x, s, ac) {
            a = md5_AddUnsigned(a, md5_AddUnsigned(md5_AddUnsigned(md5_I(b, c, d), x), ac));
            return md5_AddUnsigned(md5_RotateLeft(a, s), b);
        }

        function md5_ConvertToWordArray(string) {
            var lWordCount;
            var lMessageLength = string.length;
            var lNumberOfWords_temp1 = lMessageLength + 8;
            var lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
            var lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
            var lWordArray = Array(lNumberOfWords - 1);
            var lBytePosition = 0;
            var lByteCount = 0;
            while (lByteCount < lMessageLength) {
                lWordCount = (lByteCount - (lByteCount % 4)) / 4;
                lBytePosition = (lByteCount % 4) * 8;
                lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
                lByteCount++;
            }
            lWordCount = (lByteCount - (lByteCount % 4)) / 4;
            lBytePosition = (lByteCount % 4) * 8;
            lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
            lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
            lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
            return lWordArray;
        }

        function md5_WordToHex(lValue) {
            var WordToHexValue = "", WordToHexValue_temp = "", lByte, lCount;
            for (lCount = 0; lCount <= 3; lCount++) {
                lByte = (lValue >>> (lCount * 8)) & 255;
                WordToHexValue_temp = "0" + lByte.toString(16);
                WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
            }
            return WordToHexValue;
        }

        function md5_Utf8Encode(string) {
            string = string.replace(/\r\n/g, "\n");
            var utftext = "";
            for (var n = 0; n < string.length; n++) {
                var c = string.charCodeAt(n);
                if (c < 128) {
                    utftext += String.fromCharCode(c);
                } else if ((c > 127) && (c < 2048)) {
                    utftext += String.fromCharCode((c >> 6) | 192);
                    utftext += String.fromCharCode((c & 63) | 128);
                } else {
                    utftext += String.fromCharCode((c >> 12) | 224);
                    utftext += String.fromCharCode(((c >> 6) & 63) | 128);
                    utftext += String.fromCharCode((c & 63) | 128);
                }
            }
            return utftext;
        }

        var x;
        var k, AA, BB, CC, DD, a, b, c, d;
        var S11 = 7, S12 = 12, S13 = 17, S14 = 22;
        var S21 = 5, S22 = 9, S23 = 14, S24 = 20;
        var S31 = 4, S32 = 11, S33 = 16, S34 = 23;
        var S41 = 6, S42 = 10, S43 = 15, S44 = 21;
        string = md5_Utf8Encode(string);
        x = md5_ConvertToWordArray(string);
        a = 0x67452301;
        b = 0xEFCDAB89;
        c = 0x98BADCFE;
        d = 0x10325476;
        for (k = 0; k < x.length; k += 16) {
            AA = a;
            BB = b;
            CC = c;
            DD = d;
            a = md5_FF(a, b, c, d, x[k], S11, 0xD76AA478);
            d = md5_FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
            c = md5_FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
            b = md5_FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
            a = md5_FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
            d = md5_FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
            c = md5_FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
            b = md5_FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
            a = md5_FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
            d = md5_FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
            c = md5_FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
            b = md5_FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
            a = md5_FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
            d = md5_FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
            c = md5_FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
            b = md5_FF(b, c, d, a, x[k + 15], S14, 0x49B40821);
            a = md5_GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
            d = md5_GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
            c = md5_GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
            b = md5_GG(b, c, d, a, x[k], S24, 0xE9B6C7AA);
            a = md5_GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
            d = md5_GG(d, a, b, c, x[k + 10], S22, 0x2441453);
            c = md5_GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
            b = md5_GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
            a = md5_GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
            d = md5_GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
            c = md5_GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
            b = md5_GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
            a = md5_GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
            d = md5_GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
            c = md5_GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
            b = md5_GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);
            a = md5_HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
            d = md5_HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
            c = md5_HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
            b = md5_HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
            a = md5_HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
            d = md5_HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
            c = md5_HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
            b = md5_HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
            a = md5_HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
            d = md5_HH(d, a, b, c, x[k], S32, 0xEAA127FA);
            c = md5_HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
            b = md5_HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
            a = md5_HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
            d = md5_HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
            c = md5_HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
            b = md5_HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);
            a = md5_II(a, b, c, d, x[k], S41, 0xF4292244);
            d = md5_II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
            c = md5_II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
            b = md5_II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
            a = md5_II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
            d = md5_II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
            c = md5_II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
            b = md5_II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
            a = md5_II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
            d = md5_II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
            c = md5_II(c, d, a, b, x[k + 6], S43, 0xA3014314);
            b = md5_II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
            a = md5_II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
            d = md5_II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
            c = md5_II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
            b = md5_II(b, c, d, a, x[k + 9], S44, 0xEB86D391);
            a = md5_AddUnsigned(a, AA);
            b = md5_AddUnsigned(b, BB);
            c = md5_AddUnsigned(c, CC);
            d = md5_AddUnsigned(d, DD);
        }

        return (md5_WordToHex(b) + md5_WordToHex(c)).toLowerCase();
    }

    /**
     * 睡眠
     * @param {number} duration 秒
     * @returns {Promise<unknown>}
     */
    sleepSecond(duration) {
        return new Promise(resolve => {
            setTimeout(resolve, duration * 1000);
        })
    }
}
