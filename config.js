module.exports = {
    // データを投入するバケット名
    bucketName: "data1",

    // データ生成間隔(秒)
    interval: 10,

    // 生成するデータの定義
    fields: {
        temperature: {
            average: 25.0,
            variance: 5.0
        },
        humidity: {
            average: 60.0,
            variance: 10.0
        }
    }
};

