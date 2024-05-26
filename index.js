const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const os = require('os');
const { exec } = require('child_process');

puppeteer.use(StealthPlugin());

(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-accelerated-2d-canvas',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
                '--disable-gpu'
            ]
        });

        const page = await browser.newPage();
        await page.setViewport({ width: 1280, height: 800 });

        await page.goto('https://chat.talkdrove.cc.nf/login?next=https://chat.talkdrove.cc.nf/talkdrove/Min');
        await page.waitForSelector('form.user');

        await page.type('input[name="email"]', 'Byte');
        await page.type('input[name="password"]', 'ourbotis@byte');

        await page.click('button[type="submit"]');
        await page.waitForSelector('.chat-box', { timeout: 60000 });

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Logged in successfully!');
        await sendMessage(page, 'Bot is deployed now!');
        await page.goto('https://chat.talkdrove.cc.nf/talkdrove');

        async function sendMessage(page, message) {
            await page.type('.emojionearea-editor', message);
            await page.keyboard.press('Enter');
        }

        const intervalId = setInterval(async () => {
            const messages = await page.evaluate(() => {
                const messageElements = document.querySelectorAll('.chat-txt');
                const messages = [];
                messageElements.forEach(element => {
                    messages.push(element.textContent.trim());
                });
                return messages;
            });

            if (messages.length > 0) {
                const message = messages[0];
                if (message.toLowerCase() === '/test') {
                    console.log('Sending response: Hey, Bot is working!');
                    await sendMessage(page, 'Hey, Bot is active!');
                } else if (message.toLowerCase() === '/dev') {
                    console.log('Sending response: Hamza is my developer');
                    await sendMessage(page, 'Hamza is my developer');
                } else if (message.toLowerCase() === '/about') {
                    console.log('TalkDrove:');
                    await sendMessage(page, "I'm TalkDrove Bot, my name is Byte, I'm just beta version!");
                } else if (message.toLowerCase() === '/rules') {
                    console.log('Rules: No rules!');
                    await sendMessage(page, 'Rules: No rules!');
                } else if (message.toLowerCase() === '/name') {
                    console.log('My name is Byte!');
                    await sendMessage(page, 'My name is Byte!');
                } else if (message.toLowerCase() === '/ping') {
                    const start = Date.now();
                    await sendMessage(page, 'Pinging...');
                    const end = Date.now();
                    const ping = end - start;
                    await sendMessage(page, `Pong! Response time: ${ping} ms`);
                } else if (message.toLowerCase() === '/systeminfo') {
                    const totalMem = (os.totalmem() / (1024 ** 3)).toFixed(2); // in GB
                    const freeMem = (os.freemem() / (1024 ** 3)).toFixed(2); // in GB
                    await sendMessage(page, `Total Memory: ${totalMem} GB\nFree Memory: ${freeMem} GB`);
                } else if (message.toLowerCase() === '/help') {
                    const helpMessage = `
                    Available Commands:
                    /test - Test the bot
                    /dev - Get developer info
                    /about - Get bot info
                    /rules - Get rules
                    /name - Get bot name
                    /ping - Check bot response time
                    /systeminfo - Get server memory info
                    /help - List all commands
                    `;
                    await sendMessage(page, helpMessage);
                }

                await page.evaluate(() => {
                    const messageElement = document.querySelector('.chat-txt');
                    messageElement.parentNode.removeChild(messageElement);
                });
            }
        }, 1000);
    } catch (error) {
        console.error('An error occurred:', error);
    }
})();
