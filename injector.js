const Nebula = require('./baas.js');
const NebulaConfig = require('./nebula_config.js');
const config = require('./config.js');

// 正規乱数
function rnorm() {
    return Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
}

// データ生成
function createData() {
    const data = {};

    for (let field in config.fields) {
        const average = config.fields[field].average;
        const variance = config.fields[field].variance;

        const value = average + rnorm() * variance;

        data[field] = value;
    }

    return data;
}

// 定期処理
function inject(bucket) {
    // データ生成
    const data = createData(config);
    console.log(data);

    // データ保存
    bucket.save(data)
        .then((obj) => {
            console.log("saved.");
        })
        .catch((error) => {
            console.log("save error: " + error);
        });
}

// ここから開始
// Initialize baas
Nebula.initialize(NebulaConfig);

const bucket = new Nebula.ObjectBucket(config.bucketName);

setInterval(() => {
    inject(bucket);
}, config.interval * 1000);
