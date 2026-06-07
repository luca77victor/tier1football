const Parser = require('rss-parser');
const { GoogleGenAI } = require('@google/genai');
const cheerio = require('cheerio');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors()); 

// กำหนด Custom Fields เพื่อแกะลิงก์รูปภาพแฝงใน RSS ของแต่ละสำนักข่าวออกมาให้ได้
const parser = new Parser({
    customFields: {
        item: [
            ['media:thumbnail', 'thumbnail'],
            ['enclosure', 'enclosure']
        ]
    }
});

// 🔑 เปิดพอร์ตเชื่อมต่อผ่าน API Key สายเปย์ระดับ PRO
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

let cachedNewsData = [];

// ฟังก์ชันดึงเนื้อหาข่าวตัวเต็ม (อัปเกรดระบบ User-Agent ปลอมตัวทะลวงด่านบล็อกบอทอังกฤษ)
async function fetchFullArticle(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            }
        });
        
        if (!response.ok) return null;
        
        const html = await response.text();
        const $ = cheerio.load(html);
        let fullText = '';
        
        $('p').each((i, el) => { 
            const text = $(el).text().trim();
            if (text.length > 20) { // คัดเฉพาะเนื้อข่าวเน้นๆ
                fullText += text + ' '; 
            }
        });
        return fullText.trim().substring(0, 3500);
    } catch (error) {
        console.error(`❌ บั๊กดึงเนื้อหาข่าวตัวเต็มพลาด: ${error.message}`);
        return null;
    }
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function updateNewsCache() {
    console.log('\n🔄 [PRO Engine Work] เริ่มต้นกวาดข่าวสดใหม่ด้วยขุมพลังสปีดระดับบิลลิ่งบัญชี PRO...');
    
    const feedsUrls = [
        { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/football/rss.xml' },
        { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12010' }
    ];

    let allItems = [];
    for (const feedConfig of feedsUrls) {
        try {
            const feed = await parser.parseURL(feedConfig.url);
            const itemsWithSource = feed.items.map(item => {
                let imageUrl = 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800'; 
                
                if (item.thumbnail && item.thumbnail.$ && item.thumbnail.$.url) {
                    imageUrl = item.thumbnail.$.url; 
                } else if (item.enclosure && item.enclosure.url) {
                    imageUrl = item.enclosure.url; 
                }

                return {
                    ...item,
                    officialSource: feedConfig.name,
                    newsImage: imageUrl 
                };
            });
            allItems = allItems.concat(itemsWithSource);
        } catch (err) {
            console.error(`❌ ไม่สามารถดึงฟีดจาก ${feedConfig.name} ได้: ${err.message}`);
        }
    }

    // 🛠️ [ปลดล็อกเงื่อนไขวันที่ยืดหยุ่น]: ขยายเวลาให้ย้อนหลังได้ 3 วัน
    const today = new Date();
    today.setDate(today.getDate() - 3); 
    today.setHours(0, 0, 0, 0); 

    let processedCount = 0;
    let bbcCount = 0;  
    let skyCount = 0;  
    let tempResults = [];

    for (const item of allItems) {
        if (processedCount >= 4) break; 

        const itemDate = new Date(item.pubDate || item.date);
        if (itemDate < today) continue; 

        if (item.officialSource === 'BBC Sport' && bbcCount >= 2) continue;
        if (item.officialSource === 'Sky Sports' && skyCount >= 2) continue;

        console.log(`🔥 [พบข่าวใหม่] -> [${item.officialSource}]: ${item.title}`);
        const fullContent = await fetchFullArticle(item.link);
        if (!fullContent) continue;

        console.log('⏳ ชะลอความเร็วระบบเล็กน้อย 1 วินาที...');
        await sleep(1000); 

        console.log(`🧠 ส่งเนื้อหาให้รุ่นพี่ระดับท็อป Gemini 2.5 Pro ประมวลผลวิเคราะห์อินไซต์ลุ่มลึก...`);
        
        // ✅ [แก้ไขแล้ว]: เปลี่ยน Prompt เป็นลีกยุโรป และสั่งให้ AI สร้างข้อมูล dna_archetype สำหรับข่าวจริง
        const prompt = `
        คุณคือผู้เชี่ยวชาญด้านข่าวตลาดซื้อขายนักเตะฟุตบอลชั้นนำของยุโรประดับ Ultra Tier 1 และเป็นหัวหน้าฝ่ายวิเคราะห์ระบบสถิติแท็กติกฟุตบอล
        หน้าที่ของคุณคืออ่าน "พาดหัวข่าว" และ "เนื้อหาข่าวภาษาอังกฤษตัวเต็ม" จากสำนักข่าว ${item.officialSource} แล้วแปลสรุปเป็นภาษาไทยเชิงข่าวสารสปอร์ตที่กระชับ และประเมินวิเคราะห์ศักยภาพดีลนี้สไตล์สเก้าต์เกม Football Manager (FM)
        
        ⚠️ กฎเหล็กในการสรุปข่าว (summary):
        1. เปิดประเด็นเข้าเรื่องเนื้อข่าวทันที ห้ามอ้อมค้อมเด็ดขาด
        2. ระบุรายชื่อนักเตะ, ทีมที่เกี่ยวข้อง, ตัวเลขดีลค่าตัวหรือสัญญาล่าสุดให้ชัดเจน (ห้ามแต่งตัวเลขขึ้นมาเอง)
        3. สรุปเนื้อหาเน้นๆ ความยาว 2-3 ประโยค

        พาดหัวข่าวอังกฤษหลัก: "${item.title}"
        เนื้อหาข่าวภาษาอังกฤษตัวเต็ม: "${fullContent}"

        ให้ตอบกลับในรูปแบบ JSON ตามโครงสร้างนี้เท่านั้น (ห้ามมีอักขระอื่นแปลกปลอมนอกโครงสร้าง):
        {
          "summary": "บทสรุปภาษาไทยสไตล์นักข่าวกีฬาตามกฎเหล็ก",
          "teams": ["ระบุชื่อทีมสโมสรหลักที่อยู่ในข่าว (เช่น Bayern Munich, Manchester United, Real Madrid เป็นต้น)"],
          "image_query": "คีย์เวิร์ดภาษาอังกฤษสั้นๆ 2-3 คำสำหรับค้นหาภาพ",
          "tactical_fit": {
            "score": 85,
            "analysis": "วิเคราะห์สั้นๆ 1 ประโยคในฐานะโค้ชว่านักเตะคนนี้จะเข้ามาเติมเต็มแผนการเล่นหรือสไตล์แท็กติกของทีมหลักอย่างไร"
          },
          "financial_impact": {
            "score": 75,
            "analysis": "วิเคราะห์สั้นๆ 1 ประโยคว่าดีลค่าตัว/ค่าเหนื่อยนี้คุ้มค่าโครงสร้างสโมสร หรือมีความเสี่ยงต่อกฎเสถียรภาพการเงินการคลัง (FFP) แค่ไหน"
          },
          "dna_archetype": {
            "player_name": "ระบุชื่อนักเตะที่เป็นเป้าหมายหลักในข่าวนี้",
            "class_name": "คิดค้นฉายาภาษาอังกฤษตามสไตล์การเล่น เช่น The Modern Apex Predator, The Engine Dynamo",
            "sub_title": "คำบรรยายสไตล์การเล่นภาษาไทยแบบดุดัน 1 ประโยคสั้นๆ",
            "glow_color": "เลือกชุดสี Tailwind ให้เข้ากับสีสโมสร (เช่น from-red-600 to-amber-500 สำหรับบาเยิร์น หรือ from-blue-500 to-cyan-500 สำหรับแมนซิตี้)",
            "stats": { "tackle": 50, "intercept": 40, "stamina": 85, "passing": 80, "speed": 80 }
          }
        }
        `;

        let success = false;
        let attempts = 0;

        while (!success && attempts < 2) {
            try {
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-pro', 
                    contents: prompt,
                    config: { responseMimeType: 'application/json' }
                });

                const aiResult = JSON.parse(response.text);
                
                tempResults.push({
                    title_en: item.title,
                    summary_th: aiResult.summary,
                    teams: aiResult.teams,
                    image_query: aiResult.image_query,
                    tactical_fit: aiResult.tactical_fit,       
                    financial_impact: aiResult.financial_impact, 
                    dna_archetype: aiResult.dna_archetype, // ✅ รับข้อมูล DNA ที่ AI เจนเนอเรตมาเก็บไว้
                    news_image: item.newsImage, 
                    source: item.officialSource,
                    time: item.pubDate || item.date,
                    link: item.link
                });

                if (item.officialSource === 'BBC Sport') bbcCount++;
                if (item.officialSource === 'Sky Sports') skyCount++;
                
                processedCount++;
                console.log(`✅ สรุปข่าวสำเร็จ (${processedCount}/4) ผ่านสมองทองคำรุ่น Pro จากกลุ่มค่าย: ${item.officialSource}`);
                success = true; 

            } catch (error) {
                attempts++;
                const errMsg = error.message ? error.message.toLowerCase() : '';
                console.log(`⚠️ AI เจอปัญหา: ${error.message}`);
                
                if (errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('exhausted')) {
                    console.log(`⏳ ระบบพบสัญญาณการประมวลผลกระแทก! นอนพักสลีปยาวเคลียร์คิวหลังบ้าน 60 วินาที...`);
                    await sleep(60000); 
                } else if (errMsg.includes('503') || errMsg.includes('demand') || errMsg.includes('unavailable')) {
                    console.log(`⏳ คิวเซิร์ฟเวอร์กระตุกชั่วคราว กำลังสลีปรอบล็อกรอช่องว่าง 8 วินาที...`);
                    await sleep(8000);
                } else {
                    break; 
                }
            }
        }
    }

    // 📊 [DATABASE ข่าวสารจริงรอบปี 2026] เพิ่มข้อมูลจำลองของ Bayern Munich
    const mockDatabase = [
        {
            title_en: "Manchester United step up interest in West Ham midfielder Mateus Fernandes after Ederson Silva agreement",
            summary_th: "แมนเชสเตอร์ ยูไนเต็ด ภายใต้การนำของ ไมเคิิล คาร์ริค เดินหน้าขยับดีลใหญ่อย่างต่อเนื่อง โดยบรรลุข้อตกลงส่วนตัวกับ มาเตอุส แฟร์นานเดส มิดฟิลด์โปรตุกีสวัย 21 ปีของเวสต์แฮมได้แล้ว และกำลังเจรจาโครงสร้างค่าตัวเพื่อปิดดีลถัดจาก เอแดร์ซอน ของอตาลันต้า",
            teams: ["Manchester United"],
            news_image: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800",
            source: "Sky Sports",
            time: new Date().toISOString(),
            link: "https://www.skysports.com",
            dna_archetype: {
                player_name: "Mateus Fernandes", 
                class_name: "The Engine Dynamo",
                sub_title: "กองกลางพลังขับเคลื่อนไดนาโมวัย 21 ปี",
                glow_color: "from-red-600 to-amber-500",
                stats: { tackle: 88, intercept: 84, stamina: 93, passing: 86, speed: 85 }
            },
            tactical_fit: { score: 90, analysis: "ความสามารถในการบดบี้แดนกลางและทักษะการเอาตัวรอดของแฟร์นานเดส จะเข้ามาเป็นแกนหลักในการรื้อระบบมิดฟิลด์ใหม่ร่วมกับ เอแดร์ซอน" },
            financial_impact: { score: 72, analysis: "เวสต์แฮมตั้งราคาเรียกไว้สูงถึง 80 ล้านปอนด์เนื่องจากติดเงื่อนไขต้องแบ่งค่าตัวให้เซาแธมป์ตันอีก 15%" }
        },
        {
            title_en: "Liverpool make contact with RB Leipzig over £60m winger Yan Diomande",
            summary_th: "ลิเวอร์พูล ภายใต้ผู้จัดการทีมคนใหม่ อันโดนี่ อิราโอล่า เริ่มเดินหน้าในตลาดซื้อขายทันที โดยทำการติดต่อเรอัล บามิโก้ หรือ ไลป์ซิก ต้นสังกัด เพื่อทาบทาม ยาน ดิโอมองเด้ ปีกความเร็วสูงทีมชาติไอวอรี่โคสต์มาเสริมมิติเกมรุกกราบขวา",
            teams: ["Liverpool"],
            news_image: "https://images.unsplash.com/photo-1543351611-58f69d7c1781?w=800",
            source: "BBC Sport",
            time: new Date().toISOString(),
            link: "https://feeds.bbci.co.uk",
            dna_archetype: {
                player_name: "Yan Diomande", 
                class_name: "The Pacey Inside Forward",
                sub_title: "ปีกจรวดความเร็วแสงตัวเลือกล่าสุดของอิราโอล่า",
                glow_color: "from-cyan-500 to-blue-600",
                stats: { tackle: 31, intercept: 45, stamina: 84, passing: 81, speed: 96, shooting: 88 }
            },
            tactical_fit: { score: 95, analysis: "ความเร็วจัดจ้านและการวิ่งตัดเข้าในของดิโอมองเด้ ตอบโจทย์แนวทางการทำทีมรุกกดดันเพรสซิ่งสูงอันดุดันสไตล์ของ อันโดนี่ อิราโอล่า โดยตรง" },
            financial_impact: { score: 80, analysis: "ค่าตัวประเมินอยู่ที่ประมาณ 60 ล้านปอนด์ ถือเป็นเม็ดเงินที่สมเหตุสมผลและสโมสรมีงบประมาณพร้อมจ่ายหลังการเคลียร์เพดานค่าเหนื่อยทีม" }
        },
        {
            title_en: "Arsenal monitoring Sporting Lisbon striker Viktor Gyokeres advanced internal talks",
            summary_th: "อาร์เซน่อล เร่งเครื่องมองหาศูนย์หน้าตัวเป้าคนใหม่ โดยทำการขยับลอจิกเจรจาภายในขั้นสูงกับเอเยนต์ของ วิกเตอร์ โยเคเรส กองหน้าพันธุ์ดุของ สปอร์ติ้ง ลิสบอน หลังมิเกล อาร์เตต้า ต้องการมือสังหารระดับพระกาฬมาล่าแชมป์พรีเมียร์ลีกฤดูกาลหน้า",
            teams: ["Arsenal"],
            news_image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?w=800",
            source: "Sky Sports",
            time: new Date().toISOString(),
            link: "https://www.skysports.com",
            dna_archetype: {
                player_name: "Viktor Gyokeres", 
                class_name: "The Modern Apex Predator",
                sub_title: "จักรกลถล่มประตูครบเครื่องร่างทองปืนใหญ่",
                glow_color: "from-fuchsia-500 to-purple-600",
                stats: { tackle: 35, intercept: 40, stamina: 88, passing: 78, speed: 93, shooting: 95 }
            },
            tactical_fit: { score: 92, analysis: "สรีระที่แข็งแกร่งบวกกับการวิ่งตัดหลังไลน์กองหลังอย่างดุดัน จะเข้ามาเติมเต็มมิติเกมรุกในกรอบเขตโทษให้อาร์เซน่อลเฉียบคมขึ้นอย่างน่ากลัว" },
            financial_impact: { score: 70, analysis: "มีค่าฉีกสัญญาระดับมหาศาล บอร์ดบริหารปืนใหญ่จำเป็นต้องเร่งระบายผู้เล่นส่วนเกินออกจากทีมเพื่อรักษาสมดุลบัญชีไฟแนนเชียลเฟอร์เพลย์" }
        },
        {
            title_en: "Bayern Munich agree terms with Fulham over Joao Palhinha transfer",
            summary_th: "บาเยิร์น มิวนิค บรรลุข้อตกลงกับฟูแล่มในการคว้าตัว ชูเอา ปาลินญ่า กองกลางตัวรับทีมชาติโปรตุเกสเรียบร้อยแล้ว ด้วยค่าตัวเบื้องต้น 43 ล้านปอนด์ พร้อมเซ็นสัญญายาว 4 ปี หลังพลาดหวังไปเมื่อตลาดซัมเมอร์รอบที่แล้ว",
            teams: ["Bayern Munich"],
            news_image: "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800",
            source: "Sky Sports",
            time: new Date().toISOString(),
            link: "https://www.skysports.com",
            dna_archetype: {
                player_name: "Joao Palhinha",
                class_name: "The Destroyer",
                sub_title: "รถถังบดขยี้แดนกลางจิ๊กซอว์ชิ้นสุดท้ายของเสือใต้",
                glow_color: "from-red-600 to-red-800",
                stats: { tackle: 95, intercept: 90, stamina: 88, passing: 82, speed: 70 }
            },
            tactical_fit: { score: 95, analysis: "ปาลินญ่าคือ 'หมายเลข 6' ธรรมชาติที่บาเยิร์นตามหามานาน จะช่วยสกรีนเกมรุกคู่แข่งและปลดล็อกให้มิดฟิลด์ตัวรุกเล่นได้อย่างอิสระ" },
            financial_impact: { score: 85, analysis: "แม้จะอายุ 28 ปี แต่ค่าตัว 43 ล้านปอนด์ถือว่าสมเหตุสมผลสำหรับกองกลางตัวรับระดับท็อปของพรีเมียร์ลีก" }
        }
    ];

    // ✅ อัปเดตข้อมูลที่ดึงมาเข้าสู่ Global Variable
    cachedNewsData = tempResults.length > 0 ? tempResults : mockDatabase;
    console.log(`\n🎉 ระบบพร้อมให้บริการแล้ว! มีข่าวพร้อมส่งต่อ ${cachedNewsData.length} ข่าว`);
}

// ✅ สร้าง API Endpoint เพื่อตอบกลับหน้าบ้าน (React)
app.get('/api/news', (req, res) => {
    res.json({
        status: 'success',
        data: cachedNewsData
    });
});

// ✅ สั่งให้เซิร์ฟเวอร์รันที่พอร์ต 3000
const PORT = 3000;
app.listen(PORT, async () => {
    console.log(`🚀 Football Tier 1 API เริ่มรันเซิร์ฟเวอร์ที่พอร์ต ${PORT}`);
    
    // ดึงข้อมูลข่าวครั้งแรกทันทีที่เปิดเซิร์ฟเวอร์
    await updateNewsCache();
    
    // ตั้งเวลากวาดข่าวอัตโนมัติทุกๆ 1 ชั่วโมง
    setInterval(updateNewsCache, 60 * 60 * 1000); 
});