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

// 📊 [DATABASE ข่าวจริงสดใหม่จาก RSS Feeds] เริ่มต้นด้วยอาร์เรย์ว่างและโหลดข่าวจริงทันทีที่เซิร์ฟเวอร์เริ่มรัน
let cachedNewsData = [];

// ฟังก์ชันดึงเนื้อหาข่าวตัวเต็ม (อัปเกรดระบบ User-Agent ปลอมตัวทะลวงด่านบล็อกบอทอังกฤษ)
async function fetchFullArticle(url) {
    try {
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.5'
            },
            signal: AbortSignal.timeout(4000)
        });
        
        if (!response.ok) return null;
        
        const html = await response.text();
        const $ = cheerio.load(html);
        let fullText = '';
        
        $('p').each((i, el) => { 
            const text = $(el).text().trim();
            if (text.length > 20) { 
                fullText += text + ' '; 
            }
        });
        const sanitized = fullText.replace(/[\u0000-\u0009\u000B\u000C\u000E-\u001F\u7F-\u009F]/g, ' ').replace(/\s+/g, ' ').trim();
        return sanitized.length > 50 ? sanitized.substring(0, 3000) : null;
    } catch (error) {
        console.error(`❌ บั๊กดึงเนื้อหาข่าวตัวเต็มพลาด: ${error.message}`);
        return null;
    }
}

function safeParseJSON(str) {
    if (!str) return null;
    let clean = String(str)
        .replace(/^\uFEFF/, '')
        .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u00A0]/g, ' ')
        .trim();
    clean = clean.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
    const firstBrace = clean.indexOf('{');
    const lastBrace = clean.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        clean = clean.substring(firstBrace, lastBrace + 1);
    }
    try {
        return JSON.parse(clean);
    } catch (e) {
        console.error(`❌ JSON Parse Error: ${e.message}`);
        return null;
    }
}

