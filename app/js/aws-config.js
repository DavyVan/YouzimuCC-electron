module.exports = {
    region_available: [
        {region_name: 'US_East_Ohio',               region_name_cn: '美国东部 (俄亥俄)',            region: 'us-east-2', endpoint: 'transcribe.us-east-2.amazonaws.com'},
        {region_name: 'US_East_Virginia_North',     region_name_cn: '美国东部 (弗吉尼亚北部)',      region: 'us-east-1', endpoint: 'transcribe.us-east-1.amazonaws.com'},
        {region_name: 'US_West_California_North',   region_name_cn: '美国西部 (加利福尼亚北部)',    region: 'us-west-1', endpoint: 'transcribe.us-west-1.amazonaws.com'},
        {region_name: 'US_West_Oregon',             region_name_cn: '美国西部 (俄勒冈)',            region: 'us-west-2', endpoint: 'transcribe.us-west-2.amazonaws.com'},
        {region_name: 'Asia_Pacific_Bombay',        region_name_cn: '亚太区域 (孟买)',              region: 'ap-south-1', endpoint: 'transcribe.ap-south-1.amazonaws.com'},
        {region_name: 'Asia_Pacific_Seoul',         region_name_cn: '亚太区域 (首尔)',              region: 'ap-northeast-2', endpoint: 'transcribe.ap-northeast-2.amazonaws.com'},
        {region_name: 'Asia_Pacific_Singapore',     region_name_cn: '亚太地区 (新加坡)',            region: 'ap-southeast-1', endpoint: 'transcribe.ap-southeast-1.amazonaws.com'},
        {region_name: 'Asia_Pacific_Sydney',        region_name_cn: '亚太地区 (悉尼)',              region: 'ap-southeast-2', endpoint: 'transcribe.ap-southeast-2.amazonaws.com'},
        {region_name: 'Canada_Central',             region_name_cn: '加拿大（中部)',                region: 'ca-central-1', endpoint: 'transcribe.ca-central-1.amazonaws.com'},
        {region_name: 'Europe_Frankfurt',           region_name_cn: '欧洲 (法兰克福)',              region: 'eu-central-1', endpoint: 'transcribe.eu-central-1.amazonaws.com'},
        {region_name: 'Europe_Ireland',             region_name_cn: '欧洲 (爱尔兰)',                region: 'eu-west-1', endpoint: 'transcribe.eu-west-1.amazonaws.com'},
        {region_name: 'Europe_London',              region_name_cn: '欧洲 (伦敦)',                  region: 'eu-west-2', endpoint: 'transcribe.eu-west-2.amazonaws.com'},
        {region_name: 'Europe_Paris',               region_name_cn: '欧盟 (巴黎)',                  region: 'eu-west-3', endpoint: 'transcribe.eu-west-3.amazonaws.com'},
        {region_name: 'SouthAmerica_StPaul',        region_name_cn: '南美洲 (圣保罗)',              region: 'sa-east-1', endpoint: 'transcribe.sa-east-1.amazonaws.com'}
    ],
    language_available: [
        {name_cn: '英语（美国）', name: 'en-US'},
        {name_cn: '英语（英国）', name: 'en-GB'},
        {name_cn: '英语（印度）', name: 'en-IN'},
        {name_cn: '阿拉伯语（现代标准）', name: 'ar-SA'},
        {name_cn: '法语', name: 'fr-FR'},
        {name_cn: '德语', name: 'de-DE'},
        {name_cn: '印地语（印度）', name: 'hi-IN'},
        {name_cn: '意大利语', name: 'it-IT'},
        {name_cn: '韩语', name: 'ko-KR'},
        {name_cn: '葡萄牙语（巴西）', name: 'pt-BR'},
        {name_cn: '西班牙语', name: 'es-ES'}
    ],
    s3_bucket_name_prefix: 'youzimucc-input-'    // 'prefix-region'
}