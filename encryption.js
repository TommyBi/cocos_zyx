const fs = require('fs');
const crypto = require('crypto');

let filePath = 'assets/config/allConf.json'
encryptionJson(filePath)

function encryptionJson(jsonName) {
    // 读取JSON文件
    fs.readFile(jsonName, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', err);
            return;
        }

        try {
            // 将JSON字符串解析为JavaScript对象
            const jsonContent = JSON.parse(data);
            //开始加密文本
            for(let country in jsonContent.language){
                let countryConfig = jsonContent.language[country]
                console.log("==>",countryConfig)
                for(let key in countryConfig){
                    let text = countryConfig[key]
                    console.log("开始加密文件==>",text)
                    countryConfig[key] = btoa(encodeURIComponent(text));
                    console.log("加密后==>",countryConfig[key])
                }
            }

            // 将修改后的对象转换回JSON字符串
            const modifiedJson = JSON.stringify(jsonContent, null, 2);

            // 将修改后的JSON字符串写入文件
            fs.writeFile(jsonName, modifiedJson, 'utf8', (err) => {
                if (err) {
                    console.error('Error writing file:', err);
                    return;
                }
                console.log('File has been successfully modified and saved.');
            });
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }
    });
}