async function updateNewsCache() {
    console.log('\n🔄 [PRO Engine Work] เริ่มต้นกวาดข่าวจริงสดใหม่จาก RSS Feeds (BBC & Sky Sports)...');
    
    const feedsUrls = [
        { name: 'BBC Sport', url: 'https://feeds.bbci.co.uk/sport/football/rss.xml' },
        { name: 'Sky Sports', url: 'https://www.skysports.com/rss/12010' }
    ];

    let allItems = [];
    for (const feedConfig of feedsUrls) {
        try {
            const feed = await parser.parseURL(feedConfig.url);
            const candidateItems = feed.items.slice(0, 8);
            const itemsWithSource = candidateItems.map(item => {
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

    const maxItems = 6; 
    let processedCount = 0;
    let bbcCount = 0;  
    let skyCount = 0;  
    let tempResults = [];

    for (const item of allItems) {
        if (processedCount >= maxItems) break; 

        if (item.officialSource === 'BBC Sport' && bbcCount >= 3) continue;
        if (item.officialSource === 'Sky Sports' && skyCount >= 3) continue;

        console.log(`🔥 [พบข่าวจริงสดใหม่] -> [${item.officialSource}]: ${item.title}`);
        
        const rawText = item.contentSnippet || item.content || item.summary || item.title || '';
        const fullContent = rawText.replace(/[\u0000-\u001F\u7F-\u009F]/g, ' ').replace(/\s+/g, ' ').trim();

        console.log(`🧠 ส่งเนื้อหาให้ Gemini 2.5 Flash แปลและวิเคราะห์สองภาษา...`);
        
        const prompt = `
        คุณคือผู้เชี่ยวชาญด้านข่าวตลาดซื้อขายและข่าวฟุตบอลยุโรประดับ Ultra Tier 1
        หน้าที่ของคุณคืออ่าน "พาดหัวข่าว" และ "เนื้อหาข่าวภาษาอังกฤษ" จริงจากสำนักข่าว ${item.officialSource} แล้วแปลและสรุปเป็นสองภาษา (อังกฤษ และ แปลภาษาไทย) ที่กระชับ และประเมินวิเคราะห์ศักยภาพดีลนี้สไตล์สเก้าต์เกม Football Manager (FM)
        
        ⚠️ กฎเหล็กในการสรุปข่าว:
        1. title_th ต้องแปลพาดหัวข่าวอังกฤษเป็นพาดหัวข่าวภาษาไทยสไตล์สปอร์ตให้อ่านง่าย กระชับ และน่าติดตาม (ห้ามใส่ภาษาอังกฤษซ้ำ)
        2. summary_th ต้องแปลและสรุปเนื้อหาข่าวเป็นภาษาไทยเต็มรูปแบบ 2-3 ประโยค (ห้ามส่งข้อความภาษาอังกฤษกลับมาใน summary_th)
        3. summary_en คือสรุปเนื้อหาเน้นๆ ภาษาอังกฤษ 2-3 ประโยค
        4. ระบุรายชื่อนักเตะ, ทีมที่เกี่ยวข้องตามเนื้อข่าวจริง

        พาดหัวข่าวอังกฤษหลัก: "${item.title}"
        เนื้อหาข่าวภาษาอังกฤษ: "${fullContent}"

        ให้ตอบกลับในรูปแบบ JSON ตามโครงสร้างนี้เท่านั้น (ห้ามมีอักขระอื่นแปลกปลอมนอกโครงสร้าง):
        {
          "title_th": "แปลพาดหัวข่าวเป็นภาษาไทยที่กระชับน่าติดตาม",
          "summary_en": "Concise 2-3 sentence sports news summary in English",
          "summary_th": "สรุปเนื้อหาข่าวเป็นภาษาไทยสไตล์นักข่าวกีฬา 2-3 ประโยค",
          "teams": ["ระบุชื่อทีมสโมสรหลักที่อยู่ในข่าว (เช่น Bayern Munich, Manchester United, Real Madrid, Liverpool เป็นต้น)"],
          "image_query": "คีย์เวิร์ดภาษาอังกฤษสั้นๆ 2-3 คำสำหรับค้นหาภาพ",
          "tactical_fit": {
            "score": 85,
            "analysis": "วิเคราะห์สั้นๆ 1 ประโยคภาษาไทยในฐานะโค้ชว่านักเตะ/ข่าวนี่ส่งผลต่อแผนการเล่นหรือสไตล์แท็กติกของทีมอย่างไร"
          },
          "financial_impact": {
            "score": 75,
            "analysis": "วิเคราะห์สั้นๆ 1 ประโยคภาษาไทยว่าดีล/ข่าวนี้น่าจะมีผลต่อโครงสร้างการเงินหรือสโมสรอย่างไร"
          },
          "dna_archetype": {
            "player_name": "ระบุชื่อนักเตะที่เป็นเป้าหมายหลักในข่าวนี้ (ถ้าไม่มี ให้ใส่ชื่อบุคคลหลักในข่าว)",
            "class_name": "คิดค้นฉายาภาษาอังกฤษตามสไตล์การเล่น เช่น The Modern Apex Predator, The Engine Dynamo",
            "sub_title": "คำบรรยายสไตล์การเล่นภาษาไทยแบบดุดัน 1 ประโยคสั้นๆ",
            "glow_color": "เลือกชุดสี Tailwind ให้เข้ากับสีสโมสร (เช่น from-red-600 to-amber-500)",
            "stats": { "tackle": 50, "intercept": 40, "stamina": 85, "passing": 80, "speed": 80 }
          }
        }
        `;

        let aiResult = null;
        try {
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`;
            const apiRes = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept-Encoding': 'identity'
                },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { responseMimeType: 'application/json' }
                }),
                signal: AbortSignal.timeout(25000)
            });
            
            if (apiRes.ok) {
                const responseText = await apiRes.text();
                console.log('🤖 Raw apiRes text:', responseText);
                const apiData = JSON.parse(responseText);
                const rawJsonText = apiData?.candidates?.[0]?.content?.parts?.[0]?.text;
                if (rawJsonText) {
                    aiResult = safeParseJSON(rawJsonText);
                }
            }
        } catch (error) {
            console.log(`⚠️ AI ไม่สามารถวิเคราะห์ได้: ${error.message}`);
        }

        tempResults.push({
            title_en: item.title,
            title_th: aiResult?.title_th || item.title,
            summary_en: aiResult?.summary_en || item.contentSnippet || fullContent.substring(0, 250),
            summary_th: aiResult?.summary_th || item.contentSnippet || item.title,
            teams: aiResult?.teams?.length ? aiResult.teams : ["Premier League"],
            image_query: aiResult?.image_query || "football player",
            tactical_fit: aiResult?.tactical_fit || { score: 80, analysis: "เติมเต็มมิติเกมรุกและยกระดับสมดุลของทีม" },       
            financial_impact: aiResult?.financial_impact || { score: 75, analysis: "โครงสร้างการเงินและการประเมินสโมสรเหมาะสม" }, 
            dna_archetype: aiResult?.dna_archetype || null, 
            news_image: item.newsImage, 
            source: item.officialSource,
            time: item.pubDate || item.date || new Date().toISOString(),
            link: item.link
        });

        if (item.officialSource === 'BBC Sport') bbcCount++;
        if (item.officialSource === 'Sky Sports') skyCount++;
        
        processedCount++;
        console.log(`✅ สรุปข่าวจริงสำเร็จ (${processedCount}/${maxItems}): ${item.officialSource} - ${item.title.substring(0, 40)}...`);
    }

    if (tempResults.length > 0) {
        cachedNewsData = tempResults;
    }
    console.log(`\n🎉 ระบบพร้อมให้บริการแล้ว! มีข่าวจริงสดใหม่พร้อมส่งต่อ ${cachedNewsData.length} ข่าว`);
}

// 📌 ข้อมูลการย้ายทีมทางการ 5 ลีกใหญ่ (Completed Transfers - Top 5 European Leagues)
const completedTransfers = [
    // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League
    {
        id: "tr-1",
        player_name: "Dominic Solanke",
        position: "ST (กองหน้า)",
        age: 26,
        nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England",
        from_club: "Bournemouth",
        from_flag: "🍒",
        to_club: "Tottenham Hotspur",
        to_flag: "⚪",
        fee: "£65.0M",
        fee_eur: "€76.5M",
        fee_val: 65.0,
        league: "Premier League",
        league_flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        date: "10 Aug 2024",
        contract: "2030",
        rating: 9.1,
        ai_analysis_th: "การเซ็นสัญญากองหน้าเป้าตัวจริงที่สเปอร์สตามหา ตอบโจทย์ระบบ pressing และการจบสกอร์อันเฉียบขาดของ อังเก้ โปสเตโคกลู ได้สมบูรณ์แบบ",
        ai_analysis_en: "Tottenham secures a proven Premier League striker to lead Postecoglou's high-pressing system.",
        image_query: "Dominic Solanke Tottenham Hotspur"
    },
    {
        id: "tr-2",
        player_name: "Matthijs de Ligt",
        position: "CB (กองหลังตัวกลาง)",
        age: 25,
        nationality: "🇳🇱 Netherlands",
        from_club: "Bayern Munich",
        from_flag: "🔴",
        to_club: "Manchester United",
        to_flag: "😈",
        fee: "£42.7M",
        fee_eur: "€50.0M",
        fee_val: 42.7,
        league: "Premier League",
        league_flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        date: "13 Aug 2024",
        contract: "2029",
        rating: 8.9,
        ai_analysis_th: "ปราการหลังระดับท็อปกลับมาร่วมงานกับ เอริค เทน ฮาก เติมความแข็งแกร่งและภาวะผู้นำในแนวรับปีศาจแดงได้อย่างตรงจุด",
        ai_analysis_en: "De Ligt reunites with Ten Hag to bring leadership and physical presence to Man United's defense.",
        image_query: "Matthijs de Ligt Man Utd"
    },
    {
        id: "tr-3",
        player_name: "Riccardo Calafiori",
        position: "LB / CB (กองหลัง)",
        age: 22,
        nationality: "🇮🇹 Italy",
        from_club: "Bologna",
        from_flag: "🔴🔵",
        to_club: "Arsenal",
        to_flag: "🔴",
        fee: "£42.0M",
        fee_eur: "€45.0M",
        fee_val: 42.0,
        league: "Premier League",
        league_flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        date: "29 Jul 2024",
        contract: "2029",
        rating: 9.3,
        ai_analysis_th: "ดาวรุ่งทีมชาติอิตาลีผู้เล่นได้ทั้งแบ็คซ้ายและเซ็นเตอร์ มีทักษะการออกบอลจากแนวหลัง ยกระดับมิติแนวรับของอาร์เตต้าขึ้นอีกขั้น",
        ai_analysis_en: "Versatile Italian defender enhances Arteta's build-up play and defensive flexibility.",
        image_query: "Riccardo Calafiori Arsenal"
    },
    {
        id: "tr-4",
        player_name: "Pedro Neto",
        position: "RW / LW (ปีก)",
        age: 24,
        nationality: "🇵🇹 Portugal",
        from_club: "Wolves",
        from_flag: "🐺",
        to_club: "Chelsea",
        to_flag: "🔵",
        fee: "£54.0M",
        fee_eur: "€63.0M",
        fee_val: 54.0,
        league: "Premier League",
        league_flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        date: "11 Aug 2024",
        contract: "2031",
        rating: 8.7,
        ai_analysis_th: "ปีกสายสปีดลากเลี้ยวระเบิดริมเส้น เพิ่มความอันตรายในการสวนกลับอย่างมหาศาลให้กับเชลซี",
        ai_analysis_en: "Dynamic winger adds explosive pace and 1v1 threat to Chelsea's attack.",
        image_query: "Pedro Neto Chelsea"
    },
    {
        id: "tr-5",
        player_name: "Leny Yoro",
        position: "CB (กองหลังตัวกลาง)",
        age: 18,
        nationality: "🇫🇷 France",
        from_club: "Lille",
        from_flag: "🔴",
        to_club: "Manchester United",
        to_flag: "😈",
        fee: "£52.0M",
        fee_eur: "€62.0M",
        fee_val: 52.0,
        league: "Premier League",
        league_flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        date: "18 Jul 2024",
        contract: "2029",
        rating: 9.0,
        ai_analysis_th: "เพชรเม็ดงามแนวรับปารีส แมนยูตัดหน้าเรอัล มาดริด คว้าเซ็นเตอร์อนาคตไกลมาร่วมทีมสำเร็จ",
        ai_analysis_en: "Man Utd beats Real Madrid to sign France's most promising teenage center-back.",
        image_query: "Leny Yoro Man Utd"
    },
    {
        id: "tr-6",
        player_name: "Federico Chiesa",
        position: "RW / LW (ปีก)",
        age: 26,
        nationality: "🇮🇹 Italy",
        from_club: "Juventus",
        from_flag: "⚪⚫",
        to_club: "Liverpool",
        to_flag: "🔴",
        fee: "£12.5M",
        fee_eur: "€15.0M",
        fee_val: 12.5,
        league: "Premier League",
        league_flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
        date: "29 Aug 2024",
        contract: "2028",
        rating: 9.4,
        ai_analysis_th: "ดีลสุดคุ้มค่าระดับขึ้นหิ้ง หงส์แดงได้รุกระดับยูโรในราคาประหยัดอย่างน่าเหลือเชื่อ",
        ai_analysis_en: "Bargain of the summer for Liverpool, acquiring top Euro-winning winger talent.",
        image_query: "Federico Chiesa Liverpool"
    },

    // 🇪🇸 La Liga
    {
        id: "tr-7",
        player_name: "Kylian Mbappé",
        position: "ST / LW (กองหน้า)",
        age: 25,
        nationality: "🇫🇷 France",
        from_club: "PSG",
        from_flag: "🔵🔴",
        to_club: "Real Madrid",
        to_flag: "👑",
        fee: "Free (ฟรีเอเยนต์)",
        fee_eur: "€0.0M",
        fee_val: 0.0,
        league: "La Liga",
        league_flag: "🇪🇸",
        date: "03 Jun 2024",
        contract: "2029",
        rating: 9.9,
        ai_analysis_th: "ดีลแห่งศตวรรษ ราชันชุดขาวได้หนึ่งในกองหน้าที่ดีที่สุดในโลกมาร่วมทีมแบบไม่มีค่าตัว ผสานงาน วินิซิอุส และ จู๊ด เบลลิงแฮม",
        ai_analysis_en: "Galactico deal of the decade. Real Madrid signs the world's premier forward on a free transfer.",
        image_query: "Kylian Mbappe Real Madrid"
    },
    {
        id: "tr-8",
        player_name: "Julián Álvarez",
        position: "ST / SS (กองหน้า)",
        age: 24,
        nationality: "🇦🇷 Argentina",
        from_club: "Manchester City",
        from_flag: "🩵",
        to_club: "Atlético Madrid",
        to_flag: "🔴⚪",
        fee: "€75.0M",
        fee_eur: "€75.0M",
        fee_val: 64.0,
        league: "La Liga",
        league_flag: "🇪🇸",
        date: "12 Aug 2024",
        contract: "2030",
        rating: 9.5,
        ai_analysis_th: "ดีลใหญ่ที่สุดของตราหมี ซูเปอร์สตาร์ดีกรีแชมป์โลกและแชมป์พรีเมียร์ลีก เข้ามาเป็นจิ๊กซอว์สำคัญในเกมรุกของดิเอโก้ ซิเมโอเน่",
        ai_analysis_en: "World Cup winner joins Simeone's side in Atletico's biggest marquee signing of the summer.",
        image_query: "Julian Alvarez Atletico Madrid"
    },
    {
        id: "tr-9",
        player_name: "Dani Olmo",
        position: "CAM (กองกลางตัวรุก)",
        age: 26,
        nationality: "🇪🇸 Spain",
        from_club: "RB Leipzig",
        from_flag: "🔴⚪",
        to_club: "FC Barcelona",
        to_flag: "🔵🔴",
        fee: "€55.0M",
        fee_eur: "€55.0M",
        fee_val: 47.0,
        league: "La Liga",
        league_flag: "🇪🇸",
        date: "09 Aug 2024",
        contract: "2030",
        rating: 9.2,
        ai_analysis_th: "ฮีโร่แชมป์ยูโร 2024 กลับคืนสู่เหย้าลามาเซีย สร้างมิติเกมรุกสร้างสรรค์และความยืดหยุ่นในแดนกลางให้บาร์ซ่า",
        ai_analysis_en: "Euro 2024 standout returns to his boyhood club to reinforce Barcelona's midfield creativity.",
        image_query: "Dani Olmo Barcelona"
    },
    {
        id: "tr-10",
        player_name: "Conor Gallagher",
        position: "CM (กองกลาง)",
        age: 24,
        nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England",
        from_club: "Chelsea",
        from_flag: "🔵",
        to_club: "Atlético Madrid",
        to_flag: "🔴⚪",
        fee: "€42.0M",
        fee_eur: "€42.0M",
        fee_val: 36.0,
        league: "La Liga",
        league_flag: "🇪🇸",
        date: "21 Aug 2024",
        contract: "2029",
        rating: 8.8,
        ai_analysis_th: "มิดฟิลด์สายขยันและวิ่งสู้ฟัด สไตล์การเล่นเข้าทางปรัชญาของ ซิเมโอเน่ อย่างลงตัวที่สุด",
        ai_analysis_en: "High-workrate midfielder perfectly aligns with Diego Simeone's intense tactical demands.",
        image_query: "Conor Gallagher Atletico Madrid"
    },

    // 🇮🇹 Serie A
    {
        id: "tr-11",
        player_name: "Teun Koopmeiners",
        position: "CAM / CM (กองกลาง)",
        age: 26,
        nationality: "🇳🇱 Netherlands",
        from_club: "Atalanta",
        from_flag: "🔵กระ",
        to_club: "Juventus",
        to_flag: "⚪⚫",
        fee: "€54.7M",
        fee_eur: "€54.7M",
        fee_val: 46.5,
        league: "Serie A",
        league_flag: "🇮🇹",
        date: "28 Aug 2024",
        contract: "2029",
        rating: 9.3,
        ai_analysis_th: "ดีลใหญ่แห่งฤดูกาลของม้าลาย จอมทัพดัตช์ผู้ทำประตูและแอสซิสต์ได้อย่างมหาศาล ยกระดับแดนกลางม้าลายสู่ยุคใหม่",
        ai_analysis_en: "Juventus lands premier Serie A midfielder to complete Thiago Motta's new tactical engine.",
        image_query: "Teun Koopmeiners Juventus"
    },
    {
        id: "tr-12",
        player_name: "Romelu Lukaku",
        position: "ST (กองหน้า)",
        age: 31,
        nationality: "🇧🇪 Belgium",
        from_club: "Chelsea",
        from_flag: "🔵",
        to_club: "Napoli",
        to_flag: "🩵",
        fee: "€30.0M",
        fee_eur: "€30.0M",
        fee_val: 25.5,
        league: "Serie A",
        league_flag: "🇮🇹",
        date: "29 Aug 2024",
        contract: "2027",
        rating: 9.0,
        ai_analysis_th: "การกลับมาร่วมงานกับ คอนเต้ กุนซือคู่บุญผู้ดึงศักยภาพสูงสุดของลูกากูออกมาได้เสมอ นาโปลีได้ดาวยิงตัวเป้าผู้ทรงพลัง",
        ai_analysis_en: "Lukaku reunites with Antonio Conte to spearhead Napoli's new title aspirations.",
        image_query: "Romelu Lukaku Napoli"
    },
    {
        id: "tr-13",
        player_name: "Scott McTominay",
        position: "CM / CAM (กองกลาง)",
        age: 27,
        nationality: "🏴󠁧󠁢󠁳󠁣󠁴󠁿 Scotland",
        from_club: "Manchester United",
        from_flag: "😈",
        to_club: "Napoli",
        to_flag: "🩵",
        fee: "€30.5M",
        fee_eur: "€30.5M",
        fee_val: 25.7,
        league: "Serie A",
        league_flag: "🇮🇹",
        date: "30 Aug 2024",
        contract: "2028",
        rating: 9.1,
        ai_analysis_th: "มิดฟิลด์ไดนาโมพลังพุ่งสอดเข้าทำประตู เติมมิติความแข็งแกร่งและความดุดันในแดนกลางให้นาโปลี",
        ai_analysis_en: "Goalscoring Scottish midfielder brings physicality and box-to-box presence to Serie A.",
        image_query: "Scott McTominay Napoli"
    },

    // 🇩🇪 Bundesliga
    {
        id: "tr-14",
        player_name: "Michael Olise",
        position: "RW (ปีกขวา)",
        age: 22,
        nationality: "🇫🇷 France",
        from_club: "Crystal Palace",
        from_flag: "🦅",
        to_club: "Bayern Munich",
        to_flag: "🔴",
        fee: "€53.0M",
        fee_eur: "€53.0M",
        fee_val: 45.0,
        league: "Bundesliga",
        league_flag: "🇩🇪",
        date: "07 Jul 2024",
        contract: "2029",
        rating: 9.4,
        ai_analysis_th: "ดาวรุ่งอัจฉริยะริมเส้น บาเยิร์นทุ่มคว้าปีกเชิงสูงเพื่อปฏิวัติเกมรุกยุคใหม่ภายใต้การนำของ แว็งซ็องต์ กงปานี",
        ai_analysis_en: "Bayern Munich secures top creative talent to revitalize their dynamic wing play.",
        image_query: "Michael Olise Bayern Munich"
    },
    {
        id: "tr-15",
        player_name: "João Palhinha",
        position: "CDM (กองกลางตัวรับ)",
        age: 29,
        nationality: "🇵🇹 Portugal",
        from_club: "Fulham",
        from_flag: "⚪",
        to_club: "Bayern Munich",
        to_flag: "🔴",
        fee: "€51.0M",
        fee_eur: "€51.0M",
        fee_val: 43.0,
        league: "Bundesliga",
        league_flag: "🇩🇪",
        date: "11 Jul 2024",
        contract: "2028",
        rating: 9.1,
        ai_analysis_th: "มิดฟิลด์ตัวรับสายแทคเกิลทำลายเกมคู่แข่ง เสริมความรัดกุมให้แผงมิดฟิลด์เสือใต้ตามที่รอคอยมานาน",
        ai_analysis_en: "Bayern signs world-class defensive midfielder to solidify their central midfield core.",
        image_query: "Joao Palhinha Bayern Munich"
    },
    {
        id: "tr-16",
        player_name: "Serhou Guirassy",
        position: "ST (กองหน้า)",
        age: 28,
        nationality: "🇬🇳 Guinea",
        from_club: "VfB Stuttgart",
        from_flag: "🔴⚪",
        to_club: "Borussia Dortmund",
        to_flag: "🟡⚫",
        fee: "€17.5M",
        fee_eur: "€17.5M",
        fee_val: 15.0,
        league: "Bundesliga",
        league_flag: "🇩🇪",
        date: "18 Jul 2024",
        contract: "2028",
        rating: 9.2,
        ai_analysis_th: "รองดาวซัลโวบุนเดสลีกาซีซั่นก่อน เสือเหลืองได้กองหน้าถล่มประตูระดับ 28 ลูกต่อปีในราคาสุดคุ้มค่า",
        ai_analysis_en: "Dortmund snatches high-scoring Bundesliga striker at a budget buyout clause.",
        image_query: "Serhou Guirassy Dortmund"
    },

    // 🇫🇷 Ligue 1
    {
        id: "tr-17",
        player_name: "João Neves",
        position: "CM / CDM (กองกลาง)",
        age: 19,
        nationality: "🇵🇹 Portugal",
        from_club: "Benfica",
        from_flag: "🦅",
        to_club: "PSG",
        to_flag: "🔵🔴",
        fee: "€60.0M",
        fee_eur: "€60.0M",
        fee_val: 51.0,
        league: "Ligue 1",
        league_flag: "🇫🇷",
        date: "05 Aug 2024",
        contract: "2029",
        rating: 9.5,
        ai_analysis_th: "มิดฟิลด์อัจฉริยะวัย 19 ปี เปแอสเชได้ห้องเครื่องอนาคตไกลผู้ควบคุมจังหวะเกมได้อย่างยอดเยี่ยม",
        ai_analysis_en: "PSG lands one of Europe's top teenage midfield prodigies from Benfica.",
        image_query: "Joao Neves PSG"
    },
    {
        id: "tr-18",
        player_name: "Mason Greenwood",
        position: "RW / LW / ST (กองหน้า)",
        age: 22,
        nationality: "🏴󠁧󠁢󠁥󠁮󠁧󠁿 England",
        from_club: "Manchester United",
        from_flag: "😈",
        to_club: "Marseille",
        to_flag: "⚪🔵",
        fee: "€31.6M",
        fee_eur: "€31.6M",
        fee_val: 26.8,
        league: "Ligue 1",
        league_flag: "🇫🇷",
        date: "18 Jul 2024",
        contract: "2029",
        rating: 9.1,
        ai_analysis_th: "ดาวรุ่งยิงประตูระเบิดฟอร์มในลาลีกา ย้ายร่วมทัพโอลิมปิก มาร์เซย์ ของ โรแบร์โต้ เด แซร์บี้ เพื่อระเบิดสกอร์ในลีกเอิง",
        ai_analysis_en: "De Zerbi's Marseille signs highly efficient English forward to spearhead their frontline.",
        image_query: "Mason Greenwood Marseille"
    }
];

// ✅ สร้าง API Endpoint ตอบกลับข่าวฟุตบอลสด (React)
app.get('/api/news', (req, res) => {
    res.json({
        status: 'success',
        data: cachedNewsData
    });
});

// ✅ สร้าง API Endpoint ตอบกลับการย้ายทีมทางการ 5 ลีกใหญ่
app.get('/api/transfers', (req, res) => {
    const leagueQuery = req.query.league ? String(req.query.league).toLowerCase().trim() : 'all';
    
    let filtered = completedTransfers;
    if (leagueQuery && leagueQuery !== 'all') {
        filtered = completedTransfers.filter(item => {
            const leg = item.league.toLowerCase().replace(/\s+/g, '');
            const target = leagueQuery.replace(/\s+/g, '');
            return leg.includes(target) || target.includes(leg);
        });
    }

    res.json({
        status: 'success',
        count: filtered.length,
        total_spent_gbp: filtered.reduce((acc, curr) => acc + curr.fee_val, 0).toFixed(1),
        data: filtered
    });
});

// ✅ สั่งให้เซิร์ฟเวอร์รันที่พอร์ต 5000 (เพื่อไม่ให้ชนกับเซิร์ฟเวอร์อื่นบนพอร์ต 3000)
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`🚀 Football Tier 1 API เริ่มรันเซิร์ฟเวอร์ที่พอร์ต ${PORT}`);
    
    // ดึงข้อมูลข่าวครั้งแรกทันทีที่เปิดเซิร์ฟเวอร์
    await updateNewsCache();
    
    // ตั้งเวลากวาดข่าวอัตโนมัติทุกๆ 1 ชั่วโมง
    setInterval(updateNewsCache, 60 * 60 * 1000); 
});