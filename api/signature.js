const crypto = require('crypto');

module.exports = (req, res) => {
    // 允许跨域访问
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // 处理预检请求
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { secretKey, uri } = req.body;
        
        if (!secretKey || !uri) {
            return res.status(400).json({ error: 'Missing secretKey or uri' });
        }
        
        // 生成时间戳和随机数
        const timestamp = Date.now().toString();
        const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        
        // 拼接内容
        const content = `${uri}&${timestamp}&${nonce}`;
        
        // 生成签名
        const hmac = crypto.createHmac('sha1', secretKey);
        hmac.update(content);
        const signature = hmac.digest('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
        
        // 返回结果
        res.status(200).json({
            signature,
            timestamp,
            nonce
        });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
